#!/usr/bin/env tsx

/**
 * Script to compare Dingman 2D.g01 file with its round-trip serialized version
 * line by line, stopping at the first difference.
 *
 * Note: This file may cause stack overflow issues due to parsing complexity.
 */

import { readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { parseWithSchema, serializeWithSchema } from "../src/schema"
import { geometrySchema } from "../src/schemas/geometrySchema"

const colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`,
}

const divider = colors.dim("-".repeat(60))

function formatLinePreview(
  label: string,
  line: string,
  fileRef: string,
  formatter: (text: string) => string,
) {
  const printableLine = line === "" ? colors.dim("<blank>") : formatter(line)

  return `${colors.blue(label)} ${colors.dim(fileRef)}\n  ${printableLine}`
}

function findDiffIndex(a: string, b: string) {
  const maxLength = Math.max(a.length, b.length)

  for (let i = 0; i < maxLength; i++) {
    if (a[i] !== b[i]) {
      return i
    }
  }

  return -1
}

function pointerLine(diffIndex: number) {
  if (diffIndex < 0) {
    return null
  }

  return `  ${colors.yellow(" ".repeat(diffIndex) + "^")}`
}

function testGeometry(testFilePath: string): boolean {
  try {
    console.log(`${divider}\n${colors.cyan(`Comparing "${testFilePath}"`)}`)
    const linesToLog: string[] = []
    // Read and parse the original file
    const originalContent = readFileSync(testFilePath, "utf-8")
    const [name, extension] = testFilePath.split(".")
    const serializedOutputPath = `${name}.serialized.${extension}`

    const normalizedOriginal = originalContent.replace(/\r\n/g, "\n")
    const originalLines = normalizedOriginal.split("\n")
    const { value: geometryData } = parseWithSchema(geometrySchema, originalLines, 0)

    const serializedLines = serializeWithSchema(geometrySchema, geometryData)
    const serializedContent = serializedLines.join("\n")

    // Save serialized output to file for examination
    writeFileSync(serializedOutputPath, serializedContent, "utf-8")

    // Normalize line endings and split into lines
    linesToLog.push(
      `${colors.dim("Comparing files:")}`,
      `  ${colors.blue(testFilePath)}`,
      `  ${colors.blue(serializedOutputPath)}`,
      `${colors.dim(`Original lines: ${originalLines.length}`)}`,
      `${colors.dim(`Serialized lines: ${serializedLines.length}`)}`,
    )

    // Compare line by line until first difference
    const maxLines = Math.max(originalLines.length, serializedLines.length)

    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || ""
      const serializedLine = serializedLines[i] || ""

      if (originalLine !== serializedLine) {
        const diffIndex = findDiffIndex(originalLine, serializedLine)
        const pointer = pointerLine(diffIndex)
        const parsedOutputPath = join(
          tmpdir(),
          `geometry-parsed-${Date.now()}-${Math.random().toString(16).slice(2)}.json`,
        )

        writeFileSync(parsedOutputPath, JSON.stringify(geometryData, null, 2), "utf-8")

        linesToLog.push(
          colors.red(`Difference detected at line ${i + 1}`),
          formatLinePreview("Original", originalLine, `${testFilePath}:${i + 1}`, colors.red),
          formatLinePreview(
            "Serialized",
            serializedLine,
            `${serializedOutputPath}:${i + 1}`,
            colors.green,
          ),
          `Parsed geometry saved to: ${parsedOutputPath}`,
        )

        if (pointer) {
          linesToLog.push(pointer)
        }

        console.log(linesToLog.join("\n"))
        return false
      }
    }

    linesToLog.push(colors.green(`No differences for "${testFilePath}"`))
    console.log(linesToLog.join("\n"))
    return true
  } catch (error) {
    console.error(`Error during comparison of ${testFilePath}:`, error)

    process.exit(1)
  }
}

const geometryFiles = [
  // "test/data/Dingman.g01",
  "test/data/Dingman 2D.g01",
  "scripts/geometries/Mitigation1.g01",
  "scripts/geometries/Mitigation2.g02",
  "scripts/geometries/Mitigation3.g03",
  "scripts/geometries/Mitigation4.g04",
  "scripts/geometries/Mitigation5.g05",
  "scripts/geometries/Mitigation6.g06",
  "scripts/geometries/Mitigation7.g07",
  "scripts/geometries/Mitigation8.g08",
  "scripts/geometries/Mitigation9.g09",
  "scripts/geometries/Mitigation10.g10",
  "test/data/BurntIslands.g01",
  "test/data/Muncie.g01",
]

for (const file of geometryFiles) {
  const matches = testGeometry(file)

  if (!matches) {
    break
  }
}
