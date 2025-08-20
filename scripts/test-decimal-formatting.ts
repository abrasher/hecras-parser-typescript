#!/usr/bin/env tsx

/**
 * Test script to verify decimal formatting fix
 */

import { formatHECRASCoordinateNumber } from "../src/serializers/utils"

function testDecimalFormatting() {
  console.log("Testing decimal formatting...")

  const testCases = [
    { input: 479942, expected: "479942." },
    { input: 479942.0, expected: "479942." },
    { input: 479935.1042, expected: "479935.1042" },
    { input: 4750969.56331, expected: "4750969.56331" },
    { input: 0.584, expected: " .584" },
    { input: 1, expected: "1." },
    { input: 1.5, expected: "1.5" },
  ]

  let passed = 0
  let failed = 0

  testCases.forEach(({ input, expected }) => {
    const result = formatHECRASCoordinateNumber(input)
    if (result === expected) {
      console.log(`✓ ${input} → "${result}" (expected "${expected}")`)
      passed++
    } else {
      console.log(`✗ ${input} → "${result}" (expected "${expected}")`)
      failed++
    }
  })

  console.log(`\nResults: ${passed} passed, ${failed} failed`)

  if (failed === 0) {
    console.log("🎉 All decimal formatting tests passed!")
  } else {
    console.log("❌ Some tests failed")
  }
}

testDecimalFormatting()
