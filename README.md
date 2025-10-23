# HEC-RAS Parser TypeScript

A schema-first TypeScript toolkit for reading and writing HEC-RAS geometry files (.gXX).

Currently targeting HEC-RAS 6.6 formats as of August 2025.

## Project Status

Implemented geometry schemas:
- Boundary Conditions
- Break Lines
- Junctions
- IC Points
- Storage Areas
- Land Cover regions
- Connection components (bridges, culverts, general connections)

Work in progress:
- River reach details (cross sections, lateral structures)
- 2D/SA connection refinements and integration glue

## Installation

```bash
npm install hecras-parser
```

## Working With Schemas

The library revolves around the DSL in `src/schema/**`. Schema definitions live under `src/schemas/geometry/**`, and tests under `test/schemas/geometry/**` provide round-trip coverage.

Example (from within this repo):

```typescript
import { parseWithSchema, serializeWithSchema } from "../src/schema/driver"
import { geometrySchema } from "../src/schemas/geometry/geometrySchema"

const lines = fileContent.split(/\r?\n/)
const { result } = parseWithSchema(geometrySchema, lines)
const roundTrip = serializeWithSchema(geometrySchema, result)
```

The public entrypoint (`src/index.ts`) currently exposes geometry/plan/unsteady-flow model types to support downstream typing while the schema-first pipeline firms up.

## Scripts

### Development

- `npm run build` – Build project (tsdown)
- `npm run dev` – Build with watch mode
- `tsc` – Run TypeScript compiler for type checking

### Testing

- `npm test` – Run Vitest test suite
- `npm run test:typecheck` – Run Vitest in type-checking mode

### Code Quality

- `npm run format` – Format code with Prettier
- `npm run lint` – Run ESLint
- `npm run lint:fix` – Run ESLint with automatic fixes

## Repository Layout

- `src/schema/**` – DSL core (`core.ts`, `driver.ts`, `combinators.ts`, `parts.ts`, `serializationUtils.ts`, `parsingUtils.ts`)
- `src/schemas/geometry/**` – Geometry section schemas
- `test/schemas/geometry/**` – Round-trip tests per schema
- `docs/hecras-parsing-format-specification.md` – Living documentation for tricky formatting, coverage, and risks

## Contributing

- Read `AGENTS.md`, `CLAUDE.md`, and `docs/hecras-parsing-format-specification.md` before contributing.
- New parsing/serialization work belongs in `src/schemas/**` using helpers from `src/schema/**`.
- Add or update tests alongside schema changes and keep the documentation in sync.
