#!/usr/bin/env tsx

/**
 * Checks if current changes regressed compared to baseline
 *
 * Exit codes:
 *   0 - No regression (improved or same as baseline)
 *   1 - Regression detected (worse than baseline)
 *   2 - No baseline found (warning, not failure unless --strict)
 *
 * Usage:
 *   npm run check:regression              # Run check
 *   npm run check:regression -- --strict  # Fail if no baseline
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
const baselineFilePath = join(__dirname, ".baseline-metrics.json")
const historyFilePath = join(__dirname, ".compare-geometries-history.json")

function compareToBaseline(baseline: RunMetrics, current: RunMetrics): ComparisonResult {
  const filesMatchedDelta = current.filesMatched - baseline.filesMatched

  // Case 1: IMPROVEMENT - More files matched
  if (filesMatchedDelta > 0) {
    return {
      allowed: true,
      reason: "improvement",
      message: `${filesMatchedDelta} more files matched`,
      filesMatchedDelta,
    }
  }

  // Case 2: REGRESSION - Fewer files matched
  if (filesMatchedDelta < 0) {
    return {
      allowed: false,
      reason: "fewer_files",
      message: `${Math.abs(filesMatchedDelta)} fewer files matched`,
      filesMatchedDelta,
    }
  }

  // filesMatchedDelta === 0, need to check deeper

  // Case 3: IMPROVEMENT - All matched (from partial)
  if (current.status === "all_matched" && baseline.status !== "all_matched") {
    return {
      allowed: true,
      reason: "all_matched",
      message: "All geometries now match",
    }
  }

  // Case 4: REGRESSION - New error introduced
  if (current.status === "error" && baseline.status !== "error") {
    return {
      allowed: false,
      reason: "new_error",
      message: "New error introduced",
    }
  }

  // Case 5: Both failed on same number of files - compare line precision
  if (current.status === "failed" && baseline.status === "failed") {
    const currentLines = current.linesMatchedInFailure ?? 0
    const baselineLines = baseline.linesMatchedInFailure ?? 0
    const linesDelta = currentLines - baselineLines

    // Sub-case 5a: IMPROVEMENT - More lines matched before failure
    if (linesDelta > 0) {
      return {
        allowed: true,
        reason: "more_lines",
        message: `${linesDelta} more lines matched before failure`,
        linesDelta,
      }
    }

    // Sub-case 5b: REGRESSION - Fewer lines matched before failure
    if (linesDelta < 0) {
      return {
        allowed: false,
        reason: "fewer_lines",
        message: `${Math.abs(linesDelta)} fewer lines matched before failure`,
        linesDelta,
      }
    }

    // linesDelta === 0, check character-level precision
    const currentDiff = current.diffIndex ?? 0
    const baselineDiff = baseline.diffIndex ?? 0
    const diffDelta = currentDiff - baselineDiff

    // Sub-case 5c: IMPROVEMENT - Diff occurs later
    if (diffDelta > 0) {
      return {
        allowed: true,
        reason: "later_diff",
        message: `Difference occurs ${diffDelta} characters later`,
        diffDelta,
      }
    }

    // Sub-case 5d: REGRESSION - Diff occurs earlier
    if (diffDelta < 0) {
      return {
        allowed: false,
        reason: "earlier_diff",
        message: `Difference occurs ${Math.abs(diffDelta)} characters earlier`,
        diffDelta,
      }
    }

    // Sub-case 5e: NO CHANGE - Exact same failure point
    return {
      allowed: true, // ✅ ALLOW - not a regression
      reason: "no_change",
      message: "Same result as baseline (no change)",
    }
  }

  // Case 6: Both succeeded or both errored - NO CHANGE
  if (current.status === baseline.status) {
    return {
      allowed: true, // ✅ ALLOW - not a regression
      reason: "no_change",
      message: "Same result as baseline (no change)",
    }
  }

  // Case 7: Unexpected state - be conservative, allow but warn
  return {
    allowed: true,
    reason: "unknown",
    message: "Unable to determine comparison (allowing by default)",
  }
}

async function checkRegression(strict: boolean = false): Promise<number> {
  console.log(colors.cyan("=== Geometry Regression Check ===\n"))

  // 1. Check if baseline exists
  if (!existsSync(baselineFilePath)) {
    console.log(colors.yellow("⚠️  No baseline found"))
    console.log(colors.dim("   Run: npm run baseline:capture"))

    if (strict) {
      console.log(
        colors.red("\n❌ FAILED: No baseline (strict mode)"),
      )
      return 2
    }

    console.log(colors.dim("\n   Allowing this run to pass (use --strict to fail)"))
    return 0
  }

  // 2. Load baseline
  const baseline: BaselineData = JSON.parse(readFileSync(baselineFilePath, "utf-8"))
  console.log(
    colors.dim(`Baseline: ${baseline.branch} @ ${baseline.commit.slice(0, 7)}`),
  )
  console.log(colors.dim(`  Captured: ${new Date(baseline.timestamp).toLocaleString()}`))
  console.log(
    colors.dim(
      `  Result: ${baseline.metrics.filesMatched}/${baseline.metrics.totalFiles} files matched (${baseline.metrics.status})`,
    ),
  )

  // 3. Run compare-geometries
  console.log(colors.cyan("\nRunning compare-geometries...\n"))
  try {
    execSync("tsx scripts/compare-geometries.ts", { stdio: "inherit" })
  } catch (error) {
    console.log(
      colors.red(
        "\n❌ compare-geometries script failed. This may indicate a parsing error.",
      ),
    )
    return 1
  }

  // 4. Load current results
  if (!existsSync(historyFilePath)) {
    console.log(
      colors.red("\n❌ No history file found after running compare-geometries"),
    )
    return 1
  }

  const history: RunHistoryEntry[] = JSON.parse(readFileSync(historyFilePath, "utf-8"))
  const current = history[history.length - 1]

  if (!current) {
    console.log(colors.red("\n❌ No current run data found in history"))
    return 1
  }

  console.log(
    colors.dim(
      `\nCurrent: ${current.metrics.filesMatched}/${current.metrics.totalFiles} files matched (${current.metrics.status})`,
    ),
  )

  // 5. Compare
  const result = compareToBaseline(baseline.metrics, current.metrics)

  console.log("\n" + colors.cyan("=== Regression Check Result ==="))

  if (!result.allowed) {
    // REGRESSION - Block the build
    console.log(colors.red("❌ REGRESSION DETECTED"))
    console.log(colors.red(`   ${result.message}`))

    if (result.reason === "fewer_files") {
      console.log(
        colors.dim(
          `\n   Baseline: ${baseline.metrics.filesMatched} files matched`,
        ),
      )
      console.log(colors.dim(`   Current:  ${current.metrics.filesMatched} files matched`))
    }

    return 1 // EXIT CODE 1 - FAIL
  }

  // NO REGRESSION - Allow
  if (result.reason === "no_change") {
    // No change - neutral output
    console.log(colors.dim("✅ NO REGRESSION"))
    console.log(colors.dim(`   ${result.message}`))
  } else {
    // Improvement - positive output
    console.log(colors.green("✅ NO REGRESSION"))
    console.log(colors.green(`   ${result.message}`))
  }

  return 0 // EXIT CODE 0 - PASS
}

// Parse CLI args
const args = process.argv.slice(2)
const strict = args.includes("--strict")

checkRegression(strict)
  .then((exitCode) => {
    process.exit(exitCode)
  })
  .catch((error) => {
    console.error(colors.red("Error during regression check:"), error)
    process.exit(1)
  })
