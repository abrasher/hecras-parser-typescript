// Core parsing pipeline infrastructure
export interface ParsedToken {
  type: TokenType
  content: string
  lineStart: number
  lineEnd: number
  metadata?: Record<string, any>
}

export enum TokenType {
  KEY_VALUE = "KEY_VALUE",
  DATA_BLOCK = "DATA_BLOCK",
  SECTION_HEADER = "SECTION_HEADER",
  MULTILINE_TEXT = "MULTILINE_TEXT",
  TABLE_DATA = "TABLE_DATA",
  COORDINATE_DATA = "COORDINATE_DATA",
  COMMENT = "COMMENT",
  EMPTY_LINE = "EMPTY_LINE",
}

export interface ParseContext {
  filePath?: string
  fileType: string
  originalContent: string
  lines: string[]
  currentLine: number
  metadata: Record<string, any>
}

export interface ParseResult<T = any> {
  success: boolean
  data?: T
  errors: ParseError[]
  warnings: ParseWarning[]
}

export interface ParseError {
  message: string
  line?: number
  column?: number
  severity: "error" | "warning" | "info"
  code?: string
}

export interface ParseWarning {
  message: string
  line?: number
  column?: number
  code?: string
}

export interface PipelineStage<TInput, TOutput> {
  name: string
  process(input: TInput, context: ParseContext): Promise<ParseResult<TOutput>>
}

export class ParsingPipeline<TInput, TOutput> {
  private stages: PipelineStage<any, any>[] = []

  addStage<TStageOutput>(stage: PipelineStage<any, TStageOutput>): this {
    this.stages.push(stage)
    return this
  }

  async execute(
    input: TInput,
    context: ParseContext,
  ): Promise<ParseResult<TOutput>> {
    let currentData: any = input
    const allErrors: ParseError[] = []
    const allWarnings: ParseWarning[] = []

    for (const stage of this.stages) {
      try {
        const result = await stage.process(currentData, context)

        if (!result.success) {
          allErrors.push(...result.errors)
          if (result.errors.some((e) => e.severity === "error")) {
            return {
              success: false,
              errors: allErrors,
              warnings: allWarnings,
            }
          }
        }

        allWarnings.push(...result.warnings)
        currentData = result.data
      } catch (error) {
        allErrors.push({
          message: `Pipeline stage "${stage.name}" failed: ${error instanceof Error ? error.message : String(error)}`,
          severity: "error",
          code: "PIPELINE_STAGE_ERROR",
        })
        return {
          success: false,
          errors: allErrors,
          warnings: allWarnings,
        }
      }
    }

    return {
      success: true,
      data: currentData,
      errors: allErrors,
      warnings: allWarnings,
    }
  }
}
