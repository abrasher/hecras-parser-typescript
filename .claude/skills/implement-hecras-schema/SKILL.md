---
name: implement-hecras-schema
description: Reference patterns for implementing HEC-RAS file schemas using the DSL combinator system. Use when implementing a new schema for any HEC-RAS file type (.prj, .p01, .u01, .f01, .g01, etc.) or when choosing the right combinator for a HEC-RAS line pattern.
user-invocable: false
---

## Combinator Decision Tree

Work through these in order. Use the **first** combinator that fits. Reach for `contextual` only when nothing else works.

```
Is the data a fixed-width numeric array after a "Label= N" count header?
  YES → tupleArrayField("Label=", key, { width, maxWidth, tuple, pad: true, optional: true })

Is the data a fixed-width numeric array with the count stored in an earlier multiField?
  YES → multiField(..., fields({ count: countedArrayLengthPart(key) }))
        + countedFixedWidthArray(key, { width, maxWidth, tuple })

Is the data N raw string lines after a "Label= N" header (non-numeric)?
  YES → section(key, startsWith("Label="), schema([
           multiField("Label=", fields({ count: countedArrayLengthPart("lines", { pad: true }) })),
           repeat("lines", (line) => !line?.startsWith("NextKnownLabel="),
             schema([stringField("value", "", { trim: false })])),
         ]))

Is the line a whole-line flag with no "=" sign (e.g., "English Units", "SI Units")?
  YES → stringField(key, "", { trim: true })   ← empty label reads the entire line

Is the data 0-or-more repeated labeled entries of the same type?
  YES → repeat(key, startsWith("Label="), schema([stringField("field", "Label=", { trim: true })]))

Is the field optional (may or may not appear)?
  YES → stringField(key, "Label=", { trim: true, optional: true })
        numberField(key, "Label=", { integer: true, optional: true })

Does the field appear exactly once and is always required?
  YES → stringField / numberField / multiField (no optional flag)

None of the above — truly context-dependent (type field earlier determines sub-structure)?
  → contextual(key, parser, serializer)   ← last resort
```

---

## Key Patterns

### Flag Lines Without `=`

Bare lines like `English Units` or `SI Units` use an empty-string label. The driver reads the entire line as the value.

```typescript
stringField("units", "", { trim: true })
// "English Units" → value = "English Units"
// "SI Units"      → value = "SI Units"
```

### Count-Then-Numeric-Data (`tupleArrayField`)

```
GIS Export Profiles= 1
       1
```

```typescript
tupleArrayField("GIS Export Profiles=", "gisExportProfiles", {
  width: 8, maxWidth: 80, tuple: 1, pad: true, optional: true,
})
// count=0 → []       count=1 → [[1]]       absent → undefined
```

The count in the header is always derived from `array.length` on serialization — never stored separately.

### Count-Then-String-Data (`section` + `countedArrayLengthPart` + `repeat`)

```
DSS Export Rating Curves= 1
Bald Eagle Cr.  ,Lock Haven      ,58756     U/S Bridge
DSS Export Rating Curve Sorted= 0
```

```typescript
section("dssRatingCurves", startsWith("DSS Export Rating Curves="), schema([
  multiField("DSS Export Rating Curves=",
    fields({ count: countedArrayLengthPart("locationLines", { pad: true }) }),
  ),
  repeat(
    "locationLines",
    (line) => line !== undefined && !line.startsWith("DSS Export Rating Curve Sorted="),
    schema([stringField("location", "", { trim: false })]),
  ),
]))
// { locationLines: [{ location: "Bald Eagle Cr.  ,..." }] }
```

**Key insight**: `countedArrayLengthPart` is internal-only — it doesn't appear in the parsed value. It is ONLY used during serialization to call `derive(data)` → `data[arrayKey].length`. The `repeat` reads lines independently based on the recognizer.

**Recognizer strategy**: Stop at the label that always immediately follows the data block. Choose a specific prefix, not a generic `line !== ""`.

### Count-Then-String-Data With Named Header Field

When the count header also contains other data (like a name), `multiField` splits on commas naturally.

```
Specific Locations Profile Table=Gary's fav locations in Bald Eag     , 8
Bald Eagle      ,Loc Hav         ,137690.8
... 7 more lines ...
```

```typescript
section("specificLocations", startsWith("Specific Locations Profile Table="), schema([
  multiField("Specific Locations Profile Table=", fields({
    name: stringPart({ trim: false }),                          // name preserved with spaces
    count: countedArrayLengthPart("dataLines", { pad: true }), // derives from dataLines.length
  })),
  repeat(
    "dataLines",
    (line) => line !== undefined && line !== "" && !line.startsWith("GIS Export"),
    schema([stringField("location", "", { trim: false })]),
  ),
]))
// { name: "Gary's fav locations in Bald Eag     ", dataLines: [...] }
```

### File-Type Grouping with Named Repeats

Use one `repeat` per file type rather than a single generic `files` array. Schema order determines serialization order — match the order HEC-RAS writes them.

```typescript
repeat("geometries",       startsWith("Geom File="),          schema([stringField("file", "Geom File=",          { trim: true })]))
repeat("steadyFlows",      startsWith("Flow File="),           schema([stringField("file", "Flow File=",          { trim: true })]))
repeat("unsteadyFlows",    startsWith("Unsteady File="),       schema([stringField("file", "Unsteady File=",      { trim: true })]))
repeat("quasiSteadyFlows", startsWith("QuasiSteady File="),    schema([stringField("file", "QuasiSteady File=",   { trim: true })]))
repeat("sedimentFiles",    startsWith("Sediment File="),       schema([stringField("file", "Sediment File=",      { trim: true })]))
repeat("waterQualityFiles",startsWith("Water Quality File="),  schema([stringField("file", "Water Quality File=", { trim: true })]))
repeat("plans",            startsWith("Plan File="),           schema([stringField("file", "Plan File=",          { trim: true })]))
repeat("hdFiles",          startsWith("HD File="),             schema([stringField("file", "HD File=",            { trim: true })]))
```

`repeat` always returns `[]` (never `undefined`) — it is always `status: "success"`.

### CRLF Files — Always End With `blankLine()`

HEC-RAS files use Windows CRLF. After `.replace(/\r\n/g, "\n").split("\n")`, there is a trailing `""`. Add `blankLine()` as the last schema item.

```typescript
export const mySchema = schema([
  // ... all fields ...
  blankLine(),  // ← handles trailing "" from CRLF split
])
```

---

## Combinator Behavior Reference

| Combinator | Returns when absent | Serializes when undefined |
|---|---|---|
| `stringField(..., { optional: true })` | `undefined` (skipped) | nothing |
| `repeat(...)` | `[]` (always success) | nothing |
| `section(...)` | `undefined` (skipped) | nothing |
| `tupleArrayField(..., { optional: true })` | `undefined` (skipped) | nothing |
| `tupleArrayField(...)` (required) | terminates parse | header with count 0 |
| `contextual(...)` | `undefined` (skipped) | nothing (serializer not called) |

---

## Round-Trip Test Structure

```typescript
function readFile(filename: string): string[] {
  const filePath = resolve(__dirname, "../data/mytype", filename)
  const fileContent = readFileSync(filePath, "utf-8")
  return fileContent.replace(/\r\n/g, "\n").split("\n")  // normalize CRLF
}

function roundTrip(filename: string): void {
  const lines = readFile(filename)
  const { value } = parseWithSchema(mySchema, lines, 0)
  const serialized = serializeWithSchema(mySchema, value)
  expect(serialized).toEqual(lines)
}
```

Choose test files that cover: optional fields present vs absent, zero vs non-zero counts, different unit types.

---

## Checklist for a New Schema

1. Examine real sample files — look for CRLF, flag lines, count patterns, optional sections
2. Map each line pattern to a combinator using the decision tree above
3. For file-type references: use one named `repeat` per type, ordered to match HEC-RAS write order
4. For count-then-data: determine if data is numeric (→ `tupleArrayField`) or string (→ `section` pattern)
5. End with `blankLine()` if files use CRLF
6. Test files: pick samples that exercise each optional field/section both present and absent
7. Round-trip first, then add parsed-value assertions for key fields
