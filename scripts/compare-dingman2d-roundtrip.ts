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

function testGeometry(testFilePath: string) {
  try {
    // Read and parse the original file
    const originalContent = readFileSync(testFilePath, "utf-8")
    const [name, extension] = testFilePath.split(".")
    const serializedOutputPath = `${name}.serialized.${extension}`

    const geometryData = parseGeometry(originalContent)

    const serializedContent = serializeGeometryString(geometryData)

    // Save serialized output to file for examination
    writeFileSync(serializedOutputPath, serializedContent, "utf-8")

    // Normalize line endings and split into lines
    const originalLines = originalContent.replace(/\r\n/g, "\n").split("\n")
    const serializedLines = serializedContent.split("\n")

    console.log(
      `Original lines: ${originalLines.length}\nSerialized lines: ${serializedLines.length}`,
    )

    // Compare line by line until first difference
    const maxLines = Math.max(originalLines.length, serializedLines.length)

    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || ""
      const serializedLine = serializedLines[i] || ""

      if (originalLine !== serializedLine) {
        console.log(`First difference found at line ${i + 1}:`)
        console.log(`  Original:   "${testFilePath}":${i + 1}`)
        console.log(`  Serialized: "${serializedOutputPath}":${i + 1}`)
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
testGeometry("test/data/Dingman 2D.g01")
testGeometry("scripts/geometries/Mitigation1.g01")
testGeometry("scripts/geometries/Mitigation2.g02")
testGeometry("scripts/geometries/Mitigation3.g03")
testGeometry("scripts/geometries/Mitigation4.g04")
testGeometry("scripts/geometries/Mitigation5.g05")
testGeometry("scripts/geometries/Mitigation6.g06")
testGeometry("scripts/geometries/Mitigation7.g07")
testGeometry("scripts/geometries/Mitigation8.g08")
testGeometry("scripts/geometries/Mitigation9.g09")
testGeometry("scripts/geometries/Mitigation10.g10")
