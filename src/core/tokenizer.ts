// Tokenization stage for HECRAS files
import type {
  PipelineStage,
  ParsedToken,
  ParseContext,
  ParseResult,
  ParseError} from "./pipeline";
import {
  TokenType
} from "./pipeline"

export interface TokenizerConfig {
  sectionHeaders: string[]
  keyValuePatterns: RegExp[]
  multilineTextMarkers: { begin: RegExp; end: RegExp }[]
  coordinatePatterns: RegExp[]
  tablePatterns: RegExp[]
}

export class HECRASTokenizer implements PipelineStage<string, ParsedToken[]> {
  name = "HECRAS_Tokenizer"

  constructor(private config: TokenizerConfig) {}

  async process(
    input: string,
    context: ParseContext,
  ): Promise<ParseResult<ParsedToken[]>> {
    const tokens: ParsedToken[] = []
    const errors: ParseError[] = []
    const lines = input.split(/\r\n|\r|\n/)

    let currentLine = 0

    while (currentLine < lines.length) {
      const line = lines[currentLine].trimEnd()

      // Skip empty lines but record them
      if (line.trim() === "") {
        tokens.push({
          type: TokenType.EMPTY_LINE,
          content: line,
          lineStart: currentLine,
          lineEnd: currentLine,
        })
        currentLine++
        continue
      }

      // Check for comments (lines starting with #)
      if (line.trimStart().startsWith("#")) {
        tokens.push({
          type: TokenType.COMMENT,
          content: line,
          lineStart: currentLine,
          lineEnd: currentLine,
        })
        currentLine++
        continue
      }

      // Check for multiline text blocks (BEGIN/END blocks)
      const multilineResult = this.parseMultilineText(lines, currentLine)
      if (multilineResult) {
        tokens.push(multilineResult.token)
        currentLine = multilineResult.nextLine
        continue
      }

      // Check for section headers
      if (this.isSectionHeader(line)) {
        tokens.push({
          type: TokenType.SECTION_HEADER,
          content: line,
          lineStart: currentLine,
          lineEnd: currentLine,
          metadata: this.extractSectionMetadata(line),
        })
        currentLine++
        continue
      }

      // Check for key-value pairs
      if (this.isKeyValuePair(line)) {
        const kvResult = this.parseKeyValueWithData(lines, currentLine)
        tokens.push(kvResult.token)
        currentLine = kvResult.nextLine
        continue
      }

      // Check for coordinate data (lines with only numbers and spaces)
      if (this.isCoordinateData(line)) {
        const coordResult = this.parseCoordinateBlock(lines, currentLine)
        tokens.push(coordResult.token)
        currentLine = coordResult.nextLine
        continue
      }

      // Check for table data (multiple columns of numbers)
      if (this.isTableData(line)) {
        const tableResult = this.parseTableBlock(lines, currentLine)
        tokens.push(tableResult.token)
        currentLine = tableResult.nextLine
        continue
      }

      // If we can't classify the line, treat it as a data block
      tokens.push({
        type: TokenType.DATA_BLOCK,
        content: line,
        lineStart: currentLine,
        lineEnd: currentLine,
        metadata: { unclassified: true },
      })
      currentLine++
    }

    return {
      success: true,
      data: tokens,
      errors,
      warnings: [],
    }
  }

  private parseMultilineText(
    lines: string[],
    startLine: number,
  ): { token: ParsedToken; nextLine: number } | null {
    const line = lines[startLine]

    // Look for BEGIN markers
    const beginMatch = line.match(/^BEGIN\s+([^:]+):?\s*$/)
    if (!beginMatch) return null

    const blockType = beginMatch[1]
    const contentLines: string[] = []
    let currentLine = startLine + 1

    // Find the corresponding END marker
    while (currentLine < lines.length) {
      const currentLineContent = lines[currentLine]
      const endMatch = currentLineContent.match(/^END\s+([^:]+):?\s*$/)

      if (endMatch && endMatch[1] === blockType) {
        return {
          token: {
            type: TokenType.MULTILINE_TEXT,
            content: contentLines.join("\n"),
            lineStart: startLine,
            lineEnd: currentLine,
            metadata: { blockType },
          },
          nextLine: currentLine + 1,
        }
      }

      contentLines.push(currentLineContent)
      currentLine++
    }

    // If we reach here, no END marker was found
    return null
  }

  private isSectionHeader(line: string): boolean {
    return this.config.sectionHeaders.some((header) =>
      line.toLowerCase().includes(header.toLowerCase()),
    )
  }

  private extractSectionMetadata(line: string): Record<string, any> {
    // Extract section type and parameters
    const metadata: Record<string, any> = {}

    for (const header of this.config.sectionHeaders) {
      if (line.toLowerCase().includes(header.toLowerCase())) {
        metadata.sectionType = header
        break
      }
    }

    return metadata
  }

  private isKeyValuePair(line: string): boolean {
    return this.config.keyValuePatterns.some((pattern) => pattern.test(line))
  }

  private parseKeyValueWithData(
    lines: string[],
    startLine: number,
  ): { token: ParsedToken; nextLine: number } {
    const line = lines[startLine]
    const kvMatch = line.match(/^([^=]+)=(.*)$/)

    if (!kvMatch) {
      return {
        token: {
          type: TokenType.DATA_BLOCK,
          content: line,
          lineStart: startLine,
          lineEnd: startLine,
        },
        nextLine: startLine + 1,
      }
    }

    const key = kvMatch[1].trim()
    const value = kvMatch[2].trim()
    const dataLines: string[] = [line]
    let currentLine = startLine + 1

    // Check if this key-value pair has associated data on following lines
    if (this.hasAssociatedData(key, value)) {
      const expectedCount = this.extractDataCount(value)

      if (expectedCount > 0) {
        // Collect data lines until we have enough data or hit a new section
        while (
          currentLine < lines.length &&
          this.isDataLine(lines[currentLine])
        ) {
          dataLines.push(lines[currentLine])
          currentLine++

          // Stop if we've collected enough data (rough heuristic)
          if (currentLine - startLine > expectedCount + 5) break
        }
      }
    }

    return {
      token: {
        type: TokenType.KEY_VALUE,
        content: dataLines.join("\n"),
        lineStart: startLine,
        lineEnd: currentLine - 1,
        metadata: { key, value, hasData: dataLines.length > 1 },
      },
      nextLine: currentLine,
    }
  }

  private hasAssociatedData(key: string, value: string): boolean {
    // Keys that typically have data on following lines
    const dataKeys = [
      "surface line",
      "points",
      "se",
      "stations",
      "mann",
      "coordinates",
      "vol elev",
      "sta elev",
      "connection line",
      "weir se",
    ]

    return dataKeys.some(
      (dataKey) =>
        key.toLowerCase().includes(dataKey) ||
        (value.trim() !== "" && /^\d+$/.test(value.trim())),
    )
  }

  private extractDataCount(value: string): number {
    const match = value.match(/^\s*(\d+)\s*$/)
    return match ? parseInt(match[1]) : 0
  }

  private isDataLine(line: string): boolean {
    const trimmed = line.trim()

    // Empty line or starts with a letter (likely new section)
    if (trimmed === "" || /^[A-Za-z#]/.test(trimmed)) {
      return false
    }

    // Line with mostly numbers, spaces, and basic punctuation
    return /^[\d\s\.\-\+,]+$/.test(trimmed)
  }

  private isCoordinateData(line: string): boolean {
    return this.config.coordinatePatterns.some((pattern) => pattern.test(line))
  }

  private parseCoordinateBlock(
    lines: string[],
    startLine: number,
  ): { token: ParsedToken; nextLine: number } {
    const dataLines: string[] = []
    let currentLine = startLine

    while (currentLine < lines.length && this.isDataLine(lines[currentLine])) {
      dataLines.push(lines[currentLine])
      currentLine++
    }

    return {
      token: {
        type: TokenType.COORDINATE_DATA,
        content: dataLines.join("\n"),
        lineStart: startLine,
        lineEnd: currentLine - 1,
      },
      nextLine: currentLine,
    }
  }

  private isTableData(line: string): boolean {
    return this.config.tablePatterns.some((pattern) => pattern.test(line))
  }

  private parseTableBlock(
    lines: string[],
    startLine: number,
  ): { token: ParsedToken; nextLine: number } {
    const dataLines: string[] = []
    let currentLine = startLine

    while (currentLine < lines.length && this.isTableData(lines[currentLine])) {
      dataLines.push(lines[currentLine])
      currentLine++
    }

    return {
      token: {
        type: TokenType.TABLE_DATA,
        content: dataLines.join("\n"),
        lineStart: startLine,
        lineEnd: currentLine - 1,
      },
      nextLine: currentLine,
    }
  }
}
