
# 📑 Geometry Parser/Serializer Framework — Technical Specification

## 1. Core Concepts

1. **Rule**  
   A `Rule<T>` is the atomic unit of parsing.  
   - It specifies *how to parse one or more lines* into a partial object of type `T`.  
   - It specifies *how to serialize* the same object back into one or more lines.  
   - Rules should be **pure functions**: for a given `lines` + index, they always return the same result or `null`.

   ```ts
   interface ParseResult<T> {
     value: Partial<T>      // properties parsed from these lines
     nextIndex: number      // index in `lines` after parsing
   }

   interface Rule<T> {
     parse(lines: string[], start: number): ParseResult<T> | null
     serialize(obj: T): string[]
   }
   ```

2. **Schema**  
   A `Schema<T>` is a collection of `Rule<T>`.  
   - It defines how to fully parse and serialize an object of type `T`.  
   - Executed sequentially: each line is offered to each rule.  
   - If a rule matches, apply and advance index.  
   - If no rule matches, stop and bubble up to the parent schema.

   ```ts
   type Schema<T> = Rule<T>[]
   ```

3. **Parser behavior**  
   - Input: `lines[]`, starting index, schema.  
   - For each line starting at `i`:
     1. Try rules in schema order.
     2. If a rule matches → apply it (`Object.assign` into accumulator).
     3. Advance pointer to rule’s `nextIndex`.
     4. If no rule matches → stop parsing this schema and return control to the parent.

4. **Serialization behavior**  
   - For each rule in schema → call `rule.serialize(obj)`;  
   - Concatenate results in schema order.

---

## 2. Rule Types

The system must provide **primitive rules** and **combinators**:

### 2.1 Primitive Rules
- `stringField(prefix, key, opts)`  
  - Matches: `prefix + value`  
  - Populates string property.  
- `numberField(prefix, key, opts)`  
  - Same as above but parses number.  
- `multiFieldRule(prefix, keys[], parsers[], serializers[])`  
  - Matches a comma‑separated line.  
  - Populates multiple properties.

### 2.2 Combinators
- `repeat(key, schema, recognizer)`  
  - Repeated application of a **sub‑schema**.  
  - Continues as long as `recognizer(line)` returns true at current index.  
  - Collects parsed items into an array at property `key`.

---

## 3. Parser Driver Functions

### 3.1 ParseWithSchema
- Input: schema, `lines[]`, starting index.
- Output: `{ value: T, nextIndex: number }`
- Behavior:
  ```ts
  function parseWithSchema<T>(
    schema: Schema<T>,
    lines: string[],
    start: number
  ): ParseResult<T>
  ```
  - Initialize `obj = {} as T`
  - For i from `start` until end of file:
    - Try each rule in schema.
    - If match → merge values, set new i.
    - If none match → stop; return `{obj, nextIndex: i}`.

### 3.2 SerializeWithSchema
- Input: schema, object of type T.
- Output: `string[]` lines
- Behavior: apply all schema rules in order.

---

## 4. Nesting / Bubble‑Up Control Flow

- **Nested schemas** (e.g., CrossSection inside RiverReach):  
  - Implemented via `repeat` combinator.  
  - Child schema stops when none of its rules match.  
  - Control returns to parent, which decides whether to start another child, or close out.

- This ensures: 
  - Children don’t need explicit stop conditions for parents.  
  - Parents are responsible for orchestration.

---

## 5. Example Implementation Requirements

### 5.1 CrossSection Schema
Must match lines beginning with `Type RM Length L Ch R=` etc., and capture properties.

```ts
const crossSectionSchema: Schema<CrossSection> = [
  multiFieldRule("Type RM Length L Ch R=", 
    ["type","riverMile","lengthLeft","lengthChannel","lengthRight"],
    [Number, String, Number, Number, Number],
    [String, String, String, String, String]
  ),
  // + additional rules for XS GIS, Bank Sta, etc.
]
```

### 5.2 RiverReach Schema
Must match lines beginning with `River Reach=...` and repeat cross section schema.

```ts
const riverReachSchema: Schema<RiverReach> = [
  multiFieldRule("River Reach=", ["riverName","reachName"], [s=>s.trim(), s=>s.trim()], [String, String]),
  repeat("crossSections", crossSectionSchema, line => line.startsWith("Type RM Length"))
]
```

### 5.3 Top Level (Whole File)
File schema can simply be:

```ts
const fileSchema: Schema<{ reaches: RiverReach[] }> = [
  repeat("reaches", riverReachSchema, line => line.startsWith("River Reach="))
]
```

---

## 6. Design Principles

1. **Pure rules**: no mutation of index outside return value.
2. **Bubble up errors**: if a rule can’t parse → parent decides. No hidden coupling.
3. **Symmetry**: each rule implements both parse & serialize, guaranteeing round‑trippability.
4. **Extensibility**: new line types = new rule. New entity = new schema.
5. **Testability**: each schema & rule testable independently with line slices.

---

## 7. Worked Use Case

Input:

```
River Reach=Mississippi,Lower Delta
Type RM Length L Ch R=1,12.3,45,67,89
Type RM Length L Ch R=2,15.3,55,77,99
River Reach=Ohio,Upper
```

Execution:

```ts
const { value: file } = parseWithSchema(fileSchema, lines, 0)

console.log(file.reaches.length) // 2
console.log(file.reaches[0].crossSections[1].riverMile) // "15.3"

const serialized = serializeWithSchema(fileSchema, file)
console.log(serialized.join("\n")) // round‑trips to original
```
