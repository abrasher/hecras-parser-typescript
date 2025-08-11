#!/usr/bin/env tsx

/**
 * Script to compare original Dingman.g01 file with its round-trip serialized version
 * line by line, highlighting specific differences that need to be fixed.
 */

import { readFileSync, writeFileSync } from "fs"
import { parseGeometry } from "../src/parseGeometry"
import { serializeGeometryString } from "../src/serializers"

interface LineDifference {
  lineNumber: number
  originalLine: string
  serializedLine: string | undefined
  issue: string
}

function main() {
  console.log("=== Dingman.g01 Round-trip Line-by-Line Comparison ===\n")

  try {
    // Read and parse the original file
    const originalContent = readFileSync("test/data/Dingman.g01", "utf-8")
    const geometryData = parseGeometry(originalContent)
    const serializedContent = serializeGeometryString(geometryData)

    // Save serialized output to file for examination
    const serializedOutputPath = "test/data/Dingman.serialized.g01"
    writeFileSync(serializedOutputPath, serializedContent, "utf-8")
    console.log(`Serialized output saved to: ${serializedOutputPath}\n`)

    // Normalize line endings and split into lines
    const originalLines = originalContent.replace(/\r\n/g, "\n").split("\n")
    const serializedLines = serializedContent.split("\n")

    console.log(`Original file: ${originalLines.length} lines`)
    console.log(`Serialized file: ${serializedLines.length} lines\n`)

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

    console.log(`Found ${differences.length} differences:\n`)

    // Group differences by type for easier analysis
    const groupedDiffs: { [key: string]: LineDifference[] } = {}
    differences.forEach((diff) => {
      const issueType = diff.issue.split(":")[0]
      if (!groupedDiffs[issueType]) {
        groupedDiffs[issueType] = []
      }
      groupedDiffs[issueType].push(diff)
    })

    // Output summary by issue type
    Object.entries(groupedDiffs).forEach(([issueType, diffs]) => {
      console.log(`\n=== ${issueType} Issues (${diffs.length}) ===`)

      // Show first 10 examples of each type
      const samplesToShow = Math.min(10, diffs.length)
      for (let i = 0; i < samplesToShow; i++) {
        const diff = diffs[i]
        console.log(`\nLine ${diff.lineNumber}: ${diff.issue}`)
        console.log(`  Original: "${diff.originalLine}"`)
        console.log(`  Serialized: "${diff.serializedLine || "<MISSING>"}"`)
      }

      if (diffs.length > 10) {
        console.log(`  ... and ${diffs.length - 10} more ${issueType.toLowerCase()} issues`)
      }
    })

    // Show sections that are completely missing
    console.log("\n=== Analysis of Missing Content ===")

    if (serializedLines.length < originalLines.length) {
      const missingLineCount = originalLines.length - serializedLines.length
      console.log(`\n${missingLineCount} lines are completely missing from serialization.`)
      console.log("Missing content starts around line:", serializedLines.length + 1)
      console.log("First few missing lines:")

      for (let i = serializedLines.length; i < Math.min(serializedLines.length + 10, originalLines.length); i++) {
        console.log(`  Line ${i + 1}: "${originalLines[i]}"`)
      }
    }

    // Identify potential parsing gaps
    console.log("\n=== Potential Parser/Serializer Gaps ===")

    const missingPatterns = new Set<string>()
    differences.forEach((diff) => {
      if (diff.originalLine && !diff.serializedLine) {
        // Extract pattern from missing lines
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
      console.log("\nCommon patterns in missing lines:")
      Array.from(missingPatterns)
        .sort()
        .forEach((pattern) => {
          console.log(`  - "${pattern}"`)
        })
    }

    console.log("\n=== Next Steps ===")
    console.log("1. Fix MISSING issues by implementing missing parser/serializer components")
    console.log("2. Fix VALUE/NUMERIC issues by checking number formatting in serializers")
    console.log("3. Fix WHITESPACE issues by matching original spacing patterns")
    console.log("4. Verify bridge and culvert component serialization completeness")
  } catch (error) {
    console.error("Error during comparison:", error)
    process.exit(1)
  }
}

// Run main function if this script is executed directly
main()

export { main }
