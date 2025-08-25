#!/usr/bin/env tsx

/**
 * Debug script to isolate where Dingman 2D.g01 crashes during parsing/serialization
 */

import { readFileSync, writeFileSync } from "fs"
import { parseGeometry } from "../src/parseGeometry"
import { serializeGeometry } from "../src/serializers/geometrySerializer"
import { serializeGeometryHeader } from "../src/serializers/geometry/geometryHeaderSerializer"
import { serializeStorageArea } from "../src/serializers/geometry/storageAreaSerializer"
import { serializeConnection } from "../src/serializers/geometry/connectionSerializer"

function main() {
  console.log("=== Debugging Dingman 2D.g01 Parsing/Serialization ===\n")

  try {
    console.log("1. Reading file...")
    const originalContent = readFileSync("test/data/Dingman 2D.g01", "utf-8")
    console.log(`   File size: ${originalContent.length} characters`)
    console.log(`   Line count: ${originalContent.split("\n").length} lines`)

    console.log("\n2. Parsing geometry data...")
    const geometryData = parseGeometry(originalContent)
    console.log("   ✓ Parsing completed successfully!")

    // Inspect parsed data structure
    console.log(`   Storage areas: ${geometryData.storageAreas.length}`)
    console.log(`   Connections: ${geometryData.connections.length}`)
    console.log(`   Boundary conditions: ${geometryData.boundaryConditions.length}`)

    // Check for potential circular references in storage areas
    console.log("\n3. Checking for circular references...")
    for (let i = 0; i < geometryData.storageAreas.length; i++) {
      const sa = geometryData.storageAreas[i]
      console.log(`   Storage Area ${i}: ${sa.name || "unnamed"}`)

      // Check if storage area references itself somehow
      if (sa.surfaceLines) {
        console.log(`     Surface lines: ${sa.surfaceLines.length}`)
      }
      if (sa.point2dData) {
        console.log(`     2D points: ${sa.point2dData.length}`)
      }

      // Only check first few to avoid overwhelming output
      if (i >= 5) {
        console.log(`   ... and ${geometryData.storageAreas.length - 5} more storage areas`)
        break
      }
    }

    console.log("\n4. Attempting serialization (with depth tracking)...")

    // Try to serialize just the header first
    console.log("   4a. Testing header serialization...")
    const headerLines = serializeGeometryHeader(geometryData)
    console.log(`   ✓ Header serialized: ${headerLines.length} lines`)

    // Try to serialize storage areas one by one
    console.log("   4b. Testing storage area serialization...")

    for (let i = 0; i < Math.min(geometryData.storageAreas.length, 10); i++) {
      try {
        console.log(`      Testing storage area ${i}: ${geometryData.storageAreas[i].name || "unnamed"}`)
        const storageLines = serializeStorageArea(geometryData.storageAreas[i])
        console.log(`      ✓ Storage area ${i} serialized: ${storageLines.length} lines`)
      } catch (error) {
        console.log(`      ✗ Storage area ${i} FAILED: ${error}`)

        // Inspect this storage area more closely
        const problematicSA = geometryData.storageAreas[i]
        console.log(`         Name: ${problematicSA.name}`)
        console.log(`         Type: ${problematicSA.type}`)
        console.log(`         Surface lines: ${problematicSA.surfaceLines?.length || 0}`)
        console.log(`         2D points: ${problematicSA.point2dData?.length || 0}`)

        // Try to identify circular reference
        console.log("         Checking for circular references...")
        try {
          JSON.stringify(problematicSA)
          console.log("         ✓ No circular references in JSON.stringify")
        } catch (jsonError) {
          console.log(`         ✗ Circular reference detected: ${jsonError}`)
        }

        throw error
      }
    }

    // Try connections
    console.log("   4c. Testing connection serialization...")

    for (let i = 0; i < Math.min(geometryData.connections.length, 5); i++) {
      try {
        console.log(`      Testing connection ${i}`)
        const connectionLines = serializeConnection(geometryData.connections[i])
        console.log(`      ✓ Connection ${i} serialized: ${connectionLines.length} lines`)
      } catch (error) {
        console.log(`      ✗ Connection ${i} FAILED: ${error}`)
        throw error
      }
    }

    console.log("\n5. Full serialization test...")
    const serializedLines = serializeGeometry(geometryData)
    console.log(`   ✓ Full serialization completed: ${serializedLines.length} lines`)

    // Save just a small portion for inspection
    const serializedContent = serializedLines.join("\n")
    const outputPath = "test/data/Dingman 2D.debug.g01"
    writeFileSync(outputPath, serializedContent, "utf-8")
    console.log(`   Debug output saved to: ${outputPath}`)
  } catch (error) {
    console.error("\n💥 Error occurred:", error)

    if (error instanceof RangeError && error.message.includes("Maximum call stack size exceeded")) {
      console.error("\n=== Stack Overflow Details ===")
      console.error("The crash occurred during serialization, likely in a recursive loop.")
      console.error("This suggests either:")
      console.error("1. Circular references in the parsed data structure")
      console.error("2. Infinite recursion in serialization logic")
      console.error("3. Extremely deep object nesting")
    }

    process.exit(1)
  }
}

main()
