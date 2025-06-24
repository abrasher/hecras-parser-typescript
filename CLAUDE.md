### Development

- `npm run build` - Build project (TypeScript compilation + Vite build)
- `tsc` - Run TypeScript compiler for type checking

### Testing

- `npm test` - Run tests with Vitest
- `npm run test:run` - Run tests once (CI mode)

### Code Quality

- `npm run format` - Format code with Prettier
- `npm run lint` - Run ESLint for code linting
- `npm run lint:fix` - Run ESLint with automatic fixes


## Architecture

This is a TypeScript library for parsing HEC-RAS geometry files (.g01, .g02, etc.) into structured data models.

### Core Components

**Main Parser**: `parseGeometry` (from `/src/parseGeometry.ts`) - The main entry point for parsing HEC-RAS geometry files. Uses a simplified, direct parsing approach with specialized parsers for different geometry components.

**Atomic Parsers**: `/src/parsers/atomic.ts` - Low-level parsing primitives for extracting data from HEC-RAS file lines:
- Line parsing utilities
- Data type extraction functions  
- Format-specific parsing helpers

**Line Parsers**: `/src/parsers/lineParsers.ts` - Higher-level line-based parsing utilities for common HEC-RAS patterns.

**Specialized Parsers**: `/src/parsers/geometry/` - Component-specific parsers:
- `culvertParser.ts` - Culvert connection parsing (modern implementation pattern)
- `storageAreaParser.ts` - Storage area definitions
- `connectionParser.ts` - General connection parsing utilities

**Data Models**: `/src/models/` - TypeScript interfaces representing HEC-RAS geometry entities:

**Core Models**:
- `/src/models/geometry/geometryHeaders.ts` - Root geometry container and headers
- `/src/models/geometry/storageArea.ts` - Storage area definitions  
- `/src/models/geometry/culvert.ts` - Comprehensive culvert connection interfaces with enums
- `/src/models/bridge.ts` - Bridge connection interfaces and components
- `/src/models/connection.ts` - General connection types

### Parsing Strategy

**Modern Parsing Pattern**: Follow the conventions established in `/src/parsers/geometry/culvertParser.ts`:
- Use atomic parsing functions from `/src/parsers/atomic.ts`
- Implement structured parsing with clear data extraction phases
- Return both parsed data and parsing metadata (lines consumed, etc.)
- Use TypeScript interfaces for strong typing
- Include comprehensive error handling

**Atomic Parsing System**: The codebase uses a two-level parsing approach:
1. **Atomic Level** (`/src/parsers/atomic.ts`) - Low-level line parsing, data type extraction
2. **Component Level** (`/src/parsers/geometry/`) - Higher-level component assembly using atomic functions

**Connection Types Supported**:
- **Culvert Connections** - Full implementation with detailed flow characteristics
- **Bridge Connections** - Comprehensive bridge geometry and hydraulic parameters  
- **Storage Area Connections** - Storage area definitions and connections

### Test Data

Test files use real HEC-RAS geometry data:

- `test/data/Muncie.g01` - Full geometry file for comprehensive testing
- `test/data/Dingman.g01` - Smaller geometry file optimized for LLM usage

Test suites:

- `test/geometry/ConnectionBridge.test.ts` - Comprehensive bridge connection parsing tests with incremental validation
- `test/geometry/ConnectionCulvert.test.ts` - Culvert connection parsing tests
- `test/atomParsers.test.ts` - Atomic parser primitive tests

## HEC-RAS Format Gotchas

**CRITICAL**: HEC-RAS files have strict but weird formatting that can break parsers if not handled carefully. Always use a combination of atomic or line parsers if possible. Do not duplicate functionality.

### Documentation References

For detailed parsing specifications, see:
- `docs/bridgeconnection.md` - Bridge connection format specification and parsing details
- `docs/culvert-data-format.md` - Comprehensive culvert data format documentation  
- `docs/parsing-conventions.md` - Parsing standards and best practices

### Key Parsing Challenges

**Fixed-Width vs Variable-Width Fields**:

- Some fields are fixed-width (usually powers of 2: 2,4,8,16,32 characters)
- Others are variable-width with limits
- Fixed-width fields MUST preserve exact spacing, even if it looks wrong
- Example: `Storage Area=2D_Grid         ,,` (note the trailing spaces)

**Inconsistent Key Formats**:

- Most keys are "Key=Value" format with sentence case
- Some mix spaces: `Storage Area 2D PointsPerimeterTime=21May2025 13:18:09`
- Some use colons for nesting: `Conn BR: BR SE=1,0`
- Snake_case occasionally appears: `Is_Ogee`

**Multiline Value Parsing**:

- Values can span multiple lines unpredictably
- First line often indicates count: `Storage Area Surface Line= 6`
- Subsequent lines have no consistent spacing rules

**Table-Like Data**:

- Some sections store data in pseudo-table format with no clear delimiters
- Values may be space-separated but with inconsistent spacing
- Headers don't always align with data columns

**Long Text Fields**:

- Surrounded by `BEGIN PROPERTYNAME:` and `END PROPERTYNAME:` blocks
- Can contain multiple lines and special characters
- No apparent length limits

### General Parsing Principles

Always assume the format is wrong until proven right. Use comprehensive validation and provide meaningful error messages for format inconsistencies.

## Important things when Developing Parsers

When writing parsing logic, populate an adjacent documentation file in the docs folder. The document will be used to reconstruct the geometry file at a later date.

It should at minimum list for each property

- Original Key Name in the HECRAS file
- Key Object Path it is mapped to
- The type of value / parsing logic required to extract it
- Any special notes such as field lengths or other quirks
- An example input and example output

After making changes to a parser make sure you update the documentation


## Core Philosophy

**PRAGMATIC PARSING IS THE PRIORITY.** This library focuses on correctly parsing complex engineering file formats where clarity, maintainability, and correctness take precedence over abstract programming principles. The code should be readable by engineers familiar with HEC-RAS formats.

I follow Test-Driven Development (TDD) with an emphasis on comprehensive behavioral testing using real HEC-RAS data. All work should result in parsers that handle the full complexity of actual engineering files.

## Quick Reference

**Key Principles:**

- Write tests first (TDD) with real HEC-RAS data
- Test complete parsing workflows, not isolated units
- Use type assertions only when it makes code cleaner or more type-safe (never use it to broaden the type of an object)
- Practical mutability during parsing phases
- Functions should handle complete parsing responsibilities
- TypeScript strict mode always
- Use real interfaces/types in tests, never redefine them
- Document HEC-RAS format quirks and parsing decisions

**Preferred Tools:**

- **Language**: TypeScript (strict mode)
- **Testing**: Vitest for test framework
- **Parsing**: Stateful parsing with index management

## Testing Principles

### Comprehensive Parsing Tests

- **Test complete parsing workflows** - Tests should verify that real HEC-RAS data parses correctly into expected object structures
- Test using actual HEC-RAS geometry file content, not simplified mock data
- Focus on end-to-end parsing behavior rather than isolated function units
- Tests should catch format changes and parsing regressions
- **Coverage targets**: 100% coverage through comprehensive parsing scenarios
- Tests should document expected parsing behavior for different HEC-RAS format variations

### Testing Tools

- **Vitest** for testing framework
- **Real HEC-RAS data** embedded as test strings for comprehensive format testing
- All test code must follow the same TypeScript strict mode rules as production code

### Test Organization

```
src/
  parsers/
    geometry/
      culvertParser.ts
      culvertParser.test.ts // Co-located tests for domain-specific parsing logic
test/
  data/
    Muncie.g01 // Real HEC-RAS files for integration testing
    Dingman.g01 // Smaller files for focused testing
```

### Test Data Pattern

Use real HEC-RAS format strings with complete expected object structures:

```typescript
// Use actual HEC-RAS format strings
const culvertTestData = `Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64,2,Group #1,0,
    3.56    4.96    6.56    9.96
Conn Culvert Barrel=1,Barrel #01,2
    484557.98934   4751436.44773     484544.9229   4351438.60715
Conn Culvert Barrel=2,Barrel #02,2
    484557.98934   4751436.44773     484544.9229   4351438.60715`

// Define complete expected results
const expectedCulvertData: CulvertGroupProperties[] = [
  {
    shape: 1,
    rise: 1.5,
    span: 1.5,
    length: 13.24,
    nTop: 0.024,
    entranceLoss: 0.9,
    exitLoss: 1,
    chart: 2,
    scale: 3,
    upstreamInvert: 260.71,
    downstreamInvert: 260.64,
    numberOfBarrels: 2,
    culvertGroupName: "Group #1",
    unknownFlag: 0,
    barrelStations: [
      { upstream: 3.56, downstream: 4.96 },
      { upstream: 6.56, downstream: 9.96 }
    ],
    barrels: [
      { 
        id: 1, 
        name: "Barrel #01", 
        coordinates: [
          { x: 484557.98934, y: 4751436.44773 },
          { x: 484544.9229, y: 4351438.60715 }
        ]
      },
      // ... complete barrel data
    ]
  }
]

// Test complete parsing workflow
describe("Culvert parsing", () => {
  it("should parse complete culvert data correctly", () => {
    const lines = culvertTestData.split('\n')
    const result = parseCulvertData(lines[0], lines, 0)
    
    expect(result.data).toEqual(expectedCulvertData)
  })
})
```

Key principles:

- Use real HEC-RAS format strings as test input
- Define complete expected object structures inline
- Test entire parsing workflows, not individual functions
- Validate that complex parsing produces correct structured output
- Include format edge cases and variations found in actual files

## TypeScript Guidelines

### Strict Mode Requirements

```json
// Recommended strict configuration for improved code quality:
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext", 
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "moduleResolution": "node",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "exclude": ["dist"]
}
```

- **No `any`** - ever. Use `unknown` if type is truly unknown
- **Try not to use type assertions** (`as SomeType`) unless to make code cleaner or more type-safe
- **No `@ts-ignore`** or `@ts-expect-error` without explicit explanation
- These rules apply to test code as well as production code

### Type Definitions

- **Prefer `interface` over `type`** in all cases except when `interface` is not usable (disciminated unions)
- Use explicit typing where it aids clarity, but leverage inference where appropriate
- Utilize utility types effectively (`Pick`, `Omit`, `Partial`, `Required`, etc.)
- Create domain-specific types (e.g., `GeometryId`, `ElevationValue`) for type safety
- Use enums for well-defined constants and structured interfaces for complex data

```typescript
// Good
type GeometryId = string & { readonly brand: unique symbol };
type ElevationValue = number & { readonly brand: unique symbol };

// Avoid
type GeometryId = string;
type ElevationValue = number;
```

#### Interface-First Development with TypeScript

Define clear, well-structured interfaces that represent your domain entities:

```typescript
// Define enums for well-known constants
export enum CULVERT_SHAPE {
  CIRCLE = 1,
  BOX = 2,
  PIPE_ARCH = 3,
  ARCH = 4,
  SEMI_CIRCLE = 5,
  LOW_ARCH = 6,
  HIGH_ARCH = 7,
  CONSPAN_ARCH = 8,
}

// Define shared types for common patterns
export interface StationElevationPoint {
  station: number
  elevation: number
}

export interface UpstreamDownstreamPair {
  upstream: number
  downstream: number
}

// Define complex domain interfaces with clear structure
export interface CulvertGroupProperties {
  shape: CULVERT_SHAPE
  rise: number // ft or m
  span: number // ft or m
  length: number // ft or m
  nTop: number
  nBottom?: number
  nBottomDepth?: number
  entranceLoss: number
  exitLoss: number
  chart: number
  scale: number
  upstreamInvert: number // ft or m
  downstreamInvert: number // ft or m
  numberOfBarrels: number
  culvertGroupName: string
  unknownFlag: number
  barrelStations: UpstreamDownstreamPair[]
  barrels: CulvertBarrelProperties[]
  depthBlocked?: number
}

// Example of interface composition for complex domains
export interface BridgeConnection {
  bridge: BridgeConfiguration
  pressureWeir: PressureWeirData
  deckParameters: DeckParameters
  bridgeSections: BridgeSection[]
  bridgeCoefficients: BridgeCoefficients
  bridgeSkew: number
  crossSections: CrossSection[]
  ineffectiveFlowAreas: IneffectiveFlowArea[]
}

export interface BridgeConfiguration {
  // Comments document domain-specific constraints and meanings
  momentumEquationAddFriction: number // -1 means enabled, 0 means disabled
  momentumEquationAddWeight: number // -1 means enabled, 0 means disabled
  pressureFlowCriteria: number // -1 means Upstream Energy Gradeline, 0 means Upstream water surface
  classBDefaults: number // -1 means Inside Bridge at Upstream End, 0 means Inside Bridge at Downstream End
  param5: number
  contractionCoefficient: number
  expansionCoefficient: number
}

```

#### Interface Usage in Tests

**CRITICAL**: Tests must use real interfaces and types from the main project, not redefine their own.

```typescript
// ❌ WRONG - Defining interfaces in test files
interface TestCulvertProperties {
  shape: number
  rise: number
  span: number
  length: number
  // ... other properties
}

// ✅ CORRECT - Import interfaces from the shared models
import { CulvertGroupProperties, CULVERT_SHAPE } from "../../src/models/geometry/culvert";
import { BridgeConnection } from "../../src/models/bridge";
```

**Why this matters:**

- **Type Safety**: Ensures tests use the same types as production code
- **Consistency**: Changes to interfaces automatically propagate to tests
- **Maintainability**: Single source of truth for data structures
- **Prevents Drift**: Tests can't accidentally diverge from real interfaces

**Implementation:**

- All domain interfaces should be exported from shared model modules
- Test files should import interfaces from the shared location
- If an interface isn't exported yet, add it to the exports rather than duplicating it
- Mock data factories should use the real types from the models

```typescript
// ✅ CORRECT - Test factories using real interfaces
import { CulvertGroupProperties, CULVERT_SHAPE } from "../../src/models/geometry/culvert";
import { BridgeConnection } from "../../src/models/bridge";

const getMockCulvertGroup = (
  overrides?: Partial<CulvertGroupProperties>
): CulvertGroupProperties => {
  const baseCulvert: CulvertGroupProperties = {
    shape: CULVERT_SHAPE.CIRCLE,
    rise: 3.0,
    span: 3.0,
    length: 50.0,
    nTop: 0.013,
    entranceLoss: 0.5,
    exitLoss: 1.0,
    chart: 1,
    scale: 1,
    upstreamInvert: 100.0,
    downstreamInvert: 99.5,
    numberOfBarrels: 1,
    culvertGroupName: "Test Culvert",
    unknownFlag: 0,
    barrelStations: [],
    barrels: [],
  };

  return { ...baseCulvert, ...overrides };
};

const getMockBridgeConnection = (
  overrides?: Partial<BridgeConnection>
): BridgeConnection => {
  const baseBridge: BridgeConnection = {
    bridge: {
      momentumEquationAddFriction: -1,
      momentumEquationAddWeight: -1,
      pressureFlowCriteria: -1,
      classBDefaults: -1,
      param5: 0,
      contractionCoefficient: 0.1,
      expansionCoefficient: 0.3,
    },
    pressureWeir: {
      value1: 0,
      value2: null,
      value3: 0,
      value4: null,
      value5: 0,
    },
    deckParameters: {
      deckDistance: 0,
      width: 30,
      weirCoefficient: 2.6,
      skew: 0,
      numUp: 0,
      numDown: 0,
      minLowCoordinate: null,
      maxHighCoordinate: null,
      maxSubmerge: 1,
      isOgee: 0,
      coordinates: [],
      elevations: [],
      bottomElevations: [],
    },
    bridgeSections: [],
    bridgeCoefficients: {
      coef1: 0,
      coef2: 0,
      coef3: 0,
      coef4: null,
      coef5: null,
      coef6: null,
      coef7: 0,
      coef8: 0,
      coef9: null,
      coef10: 0,
      coef11: null,
    },
    bridgeSkew: 0,
    crossSections: [],
    ineffectiveFlowAreas: [],
  };

  return { ...baseBridge, ...overrides };
};
```

## Code Style

### Pragmatic Parsing Approach

I follow a practical approach optimized for parsing complex file formats:

- **Practical mutability** during parsing phases - parsers can build objects incrementally
- **Stateful parsing functions** that track index position and accumulate data
- **Direct object construction** using type assertions when building complex structures
- **Sequential parsing logic** using while loops and if/else chains when appropriate
- Use array methods (`map`, `filter`, `reduce`) for data transformation, but imperative loops for parsing workflows

#### Examples of Parsing Patterns

```typescript
// Good - Stateful parsing with incremental object construction
export function parseStorageAreaData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: StorageArea; nextIndex: number } {
  const { value } = parseKeyValue(line)
  const parts = value.split(",")
  
  // Direct object construction with type assertion
  const storageAreaData = {
    id: parts[0].trim(),
    surfaceLine: [],
    mannings: null,
    // ... more properties
  } as StorageArea
  
  let index = currentIndex + 1
  
  // Sequential parsing with while loop and if/else chains
  while (index < lines.length && isValidLine(lines[index])) {
    const currentLine = lines[index]
    
    if (currentLine.startsWith("Storage Area Surface Line=")) {
      // Parse surface line data
      const { value: surfaceLineCount } = parseKeyValue(currentLine)
      const numberOfPoints = parseInt(surfaceLineCount.trim())
      index++
      
      // Accumulate coordinates into the object
      for (let i = 0; i < numberOfPoints && index < lines.length; i++) {
        const coordinates = parseLineToCoordinates(lines[index])
        storageAreaData.surfaceLine.push(...coordinates)
        index++
      }
      continue
    }
    
    if (currentLine.startsWith("Storage Area Type=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.type = parseInt(value.trim())
      index++
      continue
    }
    
    // ... more parsing conditions
    break
  }
  
  return { data: storageAreaData, nextIndex: index }
}

// Good - Domain-specific error handling
if (!line.startsWith("Storage Area=")) {
  throw new Error(`storageAreaParser was given a line it can't parse: ${line}`)
}

// Good - Practical utility functions for parsing workflows
const isValidLine = (line: string) => {
  return validKeys.some((key) => line?.startsWith(key))
}
```

### Code Structure

- **Sequential if/else chains are acceptable** for parsing different HEC-RAS line types
- **Nesting is acceptable** when it serves the parsing logic (e.g., nested loops for coordinate parsing)
- **Functions should handle complete parsing responsibilities** for their domain
- **Prefer explicit, readable parsing logic** over abstract functional compositions
- **Use continue statements** to manage parsing flow in long if/else chains

### Naming Conventions

- **Functions**: `camelCase`, verb-based (e.g., `parseCulvertData`, `validateGeometry`)
- **Types**: `PascalCase` (e.g., `CulvertGroupProperties`, `BridgeConnection`)
- **Constants**: `UPPER_SNAKE_CASE` for true constants, `camelCase` for configuration
- **Files**: `kebab-case.ts` for all TypeScript files
- **Test files**: `*.test.ts` or `*.spec.ts`

### Comments and Documentation

Comments are valuable for explaining HEC-RAS format complexities and parsing decisions:

- **Use JSDoc comments** for parser functions to explain their purpose and HEC-RAS format specifics
- **Inline comments** are encouraged to explain format quirks and parsing logic
- **Document HEC-RAS format patterns** that may not be obvious to future maintainers
- **Explain parsing decisions** when the format is ambiguous or has edge cases

```typescript
// Good - JSDoc explaining parser purpose and HEC-RAS specifics
/**
 * Parses storage area data starting from a "Storage Area=" line
 * Handles the various storage area types and 2D configuration options
 */
export function parseStorageAreaData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: StorageArea; nextIndex: number } {

// Good - Inline comments explaining format quirks
// Storage Area=id,,, - extract the id from the comma-separated value
const parts = value.split(",")
const id = parts[0].trim()

// Good - Comments explaining parsing logic
// Surface line coordinates follow on subsequent lines
const coordinateLines = numberOfPoints // 1 coordinate pair per line
index++

// Good - Comments documenting HEC-RAS format patterns
// The line is max width of 80, each number being 8 characters
// Barrel stations are defined on the next lines after the main culvert line

// Good - Comments explaining edge cases
// HEC-RAS sometimes includes trailing commas and spaces that need trimming
const cleanValue = value.replace(/,+$/, '').trim()
```

### Parser Function Signatures

Parser functions should use consistent, domain-appropriate parameter patterns:

```typescript
// Good - Standard parser function signature
export function parseStorageAreaData(
  line: string,           // The line being parsed
  lines: string[],        // All geometry lines for context
  currentIndex: number,   // Current position in the lines array
): { data: StorageArea; nextIndex: number } {
  // implementation
}

// Good - Utility parser with simple parameters
export const parseKeyValue = (line: string): { key: string; value: string } => {
  // implementation
}

// Good - Line-level parser with domain-specific parameters
export const parseLineToCoordinates = (line: string): Coordinate[] => {
  // implementation
}

// Good - Atomic parser with focused parameters
export const parseCommaSeparated = (value: string): string[] => {
  // implementation
}
```

**Guidelines for parser functions:**

- **Main parsers** use `(line, lines, currentIndex)` pattern for stateful parsing
- **Utility parsers** use simple parameters appropriate to their scope
- **Return objects** with `{ data, nextIndex }` pattern for stateful parsers
- **Atomic functions** can use single parameters when appropriate
- **Index management** is handled explicitly in parser return values

## Development Workflow

### TDD Process - THE FUNDAMENTAL PRACTICE

**CRITICAL**: TDD is not optional. Every feature, every bug fix, every change MUST follow this process:

Follow Red-Green-Refactor with parsing-focused approach:

1. **Red**: Write a failing test using real HEC-RAS data and expected parsed results. NO PRODUCTION CODE until you have a failing test.
2. **Green**: Write the parsing code to make the test pass. Build complete parsing logic that handles the full complexity of the format.
3. **Refactor**: Assess if the parsing logic can be made clearer or more maintainable. If the parser handles the format correctly and is readable, move on.

**Common TDD Violations to Avoid:**

- Writing parsing code without a test with real HEC-RAS data first
- Writing multiple parsing scenarios before making the first one pass
- Writing incomplete parsing that doesn't handle the full format complexity
- Skipping documentation of format quirks discovered during implementation

**Remember**: If you're writing parsing code and there isn't a test with real HEC-RAS data demanding that code, you're not doing TDD.

#### TDD Example Workflow

```typescript
// Step 1: Red - Start with real HEC-RAS data
describe("Storage Area parsing", () => {
  it("should parse complete storage area data", () => {
    const storageAreaData = `Storage Area=2D_Grid         ,,
Storage Area Surface Line= 6
       484549.87       4751428.51
       484549.87       4751438.69
       484559.91       4751438.69
       484559.91       4751428.51
       484549.87       4751428.51
Storage Area Type=1
Storage Area Is2D=1`;

    const lines = storageAreaData.split('\n');
    const result = parseStorageAreaData(lines[0], lines, 0);

    expect(result.data.id).toBe("2D_Grid");
    expect(result.data.surfaceLine).toHaveLength(5);
    expect(result.data.type).toBe(1);
    expect(result.data.is2D).toBe(1);
  });
});

// Step 2: Green - Build complete parsing implementation
export function parseStorageAreaData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: StorageArea; nextIndex: number } {
  if (!line.startsWith("Storage Area=")) {
    throw new Error(`storageAreaParser was given a line it can't parse: ${line}`)
  }

  const { value } = parseKeyValue(line)
  const parts = value.split(",")
  
  // Build storage area object with type assertion
  const storageAreaData = {
    id: parts[0].trim(),
    surfaceLine: [],
    type: 0,
    is2D: 0,
    // ... all other properties
  } as StorageArea

  let index = currentIndex + 1

  // Parse all related lines using sequential if/else
  while (index < lines.length && isValidLine(lines[index])) {
    const currentLine = lines[index]

    if (currentLine.startsWith("Storage Area Surface Line=")) {
      // Parse surface line coordinates
      const { value: surfaceLineCount } = parseKeyValue(currentLine)
      const numberOfPoints = parseInt(surfaceLineCount.trim())
      index++
      
      for (let i = 0; i < numberOfPoints && index < lines.length; i++) {
        const coordinates = parseLineToCoordinates(lines[index])
        storageAreaData.surfaceLine.push(...coordinates)
        index++
      }
      continue
    }

    if (currentLine.startsWith("Storage Area Type=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.type = parseInt(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("Storage Area Is2D=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.is2D = parseInt(value.trim())
      index++
      continue
    }

    // Continue for all other storage area properties...
    break
  }

  return { data: storageAreaData, nextIndex: index }
}

// Step 3: Red - Add test for 2D properties
describe("Storage Area parsing", () => {
  // ... existing test

  it("should parse 2D storage area properties", () => {
    const storageAreaData = `Storage Area=TestArea,,
Storage Area Is2D=1
Storage Area 2D Points= 4
       484549.87       4751428.51       484549.87       4751438.69
       484559.91       4751438.69       484559.91       4751428.51`;

    const lines = storageAreaData.split('\n');
    const result = parseStorageAreaData(lines[0], lines, 0);

    expect(result.data.is2D).toBe(1);
    expect(result.data.points2D).toHaveLength(4);
  });
});

// Step 4: Green - Add 2D parsing logic to existing parser
// Add the 2D points parsing logic to the if/else chain in the existing function

// Step 5: Refactor - Document format quirks discovered
/**
 * Parses storage area data starting from a "Storage Area=" line
 * Handles both 1D and 2D storage areas with various configuration options
 * 
 * HEC-RAS format notes:
 * - Surface line coordinates are 1 pair per line
 * - 2D points are 2 pairs per line (4 coordinates total)
 * - Trailing commas and spaces are common and need trimming
 */
export function parseStorageAreaData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: StorageArea; nextIndex: number } {
  // Enhanced implementation with discovered format handling
}
```

### Refactoring - Improving Parser Quality

Evaluating parser improvement opportunities is part of the TDD cycle. After achieving a green state, assess whether the parsing logic can be made clearer or more maintainable. However, parsers that correctly handle the format complexity are often good as-is.

#### What is Parser Refactoring?

Parser refactoring means improving the internal structure of parsing logic without changing the parsing behavior. The parsed output remains identical, all tests continue to pass, but the parsing code becomes more readable or maintainable. 

#### When to Refactor Parsers

- **Always assess after green**: Once parsing tests pass, evaluate if the parser logic could be clearer
- **When format handling is duplicated**: Extract common parsing patterns into utility functions
- **When comments could be replaced with better names**: Variable names that don't clearly express their HEC-RAS purpose
- **When parsing logic is hard to follow**: But long if/else chains for different line types are often the clearest approach
- **When new format variations emerge**: After handling several similar format patterns, shared utilities may be beneficial

**Remember**: Parsing logic that correctly handles complex formats is often good as-is. Don't refactor working parsers just to make them shorter or more "functional".

#### Refactoring Guidelines

##### 0. EACH PARSER SHOULD FOLLOW THE SAME CONVENTIONS
Do not have a different convention when parsing one type of section vs. another. A refactor must make sense across all parsers or else it should not be considered.

##### 1. Commit Before Refactoring

Always commit your working parser before starting any refactoring. This gives you a safe point to return to:

```bash
git add .
git commit -m "feat: add storage area parsing"
# Now safe to refactor
```

##### 2. Extract Common Parsing Patterns

Create utility functions when parsing patterns are duplicated across different parsers. Focus on HEC-RAS format patterns, not generic code structure.

```typescript
// Similar parsing structure, DIFFERENT HEC-RAS components - DO NOT ABSTRACT
const parseCulvertElevation = (line: string): number => {
  const { value } = parseKeyValue(line);
  return parseFloat(value.trim());
};

const parseBridgeElevation = (line: string): number => {
  const { value } = parseKeyValue(line);
  return parseFloat(value.trim());
};

// These might look similar, but they represent different HEC-RAS concepts
// Culvert elevations and bridge elevations may have different validation rules
// or format variations as the HEC-RAS format evolves

// Similar parsing, SAME format pattern - SAFE TO ABSTRACT
const parseElevationFromLine = (line: string): number => {
  const { value } = parseKeyValue(line);
  return parseFloat(value.trim());
};

// Good - Extract common coordinate parsing
const parseCoordinatePairs = (line: string): Coordinate[] => {
  const numbers = chunkStringToNumbers(line.trim(), 2);
  return numbers.map(chunk => ({
    x: chunk[0],
    y: chunk[1]
  }));
};

// Used by both storage areas and culvert barrels:
// storageAreaData.surfaceLine.push(...parseCoordinatePairs(lines[index]));
// culvertData.barrels[0].coordinates = parseCoordinatePairs(coordinateLine);
```

**Questions to ask before abstracting parsing logic:**

- Do these parsing operations handle the same HEC-RAS format pattern?
- If the format specification changes, should both places change identically?
- Would an engineer familiar with HEC-RAS understand why these are grouped together?
- Am I abstracting based on code structure or actual format similarities?

**Remember**: HEC-RAS parsers often look similar but handle different engineering concepts. Extract only when the format patterns are truly identical.

##### 3. Documentation and Maintainability

Focus refactoring on improving parser documentation and maintainability rather than abstract code patterns.

```typescript
// Good - Document format discoveries during parsing
/**
 * Parses storage area surface line coordinates
 * HEC-RAS format: 1 coordinate pair per line for surface lines
 * but 2 coordinate pairs per line for 2D points
 */
const parseSurfaceLineCoordinates = (lines: string[], startIndex: number, count: number) => {
  const coordinates = [];
  for (let i = 0; i < count && startIndex + i < lines.length; i++) {
    const coordLine = lines[startIndex + i];
    const coords = parseLineToCoordinates(coordLine);
    coordinates.push(...coords);
  }
  return coordinates;
};

// Good - Extract validation specific to HEC-RAS constraints
const validateGeometryLine = (line: string, expectedPrefix: string): void => {
  if (!line.startsWith(expectedPrefix)) {
    throw new Error(`Expected line starting with "${expectedPrefix}", got: ${line}`);
  }
};

// Usage in parsers:
// validateGeometryLine(line, "Storage Area=");
// validateGeometryLine(line, "Connection Culv=");
```

##### 4. Verify and Commit After Refactoring

**CRITICAL**: After every parser refactoring:

1. Run all tests - they must pass without modification
2. Run static analysis (linting, type checking) - must pass  
3. Commit the refactoring separately from feature changes

```bash
# After refactoring
npm test          # All parsing tests must pass
npm run lint      # All linting must pass
tsc              # TypeScript must compile cleanly

# Only then commit
git add .
git commit -m "refactor: extract coordinate parsing utilities"
```

#### Parser Refactoring Checklist

Before considering parser refactoring complete, verify:

- [ ] The refactoring improves parser clarity or maintainability
- [ ] All parsing tests still pass without modification
- [ ] All static analysis tools pass (linting, type checking)
- [ ] Parser output remains identical for all test cases
- [ ] Code better expresses HEC-RAS format handling intent
- [ ] Format quirks are better documented
- [ ] The refactoring is committed separately from feature changes

#### Example: When NOT to Refactor

```typescript
// After getting this parsing test green:
describe("Storage Area type parsing", () => {
  it("should parse storage area type correctly", () => {
    const line = "Storage Area Type=1";
    const result = parseStorageAreaType(line);
    expect(result).toBe(1);
  });
});

// Green implementation:
const parseStorageAreaType = (line: string): number => {
  const { value } = parseKeyValue(line);
  return parseInt(value.trim());
};

// Assess refactoring opportunities:
// - Code correctly handles the HEC-RAS format
// - Function name clearly expresses the parsing purpose
// - Implementation follows established parsing patterns
// - No complex logic or unclear behavior
// Conclusion: No refactoring needed. This parser is effective as-is.

// Commit and move to the next parsing scenario
// git commit -m "feat: add storage area type parsing"
```

### Commit Guidelines

- Each commit should represent a complete, working parser change
- Use conventional commits format:
  ```
  feat: add storage area parsing
  fix: correct coordinate parsing in culvert barrels
  refactor: extract common coordinate parsing utilities
  test: add edge cases for 2D storage area parsing
  docs: update storage area format documentation
  ```
- Include test changes with parser changes in the same commit

### Pull Request Standards

- Every PR must have all tests passing
- All linting and quality checks must pass
- Work in small increments that maintain a working state
- PRs should be focused on a single feature or fix
- Include description of the behavior change, not implementation details

## Working with Claude

### Expectations

When working with my code:

1. **ALWAYS FOLLOW TDD** - No production code without a failing test. This is not negotiable.
2. **Think deeply** before making any edits
3. **Understand the full context** of the code and requirements
4. **Ask clarifying questions** when requirements are ambiguous
5. **Think from first principles** - don't make assumptions
6. **Assess refactoring after every green** - Look for opportunities to improve code structure, but only refactor if it adds value
7. **Keep project docs current** - update them whenever you introduce meaningful changes

### Code Changes

When suggesting or making changes:

- **Start with a failing test** - always. No exceptions.
- After making tests pass, always assess refactoring opportunities (but only refactor if it adds value)
- After refactoring, verify all tests and static analysis pass, then commit
- Respect the existing patterns and conventions
- Maintain test coverage for all behavior changes
- Keep changes small and incremental
- Ensure all TypeScript strict mode requirements are met
- Provide rationale for significant design decisions

**If you find yourself writing production code without a failing test, STOP immediately and write the test first.**

### Communication

- Be explicit about trade-offs in different approaches
- Explain the reasoning behind significant design decisions
- Flag any deviations from these guidelines with justification
- Suggest improvements that align with these principles
- When unsure, ask for clarification rather than assuming

## Example Patterns

### Error Handling

Use Result types or early returns:

### Testing Behavior

```typescript
// Good - tests behavior through public API
describe("CulvertParser", () => {
  it("should reject invalid culvert format", () => {
    const invalidData = ["Invalid culvert line"];

    const result = parseCulvertData(invalidData[0], invalidData, 0);

    expect(() => result).toThrow("Invalid culvert format");
  });

  it("should parse valid culvert data successfully", () => {
    const culvertData = getMockCulvertData({ numberOfBarrels: 2 });
    const geometryLines = ["Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64,2,Group #1,0,"];

    const result = parseCulvertData(geometryLines[0], geometryLines, 0);

    expect(result.data[0].numberOfBarrels).toBe(2);
    expect(result.data[0].culvertGroupName).toBe("Group #1");
  });
});

// Avoid - testing implementation details
describe("CulvertParser", () => {
  it("should call parseKeyValue method", () => {
    // This tests implementation, not behavior
  });
});
```

## Common Patterns to Avoid

### Anti-patterns

```typescript
// Avoid: Mutation
const addBarrel = (barrels: CulvertBarrelProperties[], newBarrel: CulvertBarrelProperties) => {
  barrels.push(newBarrel); // Mutates array
  return barrels;
};

// Prefer: Immutable update
const addBarrel = (barrels: CulvertBarrelProperties[], newBarrel: CulvertBarrelProperties): CulvertBarrelProperties[] => {
  return [...barrels, newBarrel];
};

// Avoid: Nested conditionals
if (geometry) {
  if (geometry.connections) {
    if (geometry.connections.culverts) {
      // do something
    }
  }
}

// Prefer: Early returns
if (!geometry || !geometry.connections || !geometry.connections.culverts) {
  return;
}
// do something

// Avoid: Large functions
const parseGeometryFile = (lines: string[]) => {
  // 100+ lines of code
};

// Prefer: Composed small functions
const parseGeometryFile = (lines: string[]) => {
  const headers = parseGeometryHeaders(lines);
  const connections = parseConnections(lines);
  const storageAreas = parseStorageAreas(lines);
  return buildGeometry(headers, connections, storageAreas);
};
```

## Resources and References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Kent C. Dodds Testing JavaScript](https://testingjavascript.com/)
- [Functional Programming in TypeScript](https://gcanti.github.io/fp-ts/)



## Summary

The key is to write clean, testable, functional code that evolves through small, safe increments. Every change should be driven by a test that describes the desired behavior, and the implementation should be the simplest thing that makes that test pass. When in doubt, favor simplicity and readability over cleverness.