#!/usr/bin/env tsx

/**
 * Script to compare Dingman 2D.g01 file with its round-trip serialized version
 * line by line, stopping at the first difference.
 *
 * Note: This file may cause stack overflow issues due to parsing complexity.
 */

import { readFileSync, writeFileSync } from "fs"
import { parseGeometry } from "../src/parseGeometry"
import { serializeGeometryString } from "../src/serializers"

function main() {
  console.log("=== Dingman 2D.g01 Round-trip Line-by-Line Comparison ===\n")

  try {
    // Read and parse the original file
    const originalContent = readFileSync("test/data/Dingman 2D.g01", "utf-8")
    const geometryData = parseGeometry(originalContent)

    // Debug: Check parsed data structure
    console.log(`Parsed ${geometryData.riverReaches.length} river reaches`)
    console.log(`Parsed ${geometryData.storageAreas.length} storage areas`)
    console.log(`Parsed ${geometryData.connections.length} connections`)

    let totalCrossSections = 0
    for (let i = 0; i < Math.min(3, geometryData.riverReaches.length); i++) {
      const reach = geometryData.riverReaches[i]
      totalCrossSections += reach.crossSections.length
      console.log(
        `  ${reach.riverName}/${reach.reachName}: ${reach.crossSections.length} cross-sections, ${reach.coordinates.length}/${reach.coordinateCount} coords`,
      )
    }
    console.log(`Total cross-sections in first 3 reaches: ${totalCrossSections}`)

    // Check storage areas
    if (geometryData.storageAreas.length > 0) {
      const firstStorageArea = geometryData.storageAreas[0]
      console.log(`First storage area: ${firstStorageArea.id}, ${firstStorageArea.points2D.length} 2D points`)
    }

    const serializedContent = serializeGeometryString(geometryData)

    // Save serialized output to file for examination
    const serializedOutputPath = "test/data/Dingman 2D.serialized.g01"
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
        console.log(`  Original:   "test/data/Dingman 2D.g01":${i + 1}`)
        console.log(`  Serialized: "test/data/Dingman 2D.serialized.g01":${i + 1}`)
        console.log(`  Content: \n "${originalLine}" \n "${serializedLine}"`)
        return
      }
    }

    console.log("No differences found - files are identical!")
  } catch (error) {
    console.error("Error during comparison:", error)

    if (error instanceof RangeError && error.message.includes("Maximum call stack size exceeded")) {
      console.error("\n=== Stack Overflow Analysis ===")
      console.error("This error indicates infinite recursion or extremely deep recursion.")
      console.error("Possible causes:")
      console.error("1. Circular references in parsed geometry data")
      console.error("2. Infinite loop in parser logic")
      console.error("3. Extremely deep nesting in 2D geometry structures")
      console.error("4. Bug in serialization causing recursive processing")
      console.error("\nRecommendations:")
      console.error("- Add recursion depth limits to parsers")
      console.error("- Check for circular references in data structures")
      console.error("- Test with smaller portions of the file")
      console.error("- Add debug logging to identify the problematic section")
    }

    process.exit(1)
  }
}

// Run main function if this script is executed directly
main()

export { main }
