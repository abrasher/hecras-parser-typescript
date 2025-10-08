#!/usr/bin/env tsx

/**
 * Script to compare Dingman 2D.g01 file with its round-trip serialized version
 * line by line, stopping at the first difference.
 *
 * Note: This file may cause stack overflow issues due to parsing complexity.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
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

type FileRunResult = {
  file: string
  status: "match" | "diff" | "error" | "skipped"
  diffLine?: number
  diffIndex?: number
  linesMatched?: number
  originalLines?: number
  serializedLines?: number
  parsedOutputPath?: string
  message?: string
}

type RunMetrics = {
  filesMatched: number
  totalFiles: number
  status: "all_matched" | "failed" | "error"
  failureFile?: string
  failureLine?: number
  linesMatchedInFailure?: number
  diffIndex?: number
}

type RunHistoryEntry = {
  timestamp: string
  results: FileRunResult[]
  metrics: RunMetrics
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const historyFilePath = join(__dirname, ".compare-geometries-history.json")

function testGeometry(testFilePath: string): FileRunResult {
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
        return {
          file: testFilePath,
          status: "diff",
          diffLine: i + 1,
          diffIndex,
          linesMatched: i,
          originalLines: originalLines.length,
          serializedLines: serializedLines.length,
          parsedOutputPath,
        }
      }
    }

    linesToLog.push(colors.green(`No differences for "${testFilePath}"`))
    console.log(linesToLog.join("\n"))
    return {
      file: testFilePath,
      status: "match",
      linesMatched: originalLines.length,
      originalLines: originalLines.length,
      serializedLines: serializedLines.length,
    }
  } catch (error) {
    console.error(`Error during comparison of ${testFilePath}:`, error)
    return {
      file: testFilePath,
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    }
  }
}

// Dynamically load all geometry files from test/data/example_geometries
const exampleGeometriesDir = "test/data/example_geometries"
const exampleGeometryFiles = existsSync(exampleGeometriesDir)
  ? readdirSync(exampleGeometriesDir)
      .filter((file) => file.match(/\.g\d+$/))
      .map((file) => join(exampleGeometriesDir, file))
      .sort()
  : []

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
  ...exampleGeometryFiles,
]

function computeRunMetrics(results: FileRunResult[]): RunMetrics {
  const totalFiles = geometryFiles.length
  let filesMatched = 0

  for (const result of results) {
    if (result.status === "match") {
      filesMatched += 1
      continue
    }

    if (result.status === "diff") {
      return {
        filesMatched,
        totalFiles,
        status: "failed",
        failureFile: result.file,
        failureLine: result.diffLine,
        linesMatchedInFailure: result.linesMatched,
        diffIndex: result.diffIndex,
      }
    }

    if (result.status === "error") {
      return {
        filesMatched,
        totalFiles,
        status: "error",
      }
    }

    if (result.status === "skipped") {
      return {
        filesMatched,
        totalFiles,
        status: "failed",
      }
    }
  }

  return {
    filesMatched,
    totalFiles,
    status: "all_matched",
  }
}

function compareWithPreviousRun(
  previous: RunHistoryEntry | undefined,
  current: RunHistoryEntry,
): { outcome: "further" | "regressed" | "first"; details: string } {
  if (!previous) {
    return {
      outcome: "first",
      details: "No previous run data to compare against.",
    }
  }

  const prev = previous.metrics
  const curr = current.metrics

  if (curr.status === "error" && prev.status !== "error") {
    return {
      outcome: "regressed",
      details: "Current run encountered an error.",
    }
  }

  if (curr.filesMatched > prev.filesMatched) {
    return {
      outcome: "further",
      details: `Matched ${curr.filesMatched} files compared to ${prev.filesMatched} previously.`,
    }
  }

  if (curr.filesMatched < prev.filesMatched) {
    return {
      outcome: "regressed",
      details: `Matched ${curr.filesMatched} files compared to ${prev.filesMatched} previously.`,
    }
  }

  if (curr.status === "all_matched" && prev.status !== "all_matched") {
    return {
      outcome: "further",
      details: "All geometries matched this run.",
    }
  }

  if (curr.status === "failed" && prev.status === "failed") {
    const currentLines = curr.linesMatchedInFailure ?? -1
    const previousLines = prev.linesMatchedInFailure ?? -1

    if (currentLines > previousLines) {
      return {
        outcome: "further",
        details: `Progressed ${currentLines - previousLines} more matching lines before divergence in ${curr.failureFile}.`,
      }
    }

    if (currentLines < previousLines) {
      return {
        outcome: "regressed",
        details: `Matched ${previousLines - currentLines} fewer lines before divergence in ${curr.failureFile}.`,
      }
    }

    const currentDiffIndex = curr.diffIndex ?? -1
    const previousDiffIndex = prev.diffIndex ?? -1

    if (currentDiffIndex > previousDiffIndex) {
      return {
        outcome: "further",
        details: `Difference occurs ${currentDiffIndex - previousDiffIndex} characters later in ${curr.failureFile}.`,
      }
    }

    if (currentDiffIndex < previousDiffIndex) {
      return {
        outcome: "regressed",
        details: `Difference occurs ${previousDiffIndex - currentDiffIndex} characters earlier in ${curr.failureFile}.`,
      }
    }
  }

  if (curr.status === "error" && prev.status === "error") {
    return {
      outcome: "regressed",
      details: "Consecutive runs encountered errors with no additional progress.",
    }
  }

  return {
    outcome: "regressed",
    details: "No additional progress compared to the previous run.",
  }
}

function loadHistory(): RunHistoryEntry[] {
  if (!existsSync(historyFilePath)) {
    return []
  }

  try {
    const raw = readFileSync(historyFilePath, "utf-8")
    const parsed = JSON.parse(raw) as RunHistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn(
      colors.yellow(
        `Unable to read previous compare-geometries history. Starting fresh. ${error instanceof Error ? error.message : String(error)}`,
      ),
    )
    return []
  }
}

function saveHistory(history: RunHistoryEntry[]) {
  writeFileSync(historyFilePath, JSON.stringify(history, null, 2), "utf-8")
}

const runResults: FileRunResult[] = []
let shouldSkipRemaining = false

for (const file of geometryFiles) {
  if (shouldSkipRemaining) {
    runResults.push({ file, status: "skipped" })
    continue
  }

  const result = testGeometry(file)
  runResults.push(result)

  if (result.status === "diff" || result.status === "error") {
    shouldSkipRemaining = true
  }
}

const metrics = computeRunMetrics(runResults)
const currentRun: RunHistoryEntry = {
  timestamp: new Date().toISOString(),
  results: runResults,
  metrics,
}

const history = loadHistory()
const previousRun = history.at(-1)
const comparison = compareWithPreviousRun(previousRun, currentRun)

const updatedHistory = [...history.slice(-1), currentRun]
saveHistory(updatedHistory)

console.log(divider)
console.log(colors.cyan("Run summary"))
console.log(
  `  Matched files: ${colors.green(`${metrics.filesMatched}/${metrics.totalFiles}`)} (${metrics.status})`,
)

if (metrics.status === "failed") {
  if (metrics.failureFile && metrics.failureLine) {
    console.log(
      `  Failure: ${colors.red(metrics.failureFile)} at line ${colors.yellow(String(metrics.failureLine))}`,
    )
  } else {
    console.log(`  Failure: ${colors.red("Comparison stopped before completing all files")}`)
  }
}

if (metrics.status === "error") {
  console.log(colors.red("  Encountered an error during comparison."))
}

console.log(`  History stored at: ${colors.dim(historyFilePath)}`)

if (comparison.outcome === "first") {
  console.log(colors.blue(comparison.details))
} else if (comparison.outcome === "further") {
  console.log(colors.green("we got further"))
  console.log(colors.green(`  ${comparison.details}`))
} else {
  console.log(colors.red("we regressed"))
  console.log(colors.red(`  ${comparison.details}`))
}
