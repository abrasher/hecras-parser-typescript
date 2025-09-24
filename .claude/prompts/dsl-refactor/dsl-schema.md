# 📑 Geometry Parser/Serializer Framework — Technical Specification

## 1. Core Concepts

1. Rule
   A `Rule<T>` is the atomic unit. It knows how to parse from lines into a partial object, and how to serialize the same object back to lines. Rules are pure and deterministic.

   ```ts
   interface ParseResult<T> {
     value: Partial<T>
     nextIndex: number
   }

   interface Rule<T> {
     // acc is the current partial object; use it for context‑dependent parsing
     parse(lines: string[], start: number, acc: Partial<T>): ParseResult<T> | null
     serialize(obj: T): string[]
   }
   ```

2. Schema
   A `Schema<T>` is an ordered list of rules. Parsing tries rules in order for each line; serialization emits rules in schema order.

   ```ts
   type Schema<T> = Rule<T>[]
   ```

3. Driver Behavior
   - Input: `lines`, `start`, `schema`, `strict` flag
   - Loop from `start`:
     - Do not skip empty lines; blank lines must be matched by rules (see `blankLine` / `blankLines`).
     - Try each rule in order: the first that matches returns a result; merge into accumulator (`Object.assign`) and advance to `nextIndex`.
     - If none match:
       - If `strict: true` → throw (complete coverage required)
       - If `strict: false` → stop (bubble up to parent)

4. Serialization Behavior
   - For each rule in schema order → append `rule.serialize(obj)`.
   - Output order is exactly the schema declaration order.

5. No implicit scoping / unknown passthrough
   - No “scoped block” mechanism; termination relies only on “no rule matched → end section”.
   - No capture of unexpected lines: top‑level uses `strict: true` to enforce full coverage.

---

## 2. Reusable Parts and Multi‑Field Lines

To avoid parallel arrays of keys/parsers/serializers, rules can be built from reusable parts.

- Part
  ```ts
  interface Part<V> {
    parse(s: string): V
    serialize(v: V): string
  }
  ```

- Common parts
  - `numberPart(opts?)`
  - `stringPart(opts?)`
  - `booleanPart({ mode: 'TF'|'10'|'trueFalse'|'enableDisable' })`
  - `durationPart()`

- Multi‑field (CSV) rule
  ```ts
  type FieldSpec<T> = { key: keyof T; part: Part<any> }

  function multiField<T>(prefix: string, fields: FieldSpec<T>[]): Rule<T>
  ```
  - Parses `prefix + csv`, splitting by comma, applying parts in declared order.
  - Serializes by joining per‑field outputs with commas in the same order.

---

## 3. Primitive Rule Factories

- `stringField(prefix, key, opts?)`
- `numberField(prefix, key, opts?)`
- `booleanField(prefix, key, { mode })`
- `durationField(prefix, key)`
- `multiField(prefix, fields)` (CSV only)
- `delimitedBlock(begin, end, key)` — for BEGIN/END description blocks
- `countedFixedWidthTuples(prefix, key, { width, maxWidth, tuple, map?, unmap?, allowNulls? })`
  - Header line contains the tuple count. Body spans fixed‑width numeric chunks across as many lines as needed. Values are grouped by `tuple` and optionally mapped to/from typed items.
- `csvTableAfterCount(prefix, key, rowParser)` — header contains row count; consume that many CSV lines

Blank line handling (explicit formatting control):
- `blankLine()` — matches and emits a single empty line
- `blankLines(n)` — matches and emits exactly `n` consecutive empty lines

All of the above return a Rule<T> with both `parse` and `serialize` defined.

---

## 4. Combinators

- `repeat(key, schema, recognizer)`
  - Repeats a sub‑schema as long as `recognizer(lines[i])` is true at the item start.
  - Calls `parseWithSchema(sub, lines, i, { strict: false })` for each item.
  - Collects results at `key`.

No scoped blocks; section termination is “no rule matched → end”.

---

## 5. Driver Functions

```ts
function parseWithSchema<T>(
  schema: Schema<T>,
  lines: string[],
  start: number,
  opts?: { strict?: boolean },
): ParseResult<T>

function serializeWithSchema<T>(schema: Schema<T>, obj: T): string[]
```

- Top‑level parse uses `{ strict: true }` to enforce complete coverage (any non‑empty, unmatched line is an error).
- Section parses (via `repeat`) use `{ strict: false }` to end cleanly when the next line doesn’t match any rule in the section.
- Empty lines are not skipped; include `blankLine`/`blankLines` rules where formatting requires them.

---

## 6. Custom Rules (one‑offs)

When a line depends on previously parsed values (e.g., the count is derived from another field in the same section), write a custom inline `Rule<T>`. The driver provides `acc` (current partial object) to support such logic.

Example: “Permanent Ineff=” booleans sized by the number of previously parsed ineffectiveFlowAreas.

```ts
const permanentIneffRule: Rule<CrossSection> = {
  parse(lines, i, acc) {
    const line = lines[i]
    if (!line.startsWith('Permanent Ineff=')) return null
    const count = acc.ineffectiveFlowAreas?.length ?? 0
    const width = 8, maxWidth = 80
    const perLine = Math.floor(maxWidth / width)
    let idx = i + 1
    const values: boolean[] = []
    for (; values.length < count; idx++) {
      const chunks = (lines[idx] ?? '').match(/.{1,8}/g) ?? []
      for (const c of chunks) {
        const t = c.trim()
        if (t) values.push(t === 'T')
        if (values.length === count) break
      }
    }
    if (count === 0) return { value: { permanentIneffective: [] }, nextIndex: i + 1 }
    if (values.length !== count) throw new Error('Permanent Ineff count mismatch')
    return { value: { permanentIneffective: values }, nextIndex: idx }
  },
  serialize(obj) {
    const vals = obj.permanentIneffective ?? []
    const count = obj.ineffectiveFlowAreas?.length ?? 0
    if (vals.length !== count) throw new Error('Permanent Ineff must match ineffectiveFlowAreas length')
    const width = 8, maxWidth = 80, perLine = Math.floor(maxWidth / width)
    const out: string[] = ['Permanent Ineff=']
    for (let i = 0; i < vals.length; i += perLine) {
      const chunk = vals
        .slice(i, i + perLine)
        .map((b) => (b ? 'T' : 'F').padStart(width, ' '))
        .join('')
      out.push(chunk)
    }
    return out
  },
}
```

---

## 7. Example Schemas

- CrossSection (header line + a few common fields)

```ts
const crossSectionSchema: Schema<CrossSection> = [
  multiField<CrossSection>('Type RM Length L Ch R=', [
    { key: 'type', part: numberPart({ integer: true }) },
    { key: 'riverMile', part: stringPart({ trim: true }) },
    { key: 'lengthLeft', part: numberPart() },
    { key: 'lengthChannel', part: numberPart() },
    { key: 'lengthRight', part: numberPart() },
  ]),
  countedFixedWidthTuples<CrossSection, [number, number]>('#Sta/Elev=', 'stationElevation', {
    width: 8,
    maxWidth: 80,
    tuple: 2,
  }),
  // Ineffective areas then the custom Permanent Ineff rule
  countedFixedWidthTuples<CrossSection, [number, number, number]>('#XS Ineff=', 'ineffectiveFlowAreas', {
    width: 8,
    maxWidth: 72,
    tuple: 3,
  }),
  permanentIneffRule,
]
```

- RiverReach (repeats CrossSections)

```ts
const riverReachSchema: Schema<RiverReach> = [
  multiField<RiverReach>('River Reach=', [
    { key: 'riverName', part: stringPart({ trim: true }) },
    { key: 'reachName', part: stringPart({ trim: true }) },
  ]),
  countedFixedWidthTuples<RiverReach, [number, number]>('Reach XY=', 'coordinates', {
    width: 16,
    maxWidth: 64,
    tuple: 2,
  }),
  repeat<RiverReach, CrossSection>('crossSections', crossSectionSchema, (line) =>
    line.startsWith('Type RM Length L Ch R='),
  ),
]
```

- File‑level composition (declare in desired serialization order)

```ts
const fileSchema: Schema<FileModel> = [
  repeat('junctions', junctionSchema, (l) => l.startsWith('Junct Name=')),
  repeat('riverReaches', riverReachSchema, (l) => l.startsWith('River Reach=')),
  repeat('storageAreas', storageAreaSchema, (l) => l.startsWith('Storage Area=')),
  repeat('breakLines', breakLineSchema, (l) => l.startsWith('BreakLine Name=')),
  repeat('connections', connectionSchema, (l) => l.startsWith('Connection=')),
  repeat('boundaryConditions', boundaryConditionSchema, (l) => l.startsWith('BC Line Name=')),
  repeat('icPoints', icPointSchema, (l) => l.startsWith('IC Point Name=')),
  // single land cover block
  landCoverRule,
]

// Parse with strict coverage at top level
const { value: model } = parseWithSchema(fileSchema, lines, 0, { strict: true })

// Serialize in the same order as declared above
const out = serializeWithSchema(fileSchema, model)
```

---

## 8. Design Principles

- Pure rules and deterministic drivers
- Complete coverage at the top level (strict mode), no unknown passthrough
- Termination by “no rule matched → end section” (no scoped blocks)
- Serialization order exactly matches schema order
- Reusable parts for consistent CSV field parsing/formatting
- Custom one‑off rules for context‑dependent cases
