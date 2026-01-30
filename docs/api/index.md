# hecras-parser API Reference

TypeScript library for parsing and serializing HEC-RAS geometry and plan files.

## Installation

```bash
npm install hecras-parser
```

## Quick Start

```typescript
import { parseGeometry, serializeGeometry, parsePlan, serializePlan } from "hecras-parser"
import { readFileSync, writeFileSync } from "fs"

// Parse a geometry file
const geoContent = readFileSync("model.g01", "utf-8")
const geometry = parseGeometry(geoContent)

// Parse a plan file
const planContent = readFileSync("model.p01", "utf-8")
const plan = parsePlan(planContent)

// Modify and serialize back
geometry.title = "Modified Model"
const output = serializeGeometry(geometry)
writeFileSync("modified.g01", output)
```

## Core Functions

### parseGeometry

Parses a HEC-RAS geometry file (.gXX) into a structured TypeScript object.

```typescript
function parseGeometry(content: string): Geometry
```

**Parameters:**

- `content` - The raw text content of the geometry file

**Returns:** A `Geometry` object containing all parsed geometric data

**Example:**

```typescript
const geometry = parseGeometry(fileContent)

// Access top-level properties
console.log(geometry.title)

// Access rivers and reaches
for (const river of geometry.rivers ?? []) {
  console.log(river.name)
  for (const reach of river.reaches ?? []) {
    console.log(`  Reach: ${reach.name}`)
  }
}

// Access storage areas
for (const sa of geometry.storageAreas ?? []) {
  console.log(sa.name, sa.is2D ? "(2D)" : "(1D)")
}
```

### serializeGeometry

Serializes a geometry object back to HEC-RAS file format.

```typescript
function serializeGeometry(geometry: Geometry, options?: SerializeOptions): string
```

**Parameters:**

- `geometry` - The geometry object to serialize
- `options` - Optional serialization settings

**Returns:** The serialized geometry file content as a string

**Example:**

```typescript
// Round-trip: parse, modify, serialize
const geometry = parseGeometry(original)
geometry.title = "Updated Model"

// Serialize with Windows line endings (HEC-RAS default)
const output = serializeGeometry(geometry, { lineEndings: "\r\n" })
```

### parsePlan

Parses a HEC-RAS plan file (.pXX) into a structured TypeScript object.

```typescript
function parsePlan(content: string): Plan
```

**Parameters:**

- `content` - The raw text content of the plan file

**Returns:** A `Plan` object containing simulation settings and configuration

**Example:**

```typescript
const plan = parsePlan(fileContent)

// Access simulation time window
console.log(plan.simulationTimeWindow?.startDate) // "01JAN2020"
console.log(plan.simulationTimeWindow?.startTime) // "0000"

// Access solver settings
console.log(plan.unetSettings?.theta)
console.log(plan.unetSettings?.maxIter)
```

### serializePlan

Serializes a plan object back to HEC-RAS file format.

```typescript
function serializePlan(plan: Plan, options?: SerializeOptions): string
```

**Parameters:**

- `plan` - The plan object to serialize
- `options` - Optional serialization settings

**Returns:** The serialized plan file content as a string

## SerializeOptions

Options for controlling serialization output.

```typescript
interface SerializeOptions {
  lineEndings?: "\r\n" | "\n" // Default: '\r\n'
}
```

**Properties:**

- `lineEndings` - Line ending style. HEC-RAS is a Windows application and expects `\r\n` (CRLF). Unix-style `\n` may cause compatibility issues.

## Types

The library exports two main types inferred from the parsing schemas:

- **`Geometry`** - Parsed HEC-RAS geometry file structure
- **`Plan`** - Parsed HEC-RAS plan file structure

See the [Type Reference](./generated/types.md) for complete type definitions.

## Common Patterns

### Read-Modify-Write

```typescript
import { parseGeometry, serializeGeometry } from "hecras-parser"
import { readFileSync, writeFileSync } from "fs"

// Read
const content = readFileSync("model.g01", "utf-8")
const geometry = parseGeometry(content)

// Modify
const storageArea = geometry.storageAreas?.find((sa) => sa.name === "Reservoir")
if (storageArea) {
  storageArea.is2D = true
}

// Write
const output = serializeGeometry(geometry)
writeFileSync("model.g01", output)
```

### Extracting Data

```typescript
import { parseGeometry } from "hecras-parser"

const geometry = parseGeometry(content)

// Extract all cross section stations
const stations: number[] = []
for (const river of geometry.rivers ?? []) {
  for (const reach of river.reaches ?? []) {
    for (const station of reach.stations ?? []) {
      if (station.type === 1) {
        // Cross section
        stations.push(station.riverStation)
      }
    }
  }
}
```

### Batch Processing

```typescript
import { parseGeometry } from "hecras-parser"
import { readFileSync, readdirSync } from "fs"
import { join } from "path"

const geoFiles = readdirSync("./models").filter((f) => f.match(/\.g\d+$/))

for (const file of geoFiles) {
  const content = readFileSync(join("./models", file), "utf-8")
  const geometry = parseGeometry(content)
  console.log(`${file}: ${geometry.storageAreas?.length ?? 0} storage areas`)
}
```

## Round-Trip Fidelity

The parser is designed for round-trip fidelity. Parsing a file and serializing it back produces output that matches the original:

```typescript
const original = readFileSync("model.g01", "utf-8")
const geometry = parseGeometry(original)
const serialized = serializeGeometry(geometry)

// For fully-supported sections, serialized matches original
// (accounting for line ending normalization)
```

This means you can safely parse, modify specific values, and write back without corrupting other parts of the file.

## Error Handling

The parser does not throw errors for unrecognized sections - it preserves them as-is to maintain compatibility. If a section cannot be parsed, it will be included in the output but may not be accessible as typed data.

```typescript
try {
  const geometry = parseGeometry(content)
  // Use geometry...
} catch (error) {
  // Parsing errors indicate malformed input
  console.error("Failed to parse geometry:", error)
}
```

## Advanced Usage

For advanced users who want to extend the parser or work with individual schemas, the library also exports:

- `parseWithSchema` - Low-level parsing driver
- `serializeWithSchema` - Low-level serialization driver
- `geometrySchema` - The geometry file schema definition
- `planSchema` - The plan file schema definition
- `Infer<typeof schema>` - Type inference helper

See the [internal documentation](../internal/schema-dsl.md) for details on extending the parser.
