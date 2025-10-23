#!/usr/bin/env tsx

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs"
import { stdin as input, stdout as output } from "process"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { createInterface } from "readline/promises"
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

const cliArgs = process.argv.slice(2)
let minSupportedProgramVersion = 6

for (let index = 0; index < cliArgs.length; index += 1) {
  const arg = cliArgs[index]

  if (arg === "--allow-v5") {
    minSupportedProgramVersion = Math.min(minSupportedProgramVersion, 5)
    continue
  }

  if (arg.startsWith("--min-program-version")) {
    const [flag, inlineValue] = arg.split("=")
    let value = inlineValue

    if (!value) {
      value = cliArgs[index + 1]
      if (value) {
        index += 1
      }
    }

    if (!value) {
      console.warn(colors.yellow(`Missing value for ${flag}. Using default minimum Program Version ${minSupportedProgramVersion}.`))
      continue
    }

    const parsed = Number.parseFloat(value)

    if (Number.isNaN(parsed)) {
      console.warn(
        colors.yellow(
          `Invalid value "${value}" for ${flag}. Using default minimum Program Version ${minSupportedProgramVersion}.`,
        ),
      )
      continue
    }

    minSupportedProgramVersion = parsed
  }
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

type SkipReason = "version" | "legacy_version" | "previous_failure"

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
  originalLine?: string
  serializedLine?: string
  note?: string
}

type RunMetrics = {
  matches: number
  diffs: number
  errors: number
  skipped: number
  totalFiles: number
}

type IssuePromptContext = {
  file: string
  status: "diff" | "error"
  diffLine?: number
}

type TriageLogEntry = {
  timestamp: string
  file: string
  status: "diff" | "error"
  note: string
  diffLine?: number
  diffIndex?: number
  originalLine?: string
  serializedLine?: string
  parsedOutputPath?: string
  linesMatched?: number
  errorMessage?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const triageLogPath = join(__dirname, ".geometry-triage-log.json")

function loadTriageLog(): TriageLogEntry[] {
  if (!existsSync(triageLogPath)) {
    return []
  }

  try {
    const raw = readFileSync(triageLogPath, "utf-8")
    const parsed = JSON.parse(raw) as TriageLogEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn(
      colors.yellow(
        `Unable to read existing triage log. Starting fresh. ${error instanceof Error ? error.message : String(error)}`,
      ),
    )
    return []
  }
}

function saveTriageLog(entries: TriageLogEntry[]) {
  writeFileSync(triageLogPath, JSON.stringify(entries, null, 2), "utf-8")
}

function buildDefaultNotes(entries: TriageLogEntry[]) {
  const notes = new Map<string, string>()

  for (const entry of entries) {
    if (entry.note !== undefined) {
      notes.set(entry.file, entry.note)
    }
  }

  return notes
}

function computeRunMetrics(results: FileRunResult[]): RunMetrics {
  const metrics: RunMetrics = {
    matches: 0,
    diffs: 0,
    errors: 0,
    skipped: 0,
    totalFiles: results.length,
  }

  for (const result of results) {
    if (result.status === "match") {
      metrics.matches += 1
      continue
    }

    if (result.status === "diff") {
      metrics.diffs += 1
      continue
    }

    if (result.status === "error") {
      metrics.errors += 1
      continue
    }

    if (result.status === "skipped") {
      metrics.skipped += 1
    }
  }

  return metrics
}

function createIssuePrompter(defaultNotes: Map<string, string>) {
  const rl = createInterface({ input, output })

  async function prompt(context: IssuePromptContext) {
    const lineFragment = context.diffLine ? ` at line ${context.diffLine}` : ""
    console.log(
      colors.yellow(
        `Please describe the missing functionality or issue for ${context.file}${lineFragment}.`,
      ),
    )
    const key = context.file
    const defaultNote = defaultNotes.get(key)
    const questionPromise = rl.question("  Issue description (leave blank to skip): ")

    if (defaultNote && defaultNote.length > 0) {
      rl.write(defaultNote)
    }

    const answer = (await questionPromise).trim()
    defaultNotes.set(key, answer)
    return answer
  }

  prompt.close = () => rl.close()

  return prompt
}

type IssuePrompter = ReturnType<typeof createIssuePrompter>

async function testGeometry(
  testFilePath: string,
  askForIssue: IssuePrompter,
): Promise<FileRunResult> {
  try {
    console.log(`${divider}\n${colors.cyan(`Comparing "${testFilePath}"`)}`)
    const linesToLog: string[] = []
    const originalContent = readFileSync(testFilePath, "utf-8")
    const normalizedOriginal = originalContent.replace(/\r\n/g, "\n")

    if (/^Version\s*=/m.test(normalizedOriginal)) {
      const message = `Skipping "${testFilePath}" due to legacy Version header`
      console.log(colors.yellow(message))
      return {
        file: testFilePath,
        status: "skipped",
        message,
        skipReason: "legacy_version",
      }
    }

    const versionMatch = normalizedOriginal.match(/^Program Version\s*=\s*([^\s]+)\s*$/m)

    if (versionMatch) {
      const rawVersion = versionMatch[1]
      const parsedVersion = Number.parseFloat(rawVersion)

      if (!Number.isNaN(parsedVersion) && parsedVersion < minSupportedProgramVersion) {
        const message = `Skipping "${testFilePath}" due to unsupported Program Version=${rawVersion} (requires >= ${minSupportedProgramVersion})`
        console.log(colors.yellow(message))
        return {
          file: testFilePath,
          status: "skipped",
          message,
          skipReason: "version",
        }
      }
    }

    const [name, extension] = testFilePath.split(".")
    const serializedOutputPath = `${name}.serialized.${extension}`

    const originalLines = normalizedOriginal.split("\n")
    const { value: geometryData } = parseWithSchema(geometrySchema, originalLines, 0)

    const serializedLines = serializeWithSchema(geometrySchema, geometryData)
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
        const note = await askForIssue({
          file: testFilePath,
          status: "diff",
          diffLine: i + 1,
        })

        return {
          file: testFilePath,
          status: "diff",
          diffLine: i + 1,
          diffIndex,
          linesMatched: i,
          originalLines: originalLines.length,
          serializedLines: serializedLines.length,
          parsedOutputPath,
          originalLine,
          serializedLine,
          note,
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
    const message = error instanceof Error ? error.message : String(error)
    const note = await askForIssue({
      file: testFilePath,
      status: "error",
    })
    return {
      file: testFilePath,
      status: "error",
      message,
      note,
    }
  }
}

const exampleGeometriesDir = "test/data/example_geometries"
const exampleGeometryFiles = existsSync(exampleGeometriesDir)
  ? readdirSync(exampleGeometriesDir)
      .filter((file) => file.match(/\.g\d+$/))
      .map((file) => join(exampleGeometriesDir, file))
      .sort()
  : []

const geometryFiles = [
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
  "test/data/Dingman-1D.g06",
  ...exampleGeometryFiles,
]

async function main() {
  const existingEntries = loadTriageLog()
  const defaultNotes = buildDefaultNotes(existingEntries)
  const prompt = createIssuePrompter(defaultNotes)
  const runResults: FileRunResult[] = []
  const newLogEntries: TriageLogEntry[] = []

  try {
    for (const file of geometryFiles) {
      const result = await testGeometry(file, prompt)
      runResults.push(result)

      if (result.status === "diff" || result.status === "error") {
        newLogEntries.push({
          timestamp: new Date().toISOString(),
          file: result.file,
          status: result.status,
          note: result.note ?? "",
          diffLine: result.diffLine,
          diffIndex: result.diffIndex,
          originalLine: result.originalLine,
          serializedLine: result.serializedLine,
          parsedOutputPath: result.parsedOutputPath,
          linesMatched: result.linesMatched,
          errorMessage: result.message,
        })
      }
    }
  } finally {
    prompt.close()
  }

  const metrics = computeRunMetrics(runResults)
  const combinedLog = [...existingEntries, ...newLogEntries]
  saveTriageLog(combinedLog)

  console.log(divider)
  console.log(colors.cyan("Triage summary"))
  console.log(
    `  Matches: ${colors.green(String(metrics.matches))}  Differences: ${colors.yellow(String(metrics.diffs))}  Errors: ${colors.red(String(metrics.errors))}  Skipped: ${colors.dim(String(metrics.skipped))}`,
  )
  console.log(`  Notes recorded: ${colors.blue(String(newLogEntries.length))}`)
  console.log(`  Log stored at: ${colors.dim(triageLogPath)}`)
}

void main()
