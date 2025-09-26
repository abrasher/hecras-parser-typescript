### Schema-First Overview

- We are actively migrating to a schema-first parser/serializer. Read:
  - `docs/tasks/schema-first-migration.md` — milestones, parity goals, decisions/risks
  - `.claude/prompts/dsl-refactor/schema-first.md` — DSL spec, typing, serialization rules
- New work should define schemas under `src/schemas/**` using DSL items from `src/schema/**` and use the drivers in `src/schema/driver.ts`.

Key directories

- `src/schema/**` — DSL core: `core.ts` (types, Infer), `driver.ts` (parse/serialize), `combinators.ts`
- `src/schemas/**` — Section schemas (e.g., `breakLineSchema.ts`, `junctionSchema.ts`, `geometrySchema.ts`)
- `docs/tasks/schema-first-migration.md` — tracker for coverage and parity

DSL quick reference (see full spec for details)

- Structure: `schema([...])`, `fields({...})`, `multiField(label, fields)`, `tupleArrayField(label, key, { width, maxWidth, tuple })`, `contextual(key, parser, serializer?)`
- Composition: `section(key, recognizer, subSchema)`, `repeat(key, recognizer, subSchema)`, `include(subSchema)`
- Parts/semantics: `opt(part)` for optional fields; `numberPart({ nullOnBlank: true })` for blank→null; boolean modes `TF | 10 | trueFalse | enableDisable`
- Drivers: `parseWithSchema(schema, lines, start, { strict? })`, `parseSectionWithSchema(schema, lines, start)`, `serializeWithSchema(schema, obj)`

Migration workflow (summary)

1) Identify target section from the tracker; review existing model and legacy parser/serializer for parity.
2) Define schema in `src/schemas/<name>Schema.ts` using DSL items; prefer `tupleArrayField` for fixed‑width tables.
3) Add adapter usage where appropriate; keep top-level tolerant until full coverage.
4) Add tests for parser parity and serializer round‑trip where possible.
5) Update the migration tracker and note any decisions/risks.

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
- `src/schemas/**` — section schemas with domain-specific composition
- `src/models/**` — TypeScript interfaces for domain models; use `Infer<typeof schema>` or `satisfies` for compatibility during migration

Parsing strategy

- Prefer declarative schema items to encode sentinels, tuple arrays, and context-dependent lines.
- Use recognizers (`startsWith('...')`) to bind sub-schemas; keep per-section non-strict until coverage is complete.
- Encode optional and null/blank semantics at the Part level to preserve round-trip fidelity.

## HEC-RAS Format Gotchas

**CRITICAL**: HEC-RAS files have strict but weird formatting that can break parsers if not handled carefully. Always use a combination of atomic or line parsers if possible. Do not duplicate functionality.

### Parsing Challenges

**Important Parsing Note**:

- For fixed-width tables, ensure tuple widths (`width`, `maxWidth`) match actual line widths; tests should verify column boundaries.

### General Parsing Principles

Always assume the format is wrong until proven right. Use comprehensive validation and provide meaningful error messages for format inconsistencies.

## Core Philosophy

PRAGMATIC PARSING IS THE PRIORITY. The schema-first DSL is designed for clarity, maintainability, and correctness while keeping the format specifics explicit and testable.

## Deprecated: Legacy Parsing Approach

The previous sentinel-based approach is retained temporarily for parity and fallback. Avoid adding new code to it.

Legacy components

- `src/parseGeometry.ts` — legacy entrypoint orchestrating per-section parsers
- `src/parsers/atomic.ts`, `src/parsers/lineParsers.ts` — low/high-level line utilities
- `src/parsers/geometry/**` — specialized per-component parsers (culvert, bridge, storage area, etc.)
- `src/serializers/**` — per-section serializers

Legacy parsing pattern

- Use atomic parsing functions and line parsers to decode fixed-width segments.
- Specialized parsers assemble component models and return data with line counts.
- This pattern is deprecated in favor of the schema-first DSL; only apply targeted fixes during migration.
