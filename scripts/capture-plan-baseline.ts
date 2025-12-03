#!/usr/bin/env tsx

/**
 * Captures baseline metrics from main branch for plan regression comparison.
 * Mirrors capture-baseline.ts but for plan files.
 */

import { execSync } from "child_process"
import { existsSync, readFileSync, writeFileSync } from "fs"
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

type RunHistoryEntry = {
  timestamp: string
  results: unknown[]
  metrics: RunMetrics
}

type BaselineData = {
  branch: string
  commit: string
  timestamp: string
  metrics: RunMetrics
  capturedBy: "ci" | "manual"
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const baselineFilePath = join(__dirname, ".plan-baseline-metrics.json")
const historyFilePath = join(__dirname, ".compare-plans-history.json")

async function captureBaseline(targetBranch: string = "main") {
  console.log(colors.cyan(`\n=== Capturing Plan Baseline from ${targetBranch} ===\n`))

  const currentBranch = execSync("git branch --show-current", { encoding: "utf-8" }).trim()
  const hasChanges = execSync("git status --porcelain", { encoding: "utf-8" }).trim()

  if (hasChanges) {
    console.log(colors.yellow("⚠️  You have uncommitted changes. Stashing..."))
    execSync("git stash push -m 'Plan baseline capture stash'", { stdio: "inherit" })
  }

  try {
    console.log(colors.dim(`Checking out ${targetBranch}...`))
    execSync(`git checkout ${targetBranch}`, { stdio: "pipe" })

    try {
      console.log(colors.dim("Pulling latest changes..."))
      execSync("git pull --ff-only", { stdio: "pipe" })
    } catch {
      console.log(colors.yellow("⚠️  Could not pull latest changes (continuing anyway)"))
    }

    console.log(colors.cyan("\nRunning compare-plans on baseline...\n"))
    execSync("tsx scripts/compare-plans.ts", { stdio: "inherit" })

    if (!existsSync(historyFilePath)) {
      throw new Error(
        `History file not found at ${historyFilePath}. compare-plans may have failed.`,
      )
    }

    const history: RunHistoryEntry[] = JSON.parse(readFileSync(historyFilePath, "utf-8"))
    const latestRun = history[history.length - 1]

    if (!latestRun) {
      throw new Error("No run data found in plan history file")
    }

    const commit = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim()

    const baseline: BaselineData = {
      branch: targetBranch,
      commit,
      timestamp: new Date().toISOString(),
      metrics: latestRun.metrics,
      capturedBy: process.env.CI ? "ci" : "manual",
    }

    writeFileSync(baselineFilePath, JSON.stringify(baseline, null, 2), "utf-8")

    console.log(colors.green("\n✅ Plan baseline captured successfully!"))
    console.log(colors.dim(`   Branch: ${baseline.branch} @ ${baseline.commit.slice(0, 7)}`))
    console.log(
      colors.dim(
        `   Result: ${baseline.metrics.filesMatched}/${baseline.metrics.totalFiles} files matched (${baseline.metrics.status})`,
      ),
    )
    console.log(colors.dim(`   Saved to: ${baselineFilePath}`))
  } finally {
    console.log(colors.dim(`\nReturning to ${currentBranch}...`))
    execSync(`git checkout ${currentBranch}`, { stdio: "pipe" })

    if (hasChanges) {
      console.log(colors.dim("Restoring stashed changes..."))
      execSync("git stash pop", { stdio: "pipe" })
    }
  }
}

const args = process.argv.slice(2)
const branchIndex = args.indexOf("--branch")
const targetBranch = branchIndex >= 0 ? args[branchIndex + 1] : "main"

captureBaseline(targetBranch).catch((err) => {
  console.error(colors.red("\n❌ Failed to capture plan baseline:"))
  console.error(colors.red(err instanceof Error ? err.message : String(err)))
  process.exit(1)
})
