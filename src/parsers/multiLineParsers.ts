import { chunk } from "es-toolkit"

interface ParseMultilineArrayParams {
  lines: string[]
  width: number
  maxWidth: number
  numOfEntries: number
  currentIndex: number
}

/**
 *
 * @param lines
 * @param width
 * @param maxWidth
 * @param numOfEntries
 * @param currentIndex
 */
export function parseMultilineArray({
  lines,
  width,
  maxWidth,
  numOfEntries,
  currentIndex,
}: ParseMultilineArrayParams): { data: string[]; nextIndex: number } {
  const entriesPerLine = maxWidth / width
  const numOfLines = Math.ceil(numOfEntries / entriesPerLine)

  const data = new Array(numOfEntries)

  let lineIndex = currentIndex
  for (let i = 0; i < numOfLines; i++) {
    const line = lines[lineIndex]
    const chunks = chunkString(line, width)

    for (let j = 0; j < chunks.length; j++) {
      const entryIndex = i * entriesPerLine + j
      if (entryIndex < numOfEntries) {
        data[entryIndex] = chunks[j].trim()
      }
    }
    lineIndex++
  }

  return { data, nextIndex: lineIndex }
}

export function parseMultilineCSV({
  lines,
  currentIndex,
  numberOfLines,
}: {
  lines: string[]
  currentIndex: number
  numberOfLines: number
}): { data: string[][]; nextIndex: number } {
  const data = new Array(numberOfLines)

  let lineIndex = currentIndex
  for (let i = 0; i < numberOfLines; i++) {
    const line = lines[lineIndex]
    const parts = line.split(",")

    data[i] = parts.map((part) => part.trim())
    lineIndex++
  }

  return { data, nextIndex: lineIndex }
}

function chunkString(str: string, width: number): string[] {
  const length = str.length
  const chunks = new Array(Math.ceil(length / width))

  for (let i = 0, j = 0; i < length; i += width, j++) {
    chunks[j] = str.slice(i, i + width)
  }

  return chunks
}

export const arrayToCoordinates = (arr: string[]): [number, number][] => arrayToNumberPairs(arr, 2)

export const arrayToNumberPairs = <T extends string[], N extends number>(arr: T, chunkSize: N) =>
  chunk(
    arr.map((d: string): number => parseFloat(d)),
    chunkSize,
  ) as NTuple<number, N>[]

// Helper type: build a tuple of length N
type NTuple<T, N extends number, R extends unknown[] = []> = R["length"] extends N
  ? R
  : NTuple<T, N, [T, ...R]>
