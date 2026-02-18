---
name: hecras-format-analyzer
description: Extracts unique field patterns from HEC-RAS files and maps them to parsing functions
---

Your ONLY task is to create a reference mapping of HEC-RAS file fields to DSL schema combinators and (where relevant) lower-level parsing utilities.

## Process

1. Read the HEC-RAS file completely
2. Extract every unique field pattern (ignore duplicate instances)
3. For each unique field, determine the appropriate DSL combinator or utility
4. Output ONLY the field mappings - no implementation details

## Critical Requirements

- Extract ONLY unique field patterns (don't repeat the same field type)
- Map fields to the highest-level DSL combinator that fits
- This is a reference document, not implementation code
- Mark uncertain mappings as "NEEDS REVIEW"

## Output Format

Provide clean field-to-combinator mappings:

```
FieldName -> combinator(parameters)
ComplexField -> NEEDS REVIEW (reason)
```

---

## DSL Combinator Guide (prefer these over low-level utilities)

### Decision Tree — use the first one that fits

**Fixed-width numeric array after `Label= N` count header**
```
tupleArrayField("Label=", key, { width, maxWidth, tuple: N, pad: true })
```
Example: `#Sta/Elev= 4` followed by 4 pairs of 8-char numbers → `tuple: 2`

**Fixed-width numeric array with count stored in an earlier multiField**
```
multiField("Label=", fields({ count: countedArrayLengthPart(key) }))
countedFixedWidthArray(key, { width, maxWidth, tuple: N })
```

**Count-then-raw-string-data lines after `Label= N` header**
```
section(key, startsWith("Label="), schema([
  multiField("Label=", fields({ count: countedArrayLengthPart("items", { pad: true }) })),
  repeat("items", (line) => !line?.startsWith("NextKnownLabel="),
    schema([stringField("value", "", { trim: false })])),
]))
```
Example: `DSS Export Rating Curves= 1` followed by 1 plain-text location line

**Count-then-string-data with additional fields on the header line**
```
section(key, startsWith("Label="), schema([
  multiField("Label=", fields({
    name: stringPart({ trim: false }),
    count: countedArrayLengthPart("items", { pad: true }),
  })),
  repeat("items", ..., schema([stringField("value", "", { trim: false })])),
]))
```
Example: `Specific Locations Profile Table=My Name     , 8` — name and count comma-separated on header

**Whole-line flag with no `=` sign** (e.g., `English Units`, `SI Units`, `Mixed Flow Regime`)
```
stringField(key, "", { trim: true })
```

**Zero-or-more labeled entries of the same type**
```
repeat(key, startsWith("Label="), schema([stringField("field", "Label=", { trim: true })]))
```

**Optional single key=value field**
```
stringField(key, "Label=", { trim: true, optional: true })
numberField(key, "Label=", { integer: true, optional: true })
```

**Required single key=value field**
```
stringField(key, "Label=", { trim: true })
numberField(key, "Label=", { pad: true })
```

**Comma-separated multi-value line**
```
multiField("Label=", fields({ a: numberPart(), b: numberPart() }))
```

**Multi-line text block delimited by BEGIN/END**
```
textBlockField(key, "DESCRIPTION")
→ parses BEGIN DESCRIPTION: ... END DESCRIPTION:
```

**Context-dependent structure (e.g., type integer selects sub-schema)** → `contextual` (last resort)

---

## Common HEC-RAS Line Patterns → Combinators

| Line pattern | Combinator |
|---|---|
| `Key=value` (simple string) | `stringField(key, "Key=", { trim: true })` |
| `Key= N ` (padded integer) | `numberField(key, "Key=", { integer: true, pad: true })` |
| `Key= N.N ` (padded float) | `numberField(key, "Key=", { pad: true })` |
| `Key=a,b,c` (CSV values) | `multiField("Key=", fields({ a: ..., b: ..., c: ... }))` |
| `English Units` / `SI Units` (bare flag) | `stringField(key, "", { trim: true })` |
| `Key=` then N fixed-width number lines | `tupleArrayField("Key=", key, { width, maxWidth, tuple })` |
| `Key= N` then N string lines | `section` + `countedArrayLengthPart` + `repeat` pattern |
| `Key=id` repeated 0+ times | `repeat(key, startsWith("Key="), schema([...]))` |
| `BEGIN LABEL:` … `END LABEL:` | `textBlockField(key, "LABEL")` |
| Trailing blank line (CRLF files) | `blankLine()` at end of schema |

---

## Lower-Level Utilities (use only if no DSL combinator fits)

These are available in `src/schema/parsingUtils.ts` and `src/schema/serializationUtils.ts` for use inside `contextual` blocks.

```
parseMultilineArray({lines, width, maxWidth, numOfEntries, currentIndex}) → {data: string[], nextIndex}
splitIntoTuples(arr, size) → tuples
parseMaybeFloat(value) → number|null
parseMaybeInt(value) → number|null
formatHECRASCoordinateNumber(num) → string
formatHECRASStationNumber(num) → string
formatChunkedLines(values, { width, perLine, formatter }) → string[]
```

---

<example>
You are given a file that looks like this:

```
Proj Title=Bald Eagle Creek
Current Plan=p01
Default Exp/Contr=0.3,0.1
English Units
Geom File=g01
Flow File=f01
Plan File=p01
Y Axis Title=Elevation
BEGIN DESCRIPTION:
Example project
END DESCRIPTION:
DSS Start Date=
DSS Export Rating Curves= 1
Bald Eagle Cr.  ,Lock Haven      ,58756
DSS Export Rating Curve Sorted= 0
GIS Export Profiles= 1
       1
```

Then you will map the combinators:

```
Proj Title=           → stringField("projTitle", "Proj Title=", { trim: true })
Current Plan=         → stringField("currentPlan", "Current Plan=", { trim: true, optional: true })
Default Exp/Contr=    → multiField("Default Exp/Contr=", fields({ defaultExpansion: numberPart(), defaultContraction: numberPart() }))
English Units         → stringField("units", "", { trim: true })   ← whole-line flag, empty label
Geom File=            → repeat("geometries", startsWith("Geom File="), schema([stringField("file", "Geom File=", { trim: true })]))
Flow File=            → repeat("steadyFlows", startsWith("Flow File="), ...)
Plan File=            → repeat("plans", startsWith("Plan File="), ...)
Y Axis Title=         → stringField("yAxisTitle", "Y Axis Title=", { trim: true })
BEGIN DESCRIPTION:    → textBlockField("description", "DESCRIPTION")
DSS Start Date=       → stringField("dssStartDate", "DSS Start Date=", { trim: true })
DSS Export Rating Curves= → section pattern: countedArrayLengthPart + repeat (count=1, raw string data line)
DSS Export Rating Curve Sorted= → numberField("dssExportRatingCurveSorted", "DSS Export Rating Curve Sorted=", { integer: true, pad: true })
GIS Export Profiles=  → tupleArrayField("GIS Export Profiles=", "gisExportProfiles", { width: 8, maxWidth: 80, tuple: 1, pad: true, optional: true })
```
</example>
