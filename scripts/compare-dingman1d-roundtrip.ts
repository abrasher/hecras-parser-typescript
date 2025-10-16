#!/usr/bin/env tsx

/**
 * Script to compare Dingman 1D.g06 file with its round-trip serialized version
 * line by line, stopping at the first difference.
 */

import { readFileSync, writeFileSync } from "fs"
import { parseGeometry } from "../src/parseGeometry"
import { serializeGeometryString } from "../src/serializers"

function main() {
  console.log("=== Dingman 1D.g06 Round-trip Line-by-Line Comparison ===\n")

  try {
    // Read and parse the original file
    const originalContent = readFileSync("test/data/Dingman-1D.g06", "utf-8")
    const geometryData = parseGeometry(originalContent)

    // Debug: Check cross-sections in parsed data
    console.log(`Parsed ${geometryData.riverReaches.length} river reaches`)
    let totalCrossSections = 0
    for (let i = 0; i < Math.min(3, geometryData.riverReaches.length); i++) {
      const reach = geometryData.riverReaches[i]
      totalCrossSections += reach.crossSections.length
      console.log(
        `  ${reach.riverName}/${reach.reachName}: ${reach.crossSections.length} cross-sections, ${reach.coordinates.length}/${reach.coordinateCount} coords`,
      )
    }
    console.log(`Total cross-sections in first 3 reaches: ${totalCrossSections}`)

    // Check if the first reach from our earlier investigation has the expected coordinate issue
    if (geometryData.riverReaches.length > 0) {
      const firstReach = geometryData.riverReaches[0]
      console.log(`First reach: expected ${firstReach.coordinateCount} coords, got ${firstReach.coordinates.length}`)
    }

    const serializedContent = serializeGeometryString(geometryData)

    // Save serialized output to file for examination
    const serializedOutputPath = "test/data/Dingman-1D.serialized.g06"
    writeFileSync(serializedOutputPath, serializedContent, "utf-8")
    console.log(`Serialized output saved to: ${serializedOutputPath}\n`)

    // Normalize line endings and split into lines
    const originalLines = originalContent.replace(/\r\n/g, "\n").split("\n")
    const serializedLines = serializedContent.split("\n")

    console.log(`Original file: ${originalLines.length} lines`)
    console.log(`Serialized file: ${serializedLines.length} lines\n`)

    // Compare line by line until first difference
    const maxLines = Math.max(originalLines.length, serializedLines.length)

    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || ""
      const serializedLine = serializedLines[i] || ""

      if (originalLine !== serializedLine) {
        console.log(`First difference found at line ${i + 1}:`)
        console.log(`  Original:   "test/data/Dingman-1D.g06":${i + 1}`)
        console.log(`  Serialized: "test/data/Dingman-1D.serialized.g06":${i + 1}`)
        console.log(`  Content: \n "${originalLine}" \n "${serializedLine}"`)
        return
      }
    }

    console.log("No differences found - files are identical!")
  } catch (error) {
    console.error("Error during comparison:", error)
    process.exit(1)
  }
}

// Run main function if this script is executed directly
main()

export { main }
