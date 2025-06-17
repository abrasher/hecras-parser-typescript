// Plugin system for HECRAS file type parsers
import type {
  ParseContext,
  ParseResult,
  ParsedToken} from "./pipeline";
import {
  ParsingPipeline,
  TokenType,
} from "./pipeline"
import type { TokenizerConfig } from "./tokenizer";
import { HECRASTokenizer } from "./tokenizer"
import type { ValidationSchema } from "./validator";
import { DataValidator } from "./validator"
import type { ModelMapping } from "./modelBuilder";
import { ModelBuildingStage } from "./modelBuilder"

export interface FileTypeDetector {
  canHandle(content: string, filePath?: string): boolean
  confidence: number // 0-1, higher means more confident
  fileType: string
}

export interface SectionHandler<TInput = any, TOutput = any> {
  sectionTypes: string[]
  priority: number // Higher priority handlers are called first
  canHandle(tokens: ParsedToken[], context: ParseContext): boolean
  process(
    tokens: ParsedToken[],
    context: ParseContext,
  ): Promise<ParseResult<TOutput>>
}

export interface ParserPlugin {
  name: string
  version: string
  fileTypes: string[]
  detector: FileTypeDetector
  tokenizerConfig: TokenizerConfig
  sectionHandlers: SectionHandler[]
  validationSchemas: Map<string, ValidationSchema<any>>
  modelMappings: ModelMapping<any, any>[]

  // Lifecycle hooks
  beforeParse?(context: ParseContext): Promise<void>
  afterParse?(result: ParseResult<any>, context: ParseContext): Promise<void>
}

export class PluginRegistry {
  private plugins = new Map<string, ParserPlugin>()
  private fileTypeDetectors: FileTypeDetector[] = []

  register(plugin: ParserPlugin): void {
    this.plugins.set(plugin.name, plugin)
    this.fileTypeDetectors.push(plugin.detector)

    // Sort detectors by confidence (highest first)
    this.fileTypeDetectors.sort((a, b) => b.confidence - a.confidence)
  }

  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (plugin) {
      this.plugins.delete(pluginName)
      const detectorIndex = this.fileTypeDetectors.findIndex(
        (d) => d === plugin.detector,
      )
      if (detectorIndex >= 0) {
        this.fileTypeDetectors.splice(detectorIndex, 1)
      }
    }
  }

  detectFileType(content: string, filePath?: string): string | null {
    for (const detector of this.fileTypeDetectors) {
      if (detector.canHandle(content, filePath)) {
        return detector.fileType
      }
    }
    return null
  }

  getPlugin(name: string): ParserPlugin | undefined {
    return this.plugins.get(name)
  }

  getPluginForFileType(fileType: string): ParserPlugin | undefined {
    for (const plugin of this.plugins.values()) {
      if (plugin.fileTypes.includes(fileType)) {
        return plugin
      }
    }
    return undefined
  }

  listPlugins(): ParserPlugin[] {
    return Array.from(this.plugins.values())
  }
}

export abstract class BaseParserPlugin implements ParserPlugin {
  abstract name: string
  abstract version: string
  abstract fileTypes: string[]
  abstract detector: FileTypeDetector
  abstract tokenizerConfig: TokenizerConfig
  abstract sectionHandlers: SectionHandler[]
  abstract validationSchemas: Map<string, ValidationSchema<any>>
  abstract modelMappings: ModelMapping<any, any>[]

  async beforeParse?(context: ParseContext): Promise<void> {
    // Default implementation - can be overridden
  }

  async afterParse?(
    result: ParseResult<any>,
    context: ParseContext,
  ): Promise<void> {
    // Default implementation - can be overridden
  }

  protected createDetector(
    patterns: RegExp[],
    fileExtensions: string[],
    confidence: number,
    fileType: string,
  ): FileTypeDetector {
    return {
      fileType,
      confidence,
      canHandle: (content: string, filePath?: string) => {
        // Check file extension
        if (filePath) {
          const extension = filePath.split(".").pop()?.toLowerCase()
          if (extension && fileExtensions.includes(extension)) {
            return true
          }
        }

        // Check content patterns
        return patterns.some((pattern) => pattern.test(content))
      },
    }
  }

  protected createSectionHandler<TInput, TOutput>(
    sectionTypes: string[],
    priority: number,
    processor: (
      tokens: ParsedToken[],
      context: ParseContext,
    ) => Promise<ParseResult<TOutput>>,
    canHandleCheck?: (tokens: ParsedToken[], context: ParseContext) => boolean,
  ): SectionHandler<TInput, TOutput> {
    return {
      sectionTypes,
      priority,
      canHandle:
        canHandleCheck ||
        ((tokens) =>
          tokens.some(
            (token) =>
              token.type === TokenType.SECTION_HEADER &&
              sectionTypes.some((sectionType) =>
                token.content.toLowerCase().includes(sectionType.toLowerCase()),
              ),
          )),
      process: processor,
    }
  }
}

export class HECRASParser {
  private registry = new PluginRegistry()

  constructor() {
    // Register built-in plugins
    this.registerBuiltinPlugins()
  }

  registerPlugin(plugin: ParserPlugin): void {
    this.registry.register(plugin)
  }

  async parse<T = any>(
    content: string,
    filePath?: string,
  ): Promise<ParseResult<T>> {
    // Detect file type
    const fileType = this.registry.detectFileType(content, filePath)
    if (!fileType) {
      return {
        success: false,
        errors: [
          {
            message: "Could not detect file type",
            severity: "error",
            code: "UNKNOWN_FILE_TYPE",
          },
        ],
        warnings: [],
      }
    }

    // Get appropriate plugin
    const plugin = this.registry.getPluginForFileType(fileType)
    if (!plugin) {
      return {
        success: false,
        errors: [
          {
            message: `No plugin available for file type: ${fileType}`,
            severity: "error",
            code: "NO_PLUGIN_AVAILABLE",
          },
        ],
        warnings: [],
      }
    }

    // Create parsing context
    const context: ParseContext = {
      filePath,
      fileType,
      originalContent: content,
      lines: content.split(/\r\n|\r|\n/),
      currentLine: 0,
      metadata: {},
    }

    try {
      // Call before parse hook
      if (plugin.beforeParse) {
        await plugin.beforeParse(context)
      }

      // Create and execute parsing pipeline
      const pipeline = this.createPipeline(plugin)
      const result = await pipeline.execute(content, context)

      // Call after parse hook
      if (plugin.afterParse) {
        await plugin.afterParse(result, context)
      }

      return result as ParseResult<T>
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            message: `Parsing failed: ${error instanceof Error ? error.message : String(error)}`,
            severity: "error",
            code: "PARSING_ERROR",
          },
        ],
        warnings: [],
      }
    }
  }

  private createPipeline<T>(plugin: ParserPlugin): ParsingPipeline<string, T> {
    const pipeline = new ParsingPipeline<string, T>()

    // Add tokenization stage
    const tokenizer = new HECRASTokenizer(plugin.tokenizerConfig)
    pipeline.addStage(tokenizer)

    // Add section processing stage
    const sectionProcessor = new SectionProcessingStage(plugin.sectionHandlers)
    pipeline.addStage(sectionProcessor)

    // Add validation stages
    for (const [dataType, schema] of plugin.validationSchemas) {
      const validator = new DataValidator(schema)
      pipeline.addStage(validator)
    }

    // Add model building stage
    const modelBuilder = new ModelBuildingStage(plugin.modelMappings)
    pipeline.addStage(modelBuilder)

    return pipeline
  }

  protected registerBuiltinPlugins(): void {
    // Built-in plugins will be registered here
    // For now, we'll implement the geometry plugin separately
  }
}

// Section processing stage that delegates to section handlers
import type { PipelineStage } from "./pipeline"

export class SectionProcessingStage
  implements PipelineStage<ParsedToken[], any>
{
  name = "Section_Processor"

  constructor(private handlers: SectionHandler[]) {
    // Sort handlers by priority (highest first)
    this.handlers.sort((a, b) => b.priority - a.priority)
  }

  async process(
    tokens: ParsedToken[],
    context: ParseContext,
  ): Promise<ParseResult<any>> {
    const sections = this.groupTokensIntoSections(tokens)
    const processedData: any = {}
    const errors: any[] = []
    const warnings: any[] = []

    for (const section of sections) {
      // Find a handler that can process this section
      const handler = this.handlers.find((h) =>
        h.canHandle(section.tokens, context),
      )

      if (handler) {
        try {
          const result = await handler.process(section.tokens, context)

          if (result.success && result.data) {
            // Merge the result into processed data
            if (
              typeof result.data === "object" &&
              !Array.isArray(result.data)
            ) {
              Object.assign(processedData, result.data)
            } else {
              // If it's not an object, store it with a generated key
              const key = `section_${section.type}_${Date.now()}`
              processedData[key] = result.data
            }
          }

          errors.push(...result.errors)
          warnings.push(...result.warnings)
        } catch (error) {
          errors.push({
            message: `Section handler "${handler.sectionTypes.join(", ")}" failed: ${error instanceof Error ? error.message : String(error)}`,
            severity: "error",
            code: "SECTION_HANDLER_ERROR",
          })
        }
      } else {
        warnings.push({
          message: `No handler found for section type: ${section.type}`,
          code: "NO_SECTION_HANDLER",
        })
      }
    }

    return {
      success: errors.filter((e) => e.severity === "error").length === 0,
      data: processedData,
      errors,
      warnings,
    }
  }

  private groupTokensIntoSections(
    tokens: ParsedToken[],
  ): { type: string; tokens: ParsedToken[] }[] {
    const sections: { type: string; tokens: ParsedToken[] }[] = []
    let currentSection: { type: string; tokens: ParsedToken[] } | null = null

    for (const token of tokens) {
      if (token.type === TokenType.SECTION_HEADER) {
        // Start a new section
        if (currentSection) {
          sections.push(currentSection)
        }

        const sectionType = token.metadata?.sectionType || "unknown"
        currentSection = {
          type: sectionType,
          tokens: [token],
        }
      } else if (currentSection) {
        // Add to current section
        currentSection.tokens.push(token)
      } else {
        // No current section, create a default one
        currentSection = {
          type: "header",
          tokens: [token],
        }
      }
    }

    // Don't forget the last section
    if (currentSection) {
      sections.push(currentSection)
    }

    return sections
  }
}
