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
  try {
    // Read and parse the original file
    const originalContent = readFileSync("scripts/geometries/Dingman 2D Model.g01", "utf-8")
    const geometryData = parseGeometry(originalContent)

    const serializedContent = serializeGeometryString(geometryData)

    // Save serialized output to file for examination
    const serializedOutputPath = "test/data/Dingman 2D.serialized.g01"
    writeFileSync(serializedOutputPath, serializedContent, "utf-8")

    // Normalize line endings and split into lines
    const originalLines = originalContent.replace(/\r\n/g, "\n").split("\n")
    const serializedLines = serializedContent.split("\n")

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

    process.exit(1)
  }
}

// Run main function if this script is executed directly
main()

export { main }
