#!/usr/bin/env tsx

/**
 * Checks plan comparison results against stored baseline metrics.
 */

import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`,
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

type BaselineData = {
  branch: string
  commit: string
  timestamp: string
  metrics: RunMetrics
  capturedBy: "ci" | "manual"
}

type RunHistoryEntry = {
  timestamp: string
  results: unknown[]
  metrics: RunMetrics
}

type ComparisonResult = {
  allowed: boolean
  reason: string
  message: string
  filesMatchedDelta?: number
  linesDelta?: number
  diffDelta?: number
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const baselineFilePath = join(__dirname, ".plan-baseline-metrics.json")
const historyFilePath = join(__dirname, ".compare-plans-history.json")

function compareToBaseline(baseline: RunMetrics, current: RunMetrics): ComparisonResult {
  const filesMatchedDelta = current.filesMatched - baseline.filesMatched

  if (filesMatchedDelta > 0) {
    return {
      allowed: true,
      reason: "improvement",
      message: `${filesMatchedDelta} more files matched`,
      filesMatchedDelta,
    }
  }

  if (filesMatchedDelta < 0) {
    return {
      allowed: false,
      reason: "fewer_files",
      message: `${Math.abs(filesMatchedDelta)} fewer files matched`,
      filesMatchedDelta,
    }
  }

  if (current.status === "all_matched" && baseline.status !== "all_matched") {
    return {
      allowed: true,
      reason: "all_matched",
      message: "All plans now match",
    }
  }

  if (current.status === "error" && baseline.status !== "error") {
    return {
      allowed: false,
      reason: "new_error",
      message: "New error introduced",
    }
  }

  if (current.status === "failed" && baseline.status === "failed") {
    const currentLines = current.linesMatchedInFailure ?? 0
    const baselineLines = baseline.linesMatchedInFailure ?? 0
    const linesDelta = currentLines - baselineLines

    if (linesDelta > 0) {
      return {
        allowed: true,
        reason: "more_lines",
        message: `${linesDelta} more lines matched before failure`,
        linesDelta,
      }
    }

    if (linesDelta < 0) {
      return {
        allowed: false,
        reason: "fewer_lines",
        message: `${Math.abs(linesDelta)} fewer lines matched before failure`,
        linesDelta,
      }
    }

    const currentDiff = current.diffIndex ?? 0
    const baselineDiff = baseline.diffIndex ?? 0
    const diffDelta = currentDiff - baselineDiff

    if (diffDelta > 0) {
      return {
        allowed: true,
        reason: "later_diff",
        message: `Difference occurs ${diffDelta} characters later`,
        diffDelta,
      }
    }

    if (diffDelta < 0) {
      return {
        allowed: false,
        reason: "earlier_diff",
        message: `Difference occurs ${Math.abs(diffDelta)} characters earlier`,
        diffDelta,
      }
    }

    return {
      allowed: true,
      reason: "no_change",
      message: "Same result as baseline (no change)",
    }
  }

  if (current.status === baseline.status) {
    return {
      allowed: true,
      reason: "no_change",
      message: "Same result as baseline (no change)",
    }
  }

  return {
    allowed: true,
    reason: "unknown",
    message: "Unable to determine comparison (allowing by default)",
  }
}

async function checkRegression(strict: boolean = false): Promise<number> {
  console.log(colors.cyan("=== Plan Regression Check ===\n"))

  if (!existsSync(baselineFilePath)) {
    console.log(colors.yellow("⚠️  No plan baseline found"))
    console.log(colors.dim("   Run: npm run baseline:capture:plans"))

    if (strict) {
      console.log(colors.red("\n❌ FAILED: No plan baseline (strict mode)"))
      return 2
    }

    return 0
  }

  const baseline: BaselineData = JSON.parse(readFileSync(baselineFilePath, "utf-8"))

  console.log(colors.dim(`Baseline: ${baseline.branch} @ ${baseline.commit.slice(0, 7)}`))
  console.log(
    colors.dim(
      `  Result: ${baseline.metrics.filesMatched}/${baseline.metrics.totalFiles} files matched (${baseline.metrics.status})`,
    ),
  )

  console.log("\nRunning compare-plans...\n")
  execSync("tsx scripts/compare-plans.ts", { stdio: "inherit" })

  if (!existsSync(historyFilePath)) {
    console.log(colors.red("compare-plans did not produce history output"))
    return 1
  }

  const history: RunHistoryEntry[] = JSON.parse(readFileSync(historyFilePath, "utf-8"))
  const latestRun = history[history.length - 1]

  if (!latestRun) {
    console.log(colors.red("No plan comparison results recorded"))
    return 1
  }

  const comparison = compareToBaseline(baseline.metrics, latestRun.metrics)

  console.log("\n=== Plan Regression Check Result ===")

  if (comparison.allowed) {
    console.log(colors.green("✅ NO REGRESSION"))
    console.log(colors.green(`   ${comparison.message}`))
    return 0
  }

  console.log(colors.red("❌ REGRESSION DETECTED"))
  console.log(colors.red(`   ${comparison.message}`))
  console.log(colors.dim(`\n   Baseline: ${baseline.metrics.filesMatched} files matched`))
  console.log(colors.dim(`   Current:  ${latestRun.metrics.filesMatched} files matched`))
  return 1
}

const args = process.argv.slice(2)
const strict = args.includes("--strict")

checkRegression(strict).catch((err) => {
  console.error(colors.red("\n❌ Failed to run plan regression check:"))
  console.error(colors.red(err instanceof Error ? err.message : String(err)))
  process.exit(1)
})
