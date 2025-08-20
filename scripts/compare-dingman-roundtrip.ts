#!/usr/bin/env tsx

/**
 * Script to compare multiple geometry files with their round-trip serialized versions
 * and generate a consolidated report showing mismatches.
 */

import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { parseGeometry } from "../src/parseGeometry"
import { serializeGeometryString } from "../src/serializers"

interface LineDifference {
  lineNumber: number
  originalLine: string
  serializedLine: string | undefined
  issue: string
}

interface FileComparisonResult {
  fileName: string
  differences: LineDifference[]
  originalLineCount: number
  serializedLineCount: number
  serializedPath: string
}

const GEOMETRY_FILES = ["BurntIslands.g01", "Dingman 1D.g06", "Dingman 2D.g01", "Muncie.g01"]

function compareFile(filePath: string): FileComparisonResult {
  const fileName = filePath.split("/").pop() || filePath

  try {
    // Read and parse the original file
    const originalContent = readFileSync(filePath, "utf-8")
    const geometryData = parseGeometry(originalContent)
    const serializedContent = serializeGeometryString(geometryData)

    // Save serialized output to file for examination
    const fileExtension = fileName.split(".").pop()
    const baseName = fileName.replace(`.${fileExtension}`, "")
    const serializedOutputPath = `test/data/${baseName}.serialized.${fileExtension}`
    writeFileSync(serializedOutputPath, serializedContent, "utf-8")

    // Normalize line endings and split into lines
    const originalLines = originalContent.replace(/\r\n/g, "\n").split("\n")
    const serializedLines = serializedContent.split("\n")

    const differences: LineDifference[] = []
    const maxLines = Math.max(originalLines.length, serializedLines.length)

    // Compare line by line
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i]
      const serializedLine = serializedLines[i]

      if (originalLine !== serializedLine) {
        let issue = ""

        if (originalLine === undefined) {
          issue = "MISSING: Line exists in serialized but not in original"
        } else if (serializedLine === undefined) {
          issue = "MISSING: Line exists in original but not in serialized"
        } else if (originalLine.trim() === serializedLine.trim()) {
          issue = "WHITESPACE: Different whitespace/spacing"
        } else if (originalLine.toLowerCase() === serializedLine.toLowerCase()) {
          issue = "CASE: Different capitalization"
        } else {
          // Analyze specific types of differences
          if (originalLine.includes("=") && serializedLine.includes("=")) {
            const [origKey] = originalLine.split("=", 1)
            const [serKey] = serializedLine.split("=", 1)
            if (origKey.trim() === serKey.trim()) {
              issue = "VALUE: Same key, different value"
            } else {
              issue = "KEY: Different key or format"
            }
          } else if (/^\s*\d/.test(originalLine) && /^\s*\d/.test(serializedLine)) {
            issue = "NUMERIC: Different numeric formatting"
          } else if (originalLine.length === 0 && serializedLine.length > 0) {
            issue = "BLANK: Original blank, serialized has content"
          } else if (originalLine.length > 0 && serializedLine.length === 0) {
            issue = "BLANK: Original has content, serialized blank"
          } else {
            issue = "CONTENT: Completely different content"
          }
        }

        differences.push({
          lineNumber: i + 1,
          originalLine,
          serializedLine,
          issue,
        })
      }
    }

    return {
      fileName,
      differences,
      originalLineCount: originalLines.length,
      serializedLineCount: serializedLines.length,
      serializedPath: serializedOutputPath,
    }
  } catch (error) {
    throw new Error(`Failed to process ${fileName}: ${error}`)
  }
}

function generateReport(results: FileComparisonResult[]): string {
  let report = "HEC-RAS Geometry Files Round-trip Comparison Report\n"
  report += "=".repeat(60) + "\n\n"
  report += `Generated: ${new Date().toISOString()}\n\n`

  results.forEach((result) => {
    report += `File: ${result.fileName}\n`
    report += "-".repeat(40) + "\n"

    if (result.differences.length === 0) {
      report += "Status: ALL PASS - No mismatches found\n"
      report += `Lines: ${result.originalLineCount} original, ${result.serializedLineCount} serialized\n`
      report += `Serialized output: ${result.serializedPath}\n\n`
      return
    }

    report += `Status: ${result.differences.length} differences found\n`
    report += `Lines: ${result.originalLineCount} original, ${result.serializedLineCount} serialized\n`
    report += `Serialized output: ${result.serializedPath}\n\n`

    // Group differences by type
    const groupedDiffs: { [key: string]: LineDifference[] } = {}
    result.differences.forEach((diff) => {
      const issueType = diff.issue.split(":")[0]
      if (!groupedDiffs[issueType]) {
        groupedDiffs[issueType] = []
      }
      groupedDiffs[issueType].push(diff)
    })

    // Summary by issue type
    Object.entries(groupedDiffs).forEach(([issueType, diffs]) => {
      report += `  ${issueType} Issues: ${diffs.length}\n`

      // Show first 5 examples of each type
      const samplesToShow = Math.min(5, diffs.length)
      for (let i = 0; i < samplesToShow; i++) {
        const diff = diffs[i]
        report += `    Line ${diff.lineNumber}: ${diff.issue}\n`
        report += `      Original:   "${diff.originalLine}"\n`
        report += `      Serialized: "${diff.serializedLine || "<MISSING>"}"\n`
      }

      if (diffs.length > 5) {
        report += `    ... and ${diffs.length - 5} more ${issueType.toLowerCase()} issues\n`
      }
      report += "\n"
    })

    // Identify potential parsing gaps for this file
    const missingPatterns = new Set<string>()
    result.differences.forEach((diff) => {
      if (diff.originalLine && !diff.serializedLine) {
        const line = diff.originalLine.trim()
        if (line.includes("=")) {
          const key = line.split("=")[0].trim()
          missingPatterns.add(key)
        } else if (line.match(/^[A-Z]/)) {
          const firstWord = line.split(/\s+/)[0]
          missingPatterns.add(firstWord)
        }
      }
    })

    if (missingPatterns.size > 0) {
      report += "  Common patterns in missing lines:\n"
      Array.from(missingPatterns)
        .sort()
        .forEach((pattern) => {
          report += `    - "${pattern}"\n`
        })
      report += "\n"
    }

    report += "\n"
  })

  // Overall summary
  const totalFiles = results.length
  const passedFiles = results.filter((r) => r.differences.length === 0).length
  const failedFiles = totalFiles - passedFiles
  const totalDifferences = results.reduce((sum, r) => sum + r.differences.length, 0)

  report += "Summary\n"
  report += "-".repeat(20) + "\n"
  report += `Files processed: ${totalFiles}\n`
  report += `Files with no mismatches: ${passedFiles}\n`
  report += `Files with mismatches: ${failedFiles}\n`
  report += `Total differences found: ${totalDifferences}\n\n`

  if (failedFiles > 0) {
    report += "Next Steps:\n"
    report += "1. Fix MISSING issues by implementing missing parser/serializer components\n"
    report += "2. Fix VALUE/NUMERIC issues by checking number formatting in serializers\n"
    report += "3. Fix WHITESPACE issues by matching original spacing patterns\n"
    report += "4. Verify bridge and culvert component serialization completeness\n"
  }

  return report
}

function main() {
  console.log("=== HEC-RAS Geometry Files Round-trip Comparison ===\n")

  try {
    const results: FileComparisonResult[] = []

    for (const fileName of GEOMETRY_FILES) {
      const filePath = join("test/data", fileName)
      console.log(`Processing ${fileName}...`)

      try {
        const result = compareFile(filePath)
        results.push(result)

        if (result.differences.length === 0) {
          console.log(`  ✓ All pass - no mismatches`)
        } else {
          console.log(`  ✗ ${result.differences.length} differences found`)
        }
      } catch (error) {
        console.log(`  ✗ Error: ${error}`)
        // Continue with other files even if one fails
      }
    }

    // Generate and save report
    const report = generateReport(results)
    const reportPath = "geometry-roundtrip-report.txt"
    writeFileSync(reportPath, report, "utf-8")

    console.log(`\nReport saved to: ${reportPath}`)
    console.log(`Processed ${results.length} files total`)
  } catch (error) {
    console.error("Error during comparison:", error)
    process.exit(1)
  }
}

// Run main function if this script is executed directly
main()

export { main }
