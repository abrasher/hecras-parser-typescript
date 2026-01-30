# Extending the Parser

This guide walks through adding support for a new HEC-RAS file section.

## Prerequisites

1. Read the [Schema DSL Reference](./schema-dsl.md)
2. Have sample HEC-RAS files with the section you want to parse
3. Understand the section's format (field names, types, ordering)

## Step 1: Analyze the Format

Start by examining the HEC-RAS section in a text editor.

**Example: A hypothetical "Custom Area" section**

```
Custom Area=MyArea
Custom Area Name=My Custom Area
Custom Area Type=2
Custom Area Coords= 4
      123456.789      987654.321
      123556.789      987654.321
      123556.789      987554.321
      123456.789      987554.321
Custom Area Enabled=-1

```

**Key observations:**

- `Custom Area=` has an ID value
- `Custom Area Name=` is 32-char fixed width (padded)
- `Custom Area Type=` is a number
- `Custom Area Coords=` has a count followed by XY pairs (16-char per number)
- `Custom Area Enabled=` uses `-1,0` boolean encoding
- Section ends with blank line

## Step 2: Create the Schema File

Create `src/schemas/customAreaSchema.ts`:

```typescript
import {
  schema,
  stringField,
  numberField,
  booleanField,
  tupleArrayField,
  blankLine,
} from "../schema/combinators"

export const customAreaSchema = schema([
  // Header line
  stringField("id", "Custom Area="),

  // Name with fixed width
  stringField("name", "Custom Area Name=", { length: 32 }),

  // Type number
  numberField("type", "Custom Area Type="),

  // Coordinate array (count header + 16-char fixed-width body)
  tupleArrayField("coordinates", "Custom Area Coords=", {
    width: 16,
    maxWidth: 64,
    tuple: 2,
    formatter: "coordinate",
    pad: true,
  }),

  // Boolean flag
  booleanField("enabled", "Custom Area Enabled=", { mode: "-1,0" }),

  // Trailing blank line
  blankLine(),
])
```

## Step 3: Infer and Export the Type

```typescript
import type { Infer } from "../schema/core"

export type CustomArea = Infer<typeof customAreaSchema>

// TypeScript automatically infers:
// {
//   id: string
//   name: string
//   type: number
//   coordinates: [number, number][]
//   enabled: boolean
// }
```

## Step 4: Write Tests

Create `test/schemas/customAreaSchema.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../src/schema/driver"
import { customAreaSchema } from "../../src/schemas/customAreaSchema"

describe("customAreaSchema", () => {
  const sampleLines = [
    "Custom Area=MyArea",
    "Custom Area Name=My Custom Area                 ",
    "Custom Area Type=2",
    "Custom Area Coords= 4 ",
    "      123456.789      987654.321",
    "      123556.789      987654.321",
    "      123556.789      987554.321",
    "      123456.789      987554.321",
    "Custom Area Enabled=-1",
    "",
  ]

  it("parses correctly", () => {
    const { value } = parseWithSchema(customAreaSchema, sampleLines, 0)

    expect(value.id).toBe("MyArea")
    expect(value.name).toBe("My Custom Area")
    expect(value.type).toBe(2)
    expect(value.coordinates).toHaveLength(4)
    expect(value.coordinates[0]).toEqual([123456.789, 987654.321])
    expect(value.enabled).toBe(true) // -1 → true
  })

  it("serializes correctly", () => {
    const data = {
      id: "MyArea",
      name: "My Custom Area",
      type: 2,
      coordinates: [
        [123456.789, 987654.321],
        [123556.789, 987654.321],
        [123556.789, 987554.321],
        [123456.789, 987554.321],
      ] as [number, number][],
      enabled: true,
    }

    const lines = serializeWithSchema(customAreaSchema, data)

    expect(lines[0]).toBe("Custom Area=MyArea")
    expect(lines[1]).toBe("Custom Area Name=My Custom Area                 ")
    expect(lines[2]).toBe("Custom Area Type=2")
    expect(lines[3]).toMatch(/^Custom Area Coords=\s*4/)
  })

  it("round-trips correctly", () => {
    const { value: parsed } = parseWithSchema(customAreaSchema, sampleLines, 0)
    const serialized = serializeWithSchema(customAreaSchema, parsed)
    const { value: reparsed } = parseWithSchema(customAreaSchema, serialized, 0)

    expect(reparsed).toEqual(parsed)
  })
})
```

## Step 5: Run Tests

```bash
npm test -- customAreaSchema
```

## Step 6: Integrate into Geometry/Plan Schema

Add to the parent schema (e.g., `geometrySchema.ts`):

```typescript
import { repeat, startsWith } from "../schema/combinators"
import { customAreaSchema } from "./customAreaSchema"

export const geometrySchema = schema([
  // ... existing fields ...

  // Add repeating custom areas
  repeat("customAreas", startsWith("Custom Area="), customAreaSchema),

  // ... rest of schema ...
])
```

## Handling Complex Formats

### Optional Fields

Use `opt()` for fields that may not be present:

```typescript
import { opt } from "../schema/combinators"

opt(numberField("optionalValue", "Optional Value="))
```

### Blank-to-Null Numbers

For fields where blank should become `null` (not omit the line):

```typescript
numberField("value", "Value=", { nullOnBlank: true })
```

### CSV Lines with Multiple Values

```typescript
import { multiField, fields, stringPart, numberPart } from "../schema/combinators"

multiField(
  "Data=",
  fields({
    name: stringPart({ width: 16, trim: true }),
    x: numberPart(),
    y: numberPart(),
  }),
)
```

### Custom Parsing (Contextual)

For formats that don't fit standard patterns:

```typescript
import { contextual } from "../schema/combinators"

contextual<MyCustomType>("customField", {
  parse: (lines, startIndex, context) => {
    // Read lines[startIndex], lines[startIndex + 1], etc.
    // Return { value, nextIndex }
    const value = parseCustomFormat(lines, startIndex)
    return { value, nextIndex: startIndex + linesConsumed }
  },
  serialize: (value, context) => {
    // Return array of strings (lines)
    return formatCustomOutput(value)
  },
})
```

## Checklist

Before submitting your schema:

- [ ] Schema handles all observed variations in sample files
- [ ] Tests cover parsing, serialization, and round-trip
- [ ] Round-trip produces identical output (line-for-line)
- [ ] Optional fields use `opt()` correctly
- [ ] Blank handling (`nullOnBlank`) matches HEC-RAS behavior
- [ ] Boolean mode matches the section's encoding
- [ ] Fixed-width formatting (coordinate/station) uses correct width
- [ ] Schema integrated into parent (geometry/plan) schema
- [ ] Regression tests pass: `npm run check:regression`

## Common Pitfalls

### 1. Wrong Boolean Mode

HEC-RAS uses different boolean encodings in different sections. Always check the actual file.

```typescript
// WRONG: assuming TF when it's actually -1,0
booleanField("flag", "Flag=", { mode: "TF" }) // ❌

// RIGHT: check the file format
booleanField("flag", "Flag=", { mode: "-1,0" }) // ✓
```

### 2. Forgetting Trailing Blank Lines

Many sections end with a blank line separator:

```typescript
schema([
  // ... fields ...
  blankLine(), // Don't forget this!
])
```

### 3. Wrong Fixed Width

Coordinates use 16-char width, stations use 8-char width:

```typescript
// Coordinates (XY)
tupleArrayField('coords', 'Coords=', { width: 16, ... })

// Station/elevation
tupleArrayField('staElev', 'StaElev=', { width: 8, ... })
```

### 4. Not Trimming String Parts

Input strings may be padded. Use `trim: true` if you want clean values:

```typescript
stringPart({ trim: true }) // " MyValue " → "MyValue"
```

## Resources

- [Schema DSL Reference](./schema-dsl.md) - Complete DSL documentation
- [AGENTS.md](../../AGENTS.md) - Patterns from implemented schemas
- [Format Specification](../hecras-parsing-format-specification.md) - HEC-RAS format details
- Existing schemas in `src/schemas/` - Real-world examples
