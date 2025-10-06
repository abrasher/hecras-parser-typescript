### Schema-First Overview

- We build everything with a schema-first parser/serializer. Read:
  - `docs/hecras-parsing-format-specification.md` — milestones, formatting constraints, decisions/risks
  - `.claude/prompts/dsl-refactor/schema-first.md` — DSL spec, typing, serialization rules
- New work defines schemas under `src/schemas/**` using DSL items from `src/schema/**` and the drivers in `src/schema/driver.ts`.

Key directories

- `src/schema/**` — DSL core: `core.ts` (types, Infer), `driver.ts` (parse/serialize), `combinators.ts`, `parts.ts`, `serializationUtils.ts`, `parsingUtils.ts`
- `src/schemas/**` — Section schemas (e.g., `breakLineSchema.ts`, `junctionSchema.ts`, `geometrySchema.ts`)
- `docs/hecras-parsing-format-specification.md` — tracker for schema coverage, format decisions, and risks

DSL quick reference (see full spec for details)

- Structure: `schema([...])`, `fields({...})`, `multiField(label, fields, { optional? })`, `tupleArrayField(label, key, { width, maxWidth, tuple })`, `contextual(key, parser, serializer?)`
- Composition: `section(key, recognizer, subSchema)`, `repeat(key, recognizer, subSchema)`, `include(subSchema)`
- Parts/semantics: `opt(part)` for optional fields; `numberPart({ nullOnBlank: true })` for blank→null; boolean modes `TF | 10 | trueFalse | enableDisable | -1,0`
- Drivers: `parseWithSchema(schema, lines, start, { strict? })`, `parseSectionWithSchema(schema, lines, start)`, `serializeWithSchema(schema, obj)`

Common schema patterns from implemented schemas:

- **Coordinates**: Use `tupleField("name", "Label=", [numberPart(), numberPart()])` for single coordinate pairs
- **Coordinate arrays**: Use `tupleArrayField("Label=", "key", { width: 16, maxWidth: 64, tuple: 2, formatter: "coordinate", pad: true })` for coordinate tables
- **Boolean encoding**: HEC-RAS uses `-1,0` encoding frequently (use `booleanPart({ mode: "-1,0" })` or `booleanField(key, label, { mode: "-1,0" })`)
- **Optional numbers**: Use `numberField(key, label, { nullOnBlank: true })` to preserve blank→null semantics
- **Variable sections**: Use `repeat(key, startsWith("Pattern"), subSchema)` for 0+ repeated sections
- **String constraints**: Use `stringField(key, label, { length: 32, trim: true })` for fixed-length fields

Migration workflow (summary)

1) Identify the target section; review existing models, schema tests, and representative HEC-RAS samples to understand requirements.
2) Define a schema in `src/schemas/<name>Schema.ts` using DSL items; prefer `tupleArrayField` for fixed-width tables.
3) Add adapters or recognizers where appropriate; keep top-level tolerant until the surrounding coverage is complete.
4) Add tests for parser parity and serializer round-trip where possible.
5) Update `docs/hecras-parsing-format-specification.md` with coverage status and any decisions/risks.

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

This library parses HEC-RAS geometry files (.g01, .g02, etc.) using a schema-first DSL that drives both parsing and serialization.

Key pieces

- `src/schema/core.ts` — schema item types, `Infer` typing, parts/options
- `src/schema/driver.ts` — schema-driven parse and serialize functions
- `src/schema/combinators.ts` — composition helpers (`section`, `repeat`, `include`)
- `src/schema/parsingUtils.ts` — shared helpers for contextual/custom blocks
- `src/schema/serializationUtils.ts` — helpers for fixed-width formatting and chunking
- `src/schemas/**` — section schemas with domain-specific composition
- `src/models/**` — TypeScript interfaces for domain models; use `Infer<typeof schema>` or `satisfies` for compatibility during migration

Parsing strategy

- Prefer declarative schema items to encode sentinels, tuple arrays, and context-dependent lines.
- Use recognizers (`startsWith('...')`) to bind sub-schemas; keep per-section non-strict until coverage is complete.
- Encode optional and null/blank semantics at the Part level to preserve round-trip fidelity.
- When custom handling is unavoidable, isolate it in `contextual` blocks backed by helpers in `src/schema/parsingUtils.ts`.

## HEC-RAS Format Gotchas

**CRITICAL**: HEC-RAS files have strict formatting that can break parsers if not handled carefully. Rely on DSL parts/utilities instead of bespoke parsing.

### Parsing Challenges

**Important Parsing Notes**:

- For fixed-width tables, ensure tuple widths (`width`, `maxWidth`) match actual line widths; tests should verify column boundaries.
- **Coordinate formatting**: HEC-RAS uses 16-character fixed-width formatting for coordinates. Use `formatter: "coordinate"` with `tupleArrayField` or `countedFixedWidthArray`.
- **Boolean encoding variations**: Different sections use different boolean encodings (`-1,0`, `TF`, `0,1`). Always set `booleanPart({ mode })` explicitly.
- **Blank vs null**: Many numeric fields preserve blank→null semantics. Use `nullOnBlank: true` to maintain round-trip fidelity.
- **String trimming**: Many string fields have trailing spaces that should be preserved or trimmed consistently. Use `trim: true` where appropriate.

### General Parsing Principles

Always assume the format is wrong until proven right. Use comprehensive validation and provide meaningful error messages for format inconsistencies. Test round-trip serialization to ensure format preservation.

## Core Philosophy

PRAGMATIC PARSING IS THE PRIORITY. The schema-first DSL is designed for clarity, maintainability, and correctness while keeping the format specifics explicit and testable.

## Shared Utilities

- `src/schema/parsingUtils.ts` — contextual helpers such as `parseMultilineArray` and `splitIntoTuples`
- `src/schema/serializationUtils.ts` — coordinate/station formatters and padding helpers
- `docs/hecras-parsing-format-specification.md` — living log for tricky formatting, decisions, and open risks
