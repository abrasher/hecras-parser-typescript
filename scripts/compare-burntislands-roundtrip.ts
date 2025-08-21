#!/usr/bin/env tsx

/**
 * Script to compare BurntIslands.g01 file with its round-trip serialized version
 * line by line, stopping at the first difference.
 */

import { readFileSync, writeFileSync } from "fs"
import { parseGeometry } from "../src/parseGeometry"
import { serializeGeometryString } from "../src/serializers"

function main() {
  console.log("=== BurntIslands.g01 Round-trip Line-by-Line Comparison ===\n")

  try {
    // Read and parse the original file
    const originalContent = readFileSync("test/data/BurntIslands.g01", "utf-8")
    const geometryData = parseGeometry(originalContent)
    const serializedContent = serializeGeometryString(geometryData)

    // Save serialized output to file for examination
    const serializedOutputPath = "test/data/BurntIslands.serialized.g01"
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
        console.log(`Original:   "${originalLine}"`)
        console.log(`Serialized: "${serializedLine}"`)
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
