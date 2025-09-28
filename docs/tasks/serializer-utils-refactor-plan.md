# Schema-Aligned Serializer Utils Consolidation Plan

## Goals
- Collapse duplicated helpers into a single surface that mirrors `src/parsers/utils.ts` into `src/schema/serializationUtils.ts`.
- Align with schema-first architecture and support current bridge schema migration needs.
- Prepare utilities for Phase 5 schema-driven serialization while supporting custom contextual serializers.
- Preserve current formatting quirks via new unit tests before implementing broader refactors.
- Don't update any callers during migration period.
- Keep original files as is during transition.

## File Layout Changes
1. Create `src/schema/serializationUtils.ts` as the canonical utility module (aligns with schema-first architecture).
2. Leave `src/serializers/utils.ts` the same during migration period.
3. Leave `src/serializers/atomic.ts` the same during migration period.
4. Update schema framework files (`core.ts`, `driver.ts`, `combinators.ts`) to use consolidated utilities.

## Helper Consolidation
- **Primitive formatters**
  - Keep a single `formatKeyValue`, `formatCommaSeparated`, `formatBoolean`, `formatDuration`.
  - Rename `formatDuration` to live next to parsing counterpart; ensure reciprocal behavior with `parseDuration`.
  - Replace `formatMaybeNullorUndefined` with `formatNullableNumber` that mirrors `parseMaybeFloat` semantics (blank for `undefined`, custom token for `null`).

- **Fixed-width strings**
  - Consolidate `formatFixedWidth` and `toFixedWidthString` into enhanced `formatFixedWidth` with pad direction and null handling.
  - Support schema `tupleArrayField` serialization patterns.

- **Chunked lines (Schema-compatible)**
  - Introduce `formatChunkedLines(values, { width, perLine, formatter, nullFormatter?, padDirection? })` to replace:
    - `formatNumbersToChunks`
    - `formatNumbersOrNullToChunks`
    - `formatStationElevationPairs`
    - `formatArray`
  - Design compatible with schema `contextual()` serializers and future schema parts.
  - Drop dependency on `chunk` from `es-toolkit` in favor of internal implementation.

- **Schema-specific utilities**
  - Add `formatCoordinateChunks()` for schema coordinate serialization.
  - Add `formatStationChunks()` for schema station serialization.
  - Keep `formatHECRASCoordinateNumber` and `formatHECRASStationNumber` as primitive formatters.

## Type + Naming Alignment
- Align helper names with parser counterparts (`parseMaybeFloat` ↔ `formatNullableNumber`).
- Move Coordinate and Station type imports to the unified module; expose schema-compatible surface.
- Document each helper with succinct comments, matching the tone used in `src/parsers/utils.ts`.
- Ensure compatibility with schema DSL patterns (options objects, composable functions).

## Schema Framework Updates
- **Update `src/schema/driver.ts`**:
  - Replace `formatFixedWidth` import from `../serializers/atomic` with `./serializationUtils`.
  - Update `serializeTupleArrayField` to use enhanced `formatChunkedLines`.
- **Update `src/schema/core.ts`**:
  - Add types for enhanced serialization options if needed.
- **Update `src/schema/combinators.ts`**:
  - Use consolidated utilities for any formatting operations.
- **Update existing schema files**:
  - Update `src/schemas/bridge/bridgeSchema.ts` to use new utilities in custom serializers.

## Testing
- Add serializer utility tests under `tests/schema/serializationUtils.test.ts` covering:
  - `formatKeyValue`, `formatCommaSeparated`, `formatBoolean` variations.
  - `formatFixedWidth` enhanced options and truncation behavior.
  - `formatChunkedLines` with various configurations and edge cases.
  - Coordinate and station helpers with integer, decimal, zero, and negative values.
  - `formatDuration` round-trip scenarios (seconds/minutes/hours/etc.).
  - Schema compatibility: integration with `contextual()` serializers.
  - Round-trip tests: `serialize(parse(original)) === normalized(original)`.

## Follow-up Work
- After consolidating utilities, update bridge schema custom serializers to use new utilities.
- Leave legacy serializer files (`src/serializers/atomic.ts`, `src/serializers/utils.ts`) unchanged during migration.
- In Phase 5 of schema-first migration, replace legacy serializers with schema-driven ones using these utilities.
- Consider removing legacy serializer files after Phase 6 when migration is complete.

## Helper Details

### formatChunkedLines (Enhanced)
- **Signature**: `formatChunkedLines<T>(values: ReadonlyArray<T>, options: { width: number; perLine: number; formatter: (value: T) => string; nullFormatter?: (value: T) => string; padDirection?: 'start' | 'end' }): string[]`
- **Parameters**:
  - `values`: ordered items to render.
  - `options.width`: fixed column width for each formatted item.
  - `options.perLine`: how many items to place on each output line.
  - `options.formatter`: maps each value into its base string before padding.
  - `options.nullFormatter`: optional handler for null/undefined values.
  - `options.padDirection`: padding direction ('start' | 'end'), defaults to 'start'.
- **Schema Compatibility**: Designed to work with `contextual()` serializers and future schema parts.
- **Example**:
  - Input: `formatChunkedLines([1.2, null, -0.5, 10], { width: 8, perLine: 2, formatter: (n) => n?.toString() ?? '', nullFormatter: () => '' })`
  - Output: `["     1.2        ", "    -0.5      10"]`

### formatNullableNumber
- **Signature**: `formatNullableNumber(value: number | null | undefined, options?: { width?: number; blankToken?: string }): string`
- **Parameters**:
  - `value`: number, null, or undefined to format.
  - `options.width`: optional fixed width for padding.
  - `options.blankToken`: token to use for null values (defaults to "").
- **Alignment**: Mirrors `parseMaybeFloat` semantics (blank for undefined, custom token for null).
- **Schema Integration**: Compatible with `numberPart({ nullOnBlank: true })` patterns.

