# Schema DSL Reference

This document describes the domain-specific language (DSL) used to define HEC-RAS file parsers and serializers. This is internal documentation for contributors extending the library.

## Overview

The schema DSL provides declarative primitives for parsing and serializing HEC-RAS file formats. Schemas are the single source of truth for both:

- TypeScript types (via `Infer<typeof schema>`)
- Parsing and serialization logic

## Core Concepts

### Schema Definition

A schema is an array of schema items that define how to parse/serialize a section:

```typescript
import { schema, stringField, numberField, booleanField } from "../schema/combinators"

const mySchema = schema([
  stringField("name", "Name="),
  numberField("value", "Value="),
  booleanField("enabled", "Enabled=", { mode: "-1,0" }),
])

// Inferred type:
// { name: string; value: number; enabled: boolean }
```

### Type Inference

Use `Infer` to extract the TypeScript type from a schema:

```typescript
import type { Infer } from "../schema/core"

type MyData = Infer<typeof mySchema>
```

### Drivers

Use drivers to parse and serialize:

```typescript
import { parseWithSchema, serializeWithSchema } from "../schema/driver"

// Parse
const lines = content.split("\n")
const { value, nextIndex } = parseWithSchema(mySchema, lines, 0)

// Serialize
const outputLines = serializeWithSchema(mySchema, value)
```

## Schema Items

### Simple Fields

#### stringField

Single-line string value.

```typescript
stringField(key: string, prefix: string, options?: { length?: number })

// Example
stringField('title', 'Title=')
stringField('name', 'Name=', { length: 32 })  // Fixed width, padded/truncated
```

#### numberField

Single-line numeric value.

```typescript
numberField(key: string, prefix: string, options?: { nullOnBlank?: boolean })

// Example
numberField('count', 'Count=')
numberField('value', 'Value=', { nullOnBlank: true })  // Blank → null
```

#### booleanField

Single-line boolean value.

```typescript
booleanField(key: string, prefix: string, options: { mode: BooleanMode })

// Modes: 'TF', '-1,0', '10', 'true/false', 'Enable/Disable'
booleanField('enabled', 'Enabled=', { mode: '-1,0' })
```

### Multi-Field Lines

#### multiField

CSV line with multiple values.

```typescript
import { multiField, fields, stringPart, numberPart, booleanPart } from "../schema/combinators"

multiField(
  "Header=",
  fields({
    name: stringPart({ width: 16, trim: true }),
    x: numberPart(),
    y: numberPart(),
    active: booleanPart({ mode: "-1,0" }),
  }),
)
```

#### Part Options

```typescript
// String parts
stringPart({ width?: number, trim?: boolean })

// Number parts
numberPart({ nullOnBlank?: boolean, pad?: boolean })

// Boolean parts
booleanPart({ mode: BooleanMode, pad?: boolean })
```

### Tuple Fields

#### tupleField

Single tuple on one line.

```typescript
import { tupleField } from "../schema/combinators"

// Single XY coordinate
tupleField("position", "Position=", { tuple: 2, formatter: "coordinate" })
```

#### tupleArrayField

Header with count + fixed-width body table.

```typescript
import { tupleArrayField } from "../schema/combinators"

// Coordinates: 16-char per number, 4 numbers per line (2 XY pairs)
tupleArrayField("coordinates", "Reach XY=", {
  width: 16,
  maxWidth: 64,
  tuple: 2,
  formatter: "coordinate",
  pad: true,
})

// Station/elevation: 8-char per number, 10 numbers per line (5 pairs)
tupleArrayField("stationElevation", "#Sta/Elev=", {
  width: 8,
  maxWidth: 80,
  tuple: 2,
  formatter: "station",
  pad: true,
})
```

### Counted Arrays

For arrays with count header and fixed-width values:

```typescript
import {
  multiField,
  fields,
  countedArrayLengthPart,
  countedFixedWidthArray,
} from "../schema/combinators"

// #Mann= 3 , 0.035, 100, 0 , 0.045, 200, 0 , 0.035, 300, 0
multiField(
  "#Mann=",
  fields({
    count: countedArrayLengthPart(),
    values: countedFixedWidthArray("manning", { width: 8, maxWidth: 80, formatter: "station" }),
  }),
)
```

### Structural Items

#### opt

Makes a field optional. If `undefined`, the entire line is omitted.

```typescript
import { opt } from "../schema/combinators"

opt(stringField("description", "Description="))
```

#### repeat

Consumes 0+ contiguous blocks matching a recognizer.

```typescript
import { repeat, startsWith } from "../schema/combinators"

repeat("connections", startsWith("Up River,Reach="), connectionSchema)
```

#### include

Flattens another schema's items into the current object (no nested key).

```typescript
import { include } from "../schema/combinators"

const baseSchema = schema([stringField("name", "Name=")])

const extendedSchema = schema([include(baseSchema), numberField("extra", "Extra=")])
// Type: { name: string; extra: number }
```

#### section

Groups items under a named section with a recognizer.

```typescript
import { section, startsWith } from "../schema/combinators"

section("header", startsWith("Header Begin"), schema([stringField("title", "Title=")]))
```

#### contextual

Custom parse/serialize logic for complex formats.

```typescript
import { contextual } from "../schema/combinators"

contextual<MyType>("myField", {
  parse: (lines, startIndex, context) => {
    // Custom parsing logic
    return { value: parsedValue, nextIndex }
  },
  serialize: (value, context) => {
    // Custom serialization logic
    return ["line1", "line2"]
  },
})
```

### Whitespace

#### blankLine

Expects/emits a blank line.

```typescript
import { blankLine } from "../schema/combinators"

blankLine()
```

#### blankLines

Expects/emits multiple blank lines.

```typescript
import { blankLines } from "../schema/combinators"

blankLines(2)
```

## Formatting Rules

### Coordinate Numbers (16-char)

Used for XY coordinates in geometry. Use `formatter: 'coordinate'`.

```
      123456.789      987654.321
```

### Station Numbers (8-char)

Used for station/elevation data. Use `formatter: 'station'`.

```
   100.0   525.5   200.0   530.0
```

### Boolean Modes

| Mode               | True     | False     |
| ------------------ | -------- | --------- |
| `'-1,0'`           | `-1`     | `0`       |
| `'TF'`             | `T`      | `F`       |
| `'10'`             | `1`      | `0`       |
| `'true/false'`     | `True`   | `False`   |
| `'Enable/Disable'` | `Enable` | `Disable` |

Always specify the mode explicitly - HEC-RAS uses different encodings in different sections.

### Blank vs Null vs Undefined

| Value                             | Serialization Effect          |
| --------------------------------- | ----------------------------- |
| `undefined`                       | Entire line omitted           |
| `null` (with `nullOnBlank: true`) | Line emitted with blank value |
| Empty string                      | Line emitted with empty value |

## Utility Functions

### Parsing Utilities

From `src/schema/parsingUtils.ts`:

```typescript
import {
  parseKeyValue, // Parse "Key=value" lines
  parseMultilineArray, // Parse fixed-width multi-line arrays
  splitIntoTuples, // Convert flat array to tuples
} from "../schema/parsingUtils"
```

### Serialization Utilities

From `src/schema/serializationUtils.ts`:

```typescript
import {
  formatHECRASCoordinateNumber, // 16-char coordinate format
  formatHECRASStationNumber, // 8-char station format
  formatFixedWidth, // Generic fixed-width chunking
  formatCommaSeparated, // CSV formatting
} from "../schema/serializationUtils"
```

## Example: Complete Schema

```typescript
import {
  schema,
  stringField,
  numberField,
  booleanField,
  multiField,
  fields,
  stringPart,
  numberPart,
  tupleArrayField,
  opt,
  repeat,
  startsWith,
  blankLine,
} from "../schema/combinators"

export const storageAreaSchema = schema([
  // Header with optional centroid
  multiField(
    "Storage Area=",
    fields({
      id: stringPart({ trim: true }),
      centroidX: numberPart({ nullOnBlank: true }),
      centroidY: numberPart({ nullOnBlank: true }),
    }),
  ),

  // Name (fixed width)
  stringField("name", "Storage Area Name=", { length: 32 }),

  // Optional flags
  opt(booleanField("is2D", "Storage Area Is2D=", { mode: "-1,0" })),
  opt(numberField("minElevation", "Storage Area Min Elev=")),

  // Coordinate arrays
  tupleArrayField("surfaceLine", "Storage Area Surface Line=", {
    width: 16,
    maxWidth: 64,
    tuple: 2,
    formatter: "coordinate",
    pad: true,
  }),

  // 2D points (optional)
  opt(
    tupleArrayField("points2D", "Storage Area 2D Points=", {
      width: 16,
      maxWidth: 64,
      tuple: 2,
      formatter: "coordinate",
      pad: true,
    }),
  ),

  blankLine(),
])

// Inferred type includes all fields with correct optionality
type StorageArea = Infer<typeof storageAreaSchema>
```

## See Also

- [Extending Guide](./extending.md) - Step-by-step guide to adding new schemas
- [AGENTS.md](../../AGENTS.md) - Complete patterns from implemented schemas
- [Format Specification](../hecras-parsing-format-specification.md) - HEC-RAS format details
