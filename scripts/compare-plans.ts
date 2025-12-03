#!/usr/bin/env tsx

/**
 * Compare plan files with their round-trip serialized output using the plan schema.
 *
 * The script mirrors compare-geometries but targets test/data/plans datasets.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { parseWithSchema, serializeWithSchema } from "../src/schema"
import { planSchema } from "../src/schemas/planSchema"

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

const BOOLEAN_LIKE_VALUES = new Set(
  [
    "-1",
    "0",
    "1",
    "10",
    "01",
    "t",
    "f",
    "true",
    "false",
    "y",
    "n",
    "yes",
    "no",
    "on",
    "off",
    "enable",
    "disable",
  ].map((value) => value.toLowerCase()),
)

function isBooleanToken(token: string) {
  if (!token) {
    return false
  }

  return BOOLEAN_LIKE_VALUES.has(token.toLowerCase())
}

function linesEquivalent(originalLine: string, serializedLine: string) {
  if (originalLine === serializedLine) {
    return true
  }

  const originalEquals = originalLine.indexOf("=")
  const serializedEquals = serializedLine.indexOf("=")

  if (originalEquals === -1 || serializedEquals === -1) {
    return false
  }

  const originalKey = originalLine.slice(0, originalEquals).trim()
  const serializedKey = serializedLine.slice(0, serializedEquals).trim()

  if (originalKey !== serializedKey) {
    return false
  }

  const originalValue = originalLine.slice(originalEquals + 1)
  const serializedValue = serializedLine.slice(serializedEquals + 1)

  if (!originalValue.includes(",") || !serializedValue.includes(",")) {
    return false
  }

  const originalTokens = originalValue.split(",").map((segment) => segment.trim())
  const serializedTokens = serializedValue.split(",").map((segment) => segment.trim())

  if (originalTokens.length !== serializedTokens.length) {
    return false
  }

  if (!originalTokens.every((token, index) => token === serializedTokens[index])) {
    return false
  }

  const originalBooleanTokens = originalTokens.slice(1)
  const serializedBooleanTokens = serializedTokens.slice(1)

  if (originalBooleanTokens.length === 0 || serializedBooleanTokens.length === 0) {
    return false
  }

  if (!originalBooleanTokens.every(isBooleanToken)) {
    return false
  }

  if (!serializedBooleanTokens.every(isBooleanToken)) {
    return false
  }

  return true
}

type SkipReason = "legacy_version" | "previous_failure"

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
  skipReason?: SkipReason
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
const historyFilePath = join(__dirname, ".compare-plans-history.json")

const planDir = "test/data/plans"
const planFiles = existsSync(planDir)
  ? readdirSync(planDir)
      .filter((file) => file.match(/\.p\d+$/i) && !file.includes("serialized"))
      .map((file) => join(planDir, file))
      .sort()
  : []

function testPlan(testFilePath: string): FileRunResult {
  try {
    console.log(`${divider}\n${colors.cyan(`Comparing \"${testFilePath}\"`)}`)
    const linesToLog: string[] = []
    const originalContent = readFileSync(testFilePath, "utf-8")
    const normalizedOriginal = originalContent.replace(/\r\n/g, "\n")

    if (/^Version\s*=\s*/m.test(normalizedOriginal)) {
      const message = `Skipping \"${testFilePath}\" due to legacy Version header`
      console.log(colors.yellow(message))
      return {
        file: testFilePath,
        status: "skipped",
        message,
        skipReason: "legacy_version",
      }
    }

    const extIndex = testFilePath.lastIndexOf(".")
    const baseName = extIndex >= 0 ? testFilePath.slice(0, extIndex) : testFilePath
    const extension = extIndex >= 0 ? testFilePath.slice(extIndex + 1) : "p"
    const serializedOutputPath = `${baseName}.serialized.${extension}`

    const originalLines = normalizedOriginal.split("\n")
    const { value: planData } = parseWithSchema(planSchema, originalLines, 0)
    const serializedLines = serializeWithSchema(planSchema, planData)
    const serializedContent = serializedLines.join("\n")

    writeFileSync(serializedOutputPath, serializedContent, "utf-8")

    linesToLog.push(
      `${colors.dim("Comparing files:")}`,
      `  ${colors.blue(testFilePath)}`,
      `  ${colors.blue(serializedOutputPath)}`,
      `${colors.dim(`Original lines: ${originalLines.length}`)}`,
      `${colors.dim(`Serialized lines: ${serializedLines.length}`)}`,
    )

    const maxLines = Math.max(originalLines.length, serializedLines.length)

    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || ""
      const serializedLine = serializedLines[i] || ""

      if (!linesEquivalent(originalLine, serializedLine)) {
        const diffIndex = findDiffIndex(originalLine, serializedLine)
        const pointer = pointerLine(diffIndex)
        const parsedOutputPath = join(
          tmpdir(),
          `plan-parsed-${Date.now()}-${Math.random().toString(16).slice(2)}.json`,
        )

        writeFileSync(parsedOutputPath, JSON.stringify(planData, null, 2), "utf-8")

        linesToLog.push(
          colors.red(`Difference detected at line ${i + 1}`),
          formatLinePreview("Original", originalLine, `${testFilePath}:${i + 1}`, colors.red),
          formatLinePreview(
            "Serialized",
            serializedLine,
            `${serializedOutputPath}:${i + 1}`,
            colors.green,
          ),
          `Parsed plan saved to: ${parsedOutputPath}`,
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

    linesToLog.push(colors.green(`No differences for \"${testFilePath}\"`))
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

function computeRunMetrics(results: FileRunResult[]): RunMetrics {
  const totalFiles = planFiles.length
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
      continue
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
      details: "All plans matched this run.",
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
        `Unable to read previous compare-plans history. Starting fresh. ${error instanceof Error ? error.message : String(error)}`,
      ),
    )
    return []
  }
}

function saveHistory(history: RunHistoryEntry[]) {
  writeFileSync(historyFilePath, JSON.stringify(history, null, 2), "utf-8")
}

if (planFiles.length === 0) {
  console.error(colors.red("No plan files found in test/data/plans"))
  process.exit(1)
}

const runResults: FileRunResult[] = []
let shouldSkipRemaining = false

for (const file of planFiles) {
  if (shouldSkipRemaining) {
    runResults.push({ file, status: "skipped", skipReason: "previous_failure" })
    continue
  }

  const result = testPlan(file)
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
console.log(colors.cyan("Plan comparison summary"))
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
