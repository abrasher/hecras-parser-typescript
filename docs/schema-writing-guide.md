# Schema Writing Guide

This guide explains how we write new schemas under `src/schemas/**` so they read the same from file to file. Refer to well-factored examples such as `culvertSchema`, `geometry/breakLineSchema`, `geometrySchema`, and `geometry/bridge/bridgeSchema` when you need concrete patterns.

## Keep Schemas Consistent
- Start each schema with `schema([...])`, and compose it from `fields`, `tupleField`, `tupleArrayField`, `multiField`, `repeat`, `section`, and `include`.
- Order items exactly as they appear on disk and keep related optional lines grouped together (headers, arrays, trailing flags).
- Use `Infer<typeof mySchema>` for typing, so the schema remains the single source of truth.
- Prefer inline part definitions—configure `numberPart`, `stringPart`, `booleanPart`, etc. at the callsite instead of hoisting them to shared constants. Shared constants are only allowed when a `contextual` block becomes unreadable without them.
- Reach for helpers in `src/schema/parsingUtils.ts` and `src/schema/serializationUtils.ts` before writing ad-hoc parsing or formatting logic. Do not duplicate these helpers locally.
- Match padding, widths, counts, and boolean encodings exactly. Use `{ pad: true }`, `width`, `maxWidth`, and `mode` options instead of manual string building.

## Do's and Don'ts
- **Do** describe the wire format with short comments when the shape is non-obvious (counts, tuple widths, padding quirks). Skip comments for trivial lines.
- **Do** keep parsing tolerant: use `startsWith(...)` recognizers with `repeat`/`section` instead of hard-coded indexes.
- **Do** add round-trip tests beside every new schema and update docs when behavior changes.
- **Don't** introduce bespoke parsers or serializers outside the DSL unless there is no alternative.
- **Don't** invent new helpers or locally redefine existing utilities.
- **Don't** convert blanks to default values—respect `nullOnBlank`, optional fields, and the blank/undefined rules so round-trips stay lossless.
- **Don't** rely on ambient context; every serializer must be deterministic from the provided value object.

## Field and Part Catalog
- `stringField`, `numberField`, `booleanField`: single-field lines that handle optional omission (`optional: true`) and blank semantics (`nullOnBlank: true`). Pair `booleanField` with `{ mode: ... }` (`"-1,0"`, `"TF"`, `"trueFalse"`, `"10"`, etc.).
- `multiField(label, fields({ ... }))`: CSV-style lines. Each field uses `stringPart`, `numberPart`, `booleanPart`, or `countedArrayLengthPart`. Undefined parts serialize as blanks; the line emits while at least one part is defined.
- `tupleField(label, parts, options?)`: fixed-order tuples on one line. Use `numberPart({ pad: true })`, etc. for spacing.
- `tupleArrayField(label, key, { width, maxWidth, tuple, formatter, pad })`: counted tables with fixed-width formatting. `formatter: "coordinate"` or `"station"` enforces the right number styling.
- `countedFixedWidthArray(key, { width, maxWidth, tuple, formatter, pad })`: body-only companion for headers with explicit length parts (see culvert/barrel arrays).
- `repeat(key, recognizer, nestedSchema)`: consume zero or more contiguous blocks sharing a recognizer such as `startsWith("Junct Name=")`.
- `section(key, recognizer, nestedSchema)`: same as `repeat` but enforces a single block. Use when the block has its own header/footer rules.
- `include(nestedSchema)`: inline another schema's items directly into the current sequence. Ideal when the file interleaves items without an extra object layer.
- Parts for use inside `fields(...)`: `stringPart`, `numberPart`, `booleanPart`, `countedArrayLengthPart`, `integerPart`, plus formatting switches like `{ width, trim, pad }`.
- Utility parts: `blankLine`, `blankLines`, `blankLineIfNotEmpty`, `textBlockField` for description blobs, `opt(...)` to mark optional segments.

## When to Use Contextual
Contextual parsing (`contextual(...)`) handles the rare cases where the DSL cannot express the format (variable-width blocks, embedded counts, or interleaved arrays). Treat it as a last resort:
- Try `tupleArrayField`, `countedFixedWidthArray`, or a combination of `multiField`/`repeat` before reaching for `contextual`.
- Restrict `contextual` blocks to the minimum span necessary; emit standard DSL items for the surrounding lines.
- Keep any helper variables scoped to the contextual block, and document the format quirks it handles.
- Follow the dedicated [Contextual Blocks Guide](./schema-contextual-guide.md) for detailed expectations and allowed helpers.

## Writing Tests
- Add schema-specific tests under `test/schemas`, using `parseWithSchema`, `parseSectionWithSchema`, and `serializeWithSchema`.
- Cover parse-only assertions, serialize-to-string expectations (including padding), and round-trip equality.
- Capture edge cases (blank fields, Infinity sentinels, boolean encodings) directly in the fixtures.
