#!/usr/bin/env tsx

/**
 * Test script to see if large array spread operations cause stack overflow
 */

function testLargeArrayPush() {
  console.log("Testing large array push operations...")

  // Create a large array similar to the storage area serialization
  const largeArray: string[] = []
  for (let i = 0; i < 150000; i++) {
    largeArray.push(`Line ${i}: Some content here that represents a geometry line`)
  }

  console.log(`Created large array with ${largeArray.length} items`)

  try {
    // Test 1: Using spread operator (this might cause stack overflow)
    console.log("Test 1: Using spread operator...")
    const result1: string[] = []
    result1.push(...largeArray)
    console.log(`✓ Spread operator worked: ${result1.length} items`)
  } catch (error) {
    console.log(`✗ Spread operator failed: ${error}`)
  }

  try {
    // Test 2: Using concat (safer alternative)
    console.log("Test 2: Using concat...")
    const result2: string[] = []
    const final2 = result2.concat(largeArray)
    console.log(`✓ Concat worked: ${final2.length} items`)
  } catch (error) {
    console.log(`✗ Concat failed: ${error}`)
  }

  try {
    // Test 3: Using loop (safest alternative)
    console.log("Test 3: Using loop...")
    const result3: string[] = []
    for (const item of largeArray) {
      result3.push(item)
    }
    console.log(`✓ Loop worked: ${result3.length} items`)
  } catch (error) {
    console.log(`✗ Loop failed: ${error}`)
  }
}

testLargeArrayPush()
