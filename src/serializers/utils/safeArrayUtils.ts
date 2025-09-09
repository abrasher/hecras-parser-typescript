/**
 * Safe array utilities to prevent stack overflow with large arrays
 */

/**
 * Maximum number of elements to spread at once to avoid stack overflow
 * This is conservative - JavaScript engines can typically handle more,
 * but we want to be safe across all environments
 */
const MAX_SPREAD_SIZE = 10000

/**
 * Safely append an array to another array, handling large arrays without stack overflow
 * @param target Target array to append to
 * @param source Source array to append from
 * @returns The target array (for chaining)
 */
export function safeArrayPush<T>(target: T[], source: T[]): T[] {
  if (source.length <= MAX_SPREAD_SIZE) {
    // Small arrays can use spread operator safely
    target.push(...source)
  } else {
    // Large arrays need to be processed in batches
    for (let i = 0; i < source.length; i += MAX_SPREAD_SIZE) {
      const batch = source.slice(i, i + MAX_SPREAD_SIZE)
      target.push(...batch)
    }
  }
  return target
}

/**
 * Safely concatenate multiple arrays without stack overflow
 * @param arrays Arrays to concatenate
 * @returns New concatenated array
 */
export function safeConcatArrays<T>(...arrays: T[][]): T[] {
  const result: T[] = []
  for (const array of arrays) {
    safeArrayPush(result, array)
  }
  return result
}

/**
 * Safely flatten a nested array structure
 * @param nested Nested array to flatten
 * @returns Flattened array
 */
export function safeFlattenArrays<T>(nested: T[][]): T[] {
  return safeConcatArrays(...nested)
}

/**
 * Check if an array is large enough to potentially cause stack overflow
 * @param array Array to check
 * @returns True if array is considered "large"
 */
export function isLargeArray<T>(array: T[]): boolean {
  return array.length > MAX_SPREAD_SIZE
}

/**
 * Safe replacement for lines.push(...otherLines) pattern
 * Usage: appendLines(lines, serializeStorageArea(storageArea))
 * @param target Target lines array
 * @param source Source lines array
 */
export function appendLines(target: string[], source: string[]): void {
  safeArrayPush(target, source)
}

/**
 * Insert lines at specific indices while preserving order and avoiding duplicates
 * @param target Target lines array
 * @param extras Lines with their target indices
 */
export function insertLinesAtIndices(
  target: string[],
  extras?: { index: number; content: string }[],
): void {
  if (!extras || extras.length === 0) return
  const sorted = [...extras].sort((a, b) => a.index - b.index)

  for (const { index, content } of sorted) {
    const insertionIndex = Math.min(index, target.length)
    if (target[insertionIndex]?.trimEnd() === content.trimEnd()) continue
    target.splice(insertionIndex, 0, content)
  }
}
