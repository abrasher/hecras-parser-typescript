# HEC-RAS Parser Conventions

This document establishes the standard conventions for writing HEC-RAS file parsers in this codebase. These conventions replace the legacy mutation-based approach used in older parsers with a modern, functional programming approach that emphasizes type safety, immutability, and testability.

## Overview

### Why New Conventions?

The original parsing approach in this codebase used object mutation patterns that are:

- **Error-prone**: Modifying objects in place makes it harder to track data flow
- **Hard to test**: Requires pre-creating objects and checking their final state
- **Type-unsafe**: Mutation can bypass TypeScript's type checking
- **Not composable**: Difficult to combine parsers or handle nested structures

### The New Approach

The new conventions, exemplified by `src/parsers/culvertParser.ts`, use functional programming principles:

- **Immutable**: Create and return new objects instead of mutating parameters
- **Predictable**: Consistent function signatures and return types
- **Type-safe**: Full TypeScript type coverage with proper validation
- **Testable**: Pure functions that are easy to test and debug
- **Composable**: Parsers can be easily combined and nested

## Core Principles

### 1. Functional Programming

All parsers should be pure functions that:

- Take input parameters without modifying them
- Return new data structures
- Have no side effects (except controlled error throwing)
- Are deterministic (same input always produces same output)

### 2. Immutability

Never modify input parameters. Always create and return new objects:

```typescript
// ❌ Legacy approach - mutates the input object
function parseStorageArea(lines: string[], index: number, sa: StorageArea): number {
  sa.mannings = parseFloat(value) // Modifying input object
  return nextIndex
}

// ✅ New approach - returns new data
function parseStorageArea(lines: string[], index: number): { data: StorageArea; nextIndex: number } {
  const storageArea = {
    mannings: parseFloat(value), // Creating new object
    // ... other properties
  }
  return { data: storageArea, nextIndex }
}
```

### 3. Type Safety

Use proper TypeScript types throughout:

- All function parameters and return types must be explicitly typed
- Use union types for optional or variable data
- Validate inputs and throw descriptive errors for invalid data

### 4. Input Validation

Always validate the first line to ensure the parser can handle the input:

```typescript
export function parseMyData(line: string, lines: string[], currentIndex: number) {
  if (!line.startsWith("Expected Header=")) {
    throw new Error(`parseMyData was given a line it can't parse: ${line}`)
  }
  // ... rest of parsing logic
}
```

## Function Signatures

### Standard Return Type

All parsing functions must return objects with this structure:

```typescript
type ParseResult<T> = {
  data: T // The parsed data structure
  nextIndex: number // Index of the next unparsed line
}
```

### Function Naming

- **Collection parsers**: `parseXxxData()` - Returns arrays of items
- **Single item parsers**: `parseXxxGroup()` or `parseXxx()` - Returns single items
- **Sub-item parsers**: `parseXxxItem()` or specific names like `parseCulvertBarrel()`

### Parameter Order

Standard parameter order for all parsers:

```typescript
function parseXxx(
  line: string, // The current line being parsed (for validation)
  lines: string[], // The complete array of lines
  currentIndex: number, // Index of the current line
): ParseResult<T>
```

## Parsing Patterns

### Pattern 1: Collection of Similar Items

When parsing multiple similar items (like multiple culvert groups):

```typescript
export function parseCulvertData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: CulvertGroupProperties[]; nextIndex: number } {
  // Validate first line
  if (!line.startsWith("Connection Culv=")) {
    throw new Error(`culvertParser was given a line it can't parse: ${line}`)
  }

  const culvertGroups = [] as CulvertGroupProperties[]
  let index = currentIndex

  // Parse multiple items until we find something different
  while (lines[index]?.startsWith("Connection Culv=")) {
    const { data, nextIndex } = parseCulvertGroup(lines[index], lines, index)
    culvertGroups.push(data)
    index = nextIndex
  }

  return { data: culvertGroups, nextIndex: index }
}
```

### Pattern 2: Single Complex Item

When parsing one complex item with multiple sub-components:

```typescript
export function parseCulvertGroup(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: CulvertGroupProperties; nextIndex: number } {
  const { value } = parseKeyValue(line)
  const parts = parseCommaSeparated(value)

  // Create the main data structure
  const culvertData = {
    shape: parseInt(parts[0]),
    rise: parseFloat(parts[1]),
    // ... other properties from the main line
    barrels: [], // Will be populated below
    barrelStations: [], // Will be populated below
  } as CulvertGroupProperties

  let index = currentIndex + 1

  // Parse fixed-format sub-data (when count is known)
  const numberOfStationLines = Math.ceil(culvertData.numberOfBarrels / 5)
  const endIndex = index + numberOfStationLines

  for (; index < endIndex; index++) {
    const stations = parseLineStationPairs(lines[index])
    culvertData.barrelStations.push(...stations)
  }

  // Parse variable-format sub-data (until we hit something unrecognized)
  const validKeys = ["Conn Culvert Barrel", "Conn Culv Bottom n"]
  const isValidLine = (line: string) => validKeys.some((key) => line?.startsWith(key))

  while (isValidLine(lines[index])) {
    const currentLine = lines[index]
    if (currentLine.startsWith("Conn Culvert Barrel")) {
      const { data, nextIndex } = parseCulvertBarrel(currentLine, lines, index)
      culvertData.barrels.push(data)
      index = nextIndex
    } else if (currentLine.startsWith("Conn Culv Bottom n")) {
      culvertData.nBottom = parseFloat(parseKeyValue(currentLine).value)
      index++
    } else {
      break // This should never happen due to isValidLine check
    }
  }

  return { data: culvertData, nextIndex: index }
}
```

### Pattern 3: Fixed-Format Data Blocks

When HEC-RAS tells you exactly how many lines to expect:

```typescript
// HEC-RAS format: "Storage Area Surface Line= 6" followed by 6 coordinate pairs
const numPoints = parseInt(parseKeyValue(line).value)
index++

let pointsCollected = 0
while (pointsCollected < numPoints && index < lines.length) {
  const coords = parseCoordinates(lines[index])
  data.surfaceLine.push(...coords)
  pointsCollected += coords.length
  index++
  if (pointsCollected >= numPoints) break
}
```

### Pattern 4: Early Exit Conditions

Handle cases where data might not be present:

```typescript
// If no coordinates are defined, skip coordinate parsing
if (numberOfCoordinatesForBarrel === 0) {
  return { data: barrelData, nextIndex: currentIndex + 1 }
}

// Otherwise continue with coordinate parsing...
const lineCount = Math.ceil(numberOfCoordinatesForBarrel / 2)
// ... rest of parsing logic
```

## Architecture Guidelines

### Multi-Level Parsing

Structure parsers hierarchically for complex data:

1. **Collection Level**: `parseXxxData()` - Handles multiple similar items
2. **Group Level**: `parseXxxGroup()` - Handles one complex item with sub-components
3. **Item Level**: `parseXxxItem()` - Handles individual sub-components

Example hierarchy:

- `parseCulvertData()` → multiple culvert groups
  - `parseCulvertGroup()` → one culvert group with multiple barrels
    - `parseCulvertBarrel()` → one barrel with coordinates

### Error Handling

- **Input Validation**: Always validate the first line and throw descriptive errors
- **Boundary Checking**: Check array bounds before accessing `lines[index]`
- **Data Validation**: Validate parsed numbers and handle NaN/null cases
- **Graceful Degradation**: When possible, continue parsing even if some data is malformed

```typescript
// Input validation
if (!line.startsWith("Expected Header=")) {
  throw new Error(`parseMyData was given a line it can't parse: ${line}`)
}

// Boundary checking
while (index < lines.length && isValidLine(lines[index])) {
  // ... parsing logic
}

// Data validation
const numValue = parseFloat(parts[0])
if (isNaN(numValue)) {
  console.warn(`Invalid number in line: ${line}`)
  numValue = 0 // or some default
}
```

### Documentation

Include comprehensive comments explaining:

1. **HEC-RAS Format**: Document the expected format and any quirks
2. **Parsing Logic**: Explain why you're parsing in a particular way
3. **Edge Cases**: Document special cases and how they're handled

```typescript
// Barrel stations are defined on the next lines
// The line is max width of 80, each number being 8 characters. You can fit 5 pairs per line
// [5 pair per line = (80 chars / 8 char per num) / 2 num per pair]
const numberOfStationLines = Math.ceil(culvertData.numberOfBarrels / 5)

// Barrel coordinates are 64 characters wide, 16 characters a number, 2 pairs a line
// This means we can fit 2 coordinates per line, so number of lines is coordinates / 2
const lineCount = Math.ceil(numberOfCoordinatesForBarrel / 2)
```

## Code Examples

### Before (Legacy Approach)

```typescript
// ❌ Legacy pattern - hard to test, type-unsafe, mutates input
export function parseStorageAreaData(
  lines: string[],
  currentIndex: number,
  sa: StorageArea, // Mutating this object
  isNewSection: (line: string) => boolean,
): number {
  // Only returns index
  let index = currentIndex
  let line = lines[index]

  while (line !== null && !isNewSection(line) && index < lines.length) {
    if (line.startsWith("Storage Area Mannings=")) {
      sa.mannings = parseFloat(parseKeyValue(line)?.value || "0") // Mutation
      index++
    }
    // ... more mutation logic
    line = lines[index]
  }
  return index
}
```

### After (New Approach)

```typescript
// ✅ New pattern - testable, type-safe, immutable
export function parseStorageAreaData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: StorageArea[]; nextIndex: number } {
  // Input validation
  if (!line.startsWith("Storage Area=")) {
    throw new Error(`parseStorageAreaData was given a line it can't parse: ${line}`)
  }

  const storageAreas = [] as StorageArea[]
  let index = currentIndex

  // Parse multiple storage areas
  while (lines[index]?.startsWith("Storage Area=")) {
    const { data, nextIndex } = parseStorageAreaGroup(lines[index], lines, index)
    storageAreas.push(data)
    index = nextIndex
  }

  return { data: storageAreas, nextIndex: index }
}

export function parseStorageAreaGroup(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: StorageArea; nextIndex: number } {
  // Create new object instead of mutating
  const storageArea = {
    name: parseKeyValue(line).value,
    mannings: 0,
    surfaceLine: [],
    volumeElevationData: [],
    // ... other properties
  } as StorageArea

  let index = currentIndex + 1

  // Parse sub-components
  const validKeys = ["Storage Area Mannings", "Storage Area Surface Line", "Storage Area Vol Elev"]
  const isValidLine = (line: string) => validKeys.some((key) => line?.startsWith(key))

  while (index < lines.length && isValidLine(lines[index])) {
    const currentLine = lines[index]

    if (currentLine.startsWith("Storage Area Mannings=")) {
      storageArea.mannings = parseFloat(parseKeyValue(currentLine).value)
      index++
    } else if (currentLine.startsWith("Storage Area Surface Line=")) {
      const { data: coords, nextIndex } = parseSurfaceLineData(currentLine, lines, index)
      storageArea.surfaceLine = coords
      index = nextIndex
    }
    // ... handle other cases
  }

  return { data: storageArea, nextIndex: index }
}
```

## Testing Standards

### Test Structure

Write comprehensive tests for the new parser pattern:

```typescript
describe("Storage Area Parser", () => {
  const testData = `Storage Area=Test Area
Storage Area Mannings=0.035
Storage Area Surface Line= 4
    100.0   200.0   110.0   210.0   120.0   220.0   130.0   230.0`

  const lines = testData.split("\n")

  it("should parse storage area data correctly", () => {
    const result = parseStorageAreaData(lines[0], lines, 0)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].name).toBe("Test Area")
    expect(result.data[0].mannings).toBe(0.035)
    expect(result.data[0].surfaceLine).toHaveLength(4)
    expect(result.nextIndex).toBe(3)
  })

  it("should validate input line", () => {
    expect(() => {
      parseStorageAreaData("Invalid Line", lines, 0)
    }).toThrow("parseStorageAreaData was given a line it can't parse: Invalid Line")
  })

  it("should handle empty data gracefully", () => {
    const result = parseStorageAreaData("Storage Area=Empty", ["Storage Area=Empty"], 0)
    expect(result.data[0].surfaceLine).toHaveLength(0)
    expect(result.nextIndex).toBe(1)
  })
})
```

### Test Data

- **Use real HEC-RAS data** when possible for integration tests
- **Create minimal examples** for unit tests of specific functionality
- **Test edge cases** like empty data, malformed input, boundary conditions
- **Validate both data content and nextIndex** to ensure proper parsing progression

## Migration Checklist

When converting an existing parser to the new conventions:

### 1. Analyze Current Parser

- [ ] Identify what data structures it creates
- [ ] Map out the parsing logic flow
- [ ] Note any special edge cases or format quirks
- [ ] Check existing tests to understand expected behavior

### 2. Design New Structure

- [ ] Define TypeScript interfaces for all data structures
- [ ] Plan the parser hierarchy (collection → group → item)
- [ ] Identify validation requirements
- [ ] Design error handling strategy

### 3. Implement New Parser

- [ ] Create collection-level parser (`parseXxxData`)
- [ ] Create group-level parser if needed (`parseXxxGroup`)
- [ ] Create item-level parsers for sub-components
- [ ] Add comprehensive input validation
- [ ] Include detailed comments about format and logic

### 4. Update Tests

- [ ] Convert mutation-based tests to return-value tests
- [ ] Add input validation tests
- [ ] Test edge cases and error conditions
- [ ] Ensure test coverage of all parsing paths

### 5. Update Integration Points

- [ ] Update any code that calls the old parser
- [ ] Update import statements if function names changed
- [ ] Verify compatibility with the broader parsing pipeline

### 6. Documentation

- [ ] Update any existing format documentation
- [ ] Add inline comments explaining HEC-RAS format quirks
- [ ] Document any breaking changes or new requirements

## Common Pitfalls

### 1. Index Management

Always be careful with index advancement:

```typescript
// ❌ Easy to forget incrementing
while (condition) {
  // parsing logic
  // index++ forgotten!
}

// ✅ Clear index management
while (condition) {
  if (someCondition) {
    const { data, nextIndex } = parseSubItem(line, lines, index)
    result.push(data)
    index = nextIndex // Let the sub-parser handle advancement
  } else {
    // Handle simple case
    index++ // Explicit advancement
  }
}
```

### 2. Boundary Checking

Always check array bounds:

```typescript
// ❌ Can cause crashes
while (lines[index].startsWith("Something")) {
  // What if lines[index] is undefined?
}

// ✅ Safe boundary checking
while (index < lines.length && lines[index]?.startsWith("Something")) {
  // Safe access
}
```

### 3. Data Validation

Handle malformed data gracefully:

```typescript
// ❌ Can throw unexpected errors
const numValue = parseInt(parts[0])
data.someNumber = numValue

// ✅ Validate and provide defaults
const numValue = parseInt(parts[0])
if (isNaN(numValue)) {
  console.warn(`Invalid number in line: ${line}`)
  data.someNumber = 0 // or throw a descriptive error
} else {
  data.someNumber = numValue
}
```

## Conclusion

These conventions ensure that all parsers in the codebase are:

- **Consistent**: Same patterns and function signatures throughout
- **Maintainable**: Clear, well-documented code that's easy to modify
- **Testable**: Pure functions that are easy to test comprehensively
- **Type-safe**: Full TypeScript coverage prevents runtime errors
- **Robust**: Proper error handling and validation for real-world data

When in doubt, refer to `src/parsers/culvertParser.ts` as the canonical example of these conventions in practice.
