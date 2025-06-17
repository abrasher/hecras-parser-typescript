// Model building stage for converting parsed data into TypeScript models
import type {
  PipelineStage,
  ParseContext,
  ParseResult,
  ParseError,
} from "./pipeline"

export interface ModelBuilder<TInput, TOutput> {
  build(input: TInput, context: ParseContext): TOutput
}

export interface ModelMapping<TInput, TOutput> {
  modelType: string
  builder: ModelBuilder<TInput, TOutput>
  condition?: (input: TInput) => boolean
}

export class ModelBuildingStage<TInput, TOutput>
  implements PipelineStage<TInput, TOutput>
{
  name = "Model_Builder"

  constructor(private mappings: ModelMapping<TInput, TOutput>[]) {}

  async process(
    input: TInput,
    context: ParseContext,
  ): Promise<ParseResult<TOutput>> {
    const errors: ParseError[] = []

    // Find the appropriate model builder
    const mapping = this.mappings.find(
      (m) => !m.condition || m.condition(input),
    )

    if (!mapping) {
      errors.push({
        message: "No suitable model builder found for input data",
        severity: "error",
        code: "NO_MODEL_BUILDER",
      })
      return {
        success: false,
        errors,
        warnings: [],
      }
    }

    try {
      const model = mapping.builder.build(input, context)

      return {
        success: true,
        data: model,
        errors,
        warnings: [],
      }
    } catch (error) {
      errors.push({
        message: `Model building failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: "error",
        code: "MODEL_BUILD_ERROR",
      })

      return {
        success: false,
        errors,
        warnings: [],
      }
    }
  }
}

// Base model builder with common utilities
export abstract class BaseModelBuilder<TInput, TOutput>
  implements ModelBuilder<TInput, TOutput>
{
  abstract build(input: TInput, context: ParseContext): TOutput

  protected extractNumber(
    value: string | number | null | undefined,
    defaultValue: number = 0,
  ): number {
    if (typeof value === "number") return value
    if (typeof value === "string") {
      const parsed = parseFloat(value.trim())
      return isNaN(parsed) ? defaultValue : parsed
    }
    return defaultValue
  }

  protected extractString(
    value: string | null | undefined,
    defaultValue: string = "",
  ): string {
    return value?.trim() || defaultValue
  }

  protected extractBoolean(
    value: string | boolean | null | undefined,
    defaultValue: boolean = false,
  ): boolean {
    if (typeof value === "boolean") return value
    if (typeof value === "string") {
      const lower = value.toLowerCase().trim()
      return lower === "true" || lower === "1" || lower === "yes"
    }
    return defaultValue
  }

  protected extractArray<T>(value: any[], transformer: (item: any) => T): T[] {
    if (!Array.isArray(value)) return []
    return value
      .map(transformer)
      .filter((item) => item !== null && item !== undefined)
  }

  protected logWarning(message: string, context: ParseContext): void {
    console.warn(`[ModelBuilder] ${message}`, {
      filePath: context.filePath,
      fileType: context.fileType,
      currentLine: context.currentLine,
    })
  }
}

// Factory for creating model builders
export class ModelBuilderFactory {
  private static builders = new Map<string, ModelBuilder<any, any>>()

  static register<TInput, TOutput>(
    key: string,
    builder: ModelBuilder<TInput, TOutput>,
  ): void {
    this.builders.set(key, builder)
  }

  static get<TInput, TOutput>(
    key: string,
  ): ModelBuilder<TInput, TOutput> | undefined {
    return this.builders.get(key) as ModelBuilder<TInput, TOutput> | undefined
  }

  static createMapping<TInput, TOutput>(
    modelType: string,
    builderKey: string,
    condition?: (input: TInput) => boolean,
  ): ModelMapping<TInput, TOutput> {
    const builder = this.get<TInput, TOutput>(builderKey)
    if (!builder) {
      throw new Error(`Model builder not found: ${builderKey}`)
    }

    return {
      modelType,
      builder,
      condition,
    }
  }
}
