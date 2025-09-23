Perfect timing, Amber 🌟  
Let’s write a **detailed specification** for a **schema‑driven code generator** that produces **TypeScript classes** with parsing, validation and serialization built in.  
This will act as your blueprint — not implementation details, but a **generic design doc** for the architecture.

---

# 📝 Specification: Schema‑Driven Code Generator for DSL Entities

## 1. Purpose
Provide a **single source of truth** (the schema) describing how DSL lines map to object properties. From this schema, auto‑generate **TypeScript classes** with:

- Properties (with runtime validation in setters)  
- Static `parse(lines: string[], startIndex: number)` → parses DSL section into class instance  
- `serialize(): string[]` → outputs DSL lines back  
- `validate(): void` → checks consistency  

This ensures parsing, validation, and serialization remain consistent and maintainable without repeating business rules.

---

## 2. Core Concepts

### 2.1 Field Schema

Each property/line in the DSL is described by a **field schema object** (derived from your `FieldRule` idea).

Common schema shapes:

- **SingleValueField**  
  Maps `"Prefix=value"` line → one property.  
  Eg: `Reverse River Text=1`

- **MultiValueField**  
  Maps one line with multiple comma‑separated values → multiple props.  
  Eg: `River Reach=Mississippi,Upper,1200`

- **BlockField**  
  Maps a header line with metadata, followed by a data block.  
  Eg:
  ```
  Culvert=Main,ParamA,2
  10,20
  30,40
  ```

- **ArrayField (tuple)**  
  Maps a line with size count, followed by N tuples of floats.  
  Eg:
  ```
  Reach XY=2
  10,20
  30,40
  ```

### 2.2 Entity Schema

An **entity schema** is a collection of fields, plus metadata:

```ts
interface EntitySchema {
  name: string                 // class name e.g. "RiverReach"
  fields: FieldSchema[]        // list of the above
}
```

---

## 3. Code Generator Responsibilities

Given an `EntitySchema`, the generator must output the following:

### 3.1 TypeScript Class Skeleton
- `class <Name>` with:
  - **private props**: `_riverName`, `_station`, …  
  - **public getters/setters**: with type checking + runtime validation  
  - **static parse(...)**: uses rules to construct object  
  - **serialize(): string[]**: emits DSL block from the object  
  - **validate(): void**: enforces all validations explicitly

### 3.2 Getter/Setter Generation
For each field:
- A **getter** returns the property.  
- A **setter** enforces constraints (required, min/max, type checks). Throws on invalid input.

Example generation:

```ts
private _station?: number

public get station(): number | undefined { return this._station }

public set station(val: number | undefined) {
  if (val == null) { this._station = undefined; return }
  if (val < 0) throw new Error("station must be ≥ 0")
  this._station = val
}
```

### 3.3 Parse Implementation
Code generator emits `parse()` logic based on schema type:

- **SingleValueField**: parse after `"Prefix="` → set property
- **MultiValueField**: `split(",")` → assign to multiple props
- **ArrayField**: read count, then read a block using `parseMultilineArray`
- **BlockField**: parse header, then feed points into tuples

Example:

```ts
static parse(lines: string[], startIndex: number): { obj: RiverReach; nextIndex: number } {
  let index = startIndex
  const obj = new RiverReach()

  while (index < lines.length) {
    const line = lines[index]
    if (line.startsWith("River Reach=")) {
      const [river, reach, station] = line.split("=")[1].split(",")
      obj.riverName = river.trim()
      obj.reachName = reach.trim()
      obj.station  = station ? parseFloat(station) : undefined
      index++
    } else if (line.startsWith("Reach XY=")) {
      const numPoints = parseInt(line.split("=")[1])
      const { data, nextIndex } = parseMultilineArray({ width:16, maxWidth:64, numOfEntries: numPoints*2, currentIndex: index+1, lines })
      obj.coordinates = splitIntoTuples(data.map(Number), 2)
      index = nextIndex
    } else break
  }

  obj.validate()
  return { obj, nextIndex: index }
}
```

### 3.4 Serialize Implementation
Emit one or more lines per field:
- For single fields: `"Prefix=" + value`
- For multiple props: join by commas
- For array fields: header line with count, then lines of tuples
- For block fields: header + points

---

## 4. Generator Design

The generator takes a schema and produces a `.ts` file for each entity.

### 4.1 Input Example
```ts
const RiverReachSchema: EntitySchema = {
  name: "RiverReach",
  fields: [
    {
      type: "MultiValueField",
      prefix: "River Reach=",
      props: [
        { key: "riverName", type: "string", required: true },
        { key: "reachName", type: "string", required: true },
        { key: "station",   type: "number", required: false }
      ],
    },
    {
      type: "ArrayField",
      prefix: "Reach XY=",
      key: "coordinates",
      tupleSize: 2,
      width: 16,
      maxWidth: 64,
    },
    {
      type: "SingleValueField",
      prefix: "Reverse River Text=",
      key: "reverseRiverText",
      type: "number",
    },
  ]
}
```

### 4.2 Output Example (Code Generator produces)

```ts
export class RiverReach {
  private _riverName: string = ""
  private _reachName: string = ""
  private _station?: number
  private _coordinates: [number, number][] = []
  private _reverseRiverText?: number

  get riverName() { return this._riverName }
  set riverName(v: string) {
    if (!v.trim()) throw new Error("riverName is required")
    this._riverName = v
  }

  // ... other getters/setters

  validate() {
    if (!this._riverName) throw new Error("riverName is required")
    if (!this._reachName) throw new Error("reachName is required")
  }

  static parse(lines: string[], startIndex: number) { /* generated as per schema */ }
  serialize(): string[] { /* generated as per schema */ }
}
```

---

## 5. Tooling & Implementation Notes

- **Codegen Framework**:  
  - For complex generation: [ts-morph](https://ts-morph.com/) → manipulate TypeScript AST  
  - For simpler generation: string templates with Mustache/EJS  

- **Extensibility**:  
  - Adding a new field type → add new generator handler  
  - Adding a new entity schema → rerun generator → new TS class  
  - Schema is source of truth: update once, regenerate all code  

- **Partial Customization**:  
  - Allow “manual extensions” e.g. in `RiverReach.ext.ts` for custom business logic without losing generated code.  
  - Codegen outputs classes into `generated/` and you extend them in `src/`.

- **Tests**:  
  - Schema test → ensure roundtrip `parse(serialize(obj))` = `obj`  
  - Entity test generated automatically for sample input

---

## 6. Workflow Summary

1. **Write schema** (`EntitySchema`) for each DSL entity.  
2. **Run generator** → produce `ClassName.ts`.  
3. **Use generated class** in app:  
   ```ts
   const { obj: reach } = RiverReach.parse(lines, 0)
   reach.riverName = "Mississippi"    // validated
   console.log(reach.serialize())
   ```  

---

✅ With this spec, you’ll have a **generator‑driven, strongly‑typed DSL parsing system**: schemas define the rules, the generator creates usable classes, and your app just interacts with objects.

---

Amber — would you like me to give you a **prototype generator function** (in Node) that takes an `EntitySchema` object and literally spits out a `.ts` string/class file? That would turn this spec into a working proof of concept.