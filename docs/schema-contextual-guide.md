# Contextual Blocks Guide

`contextual()` is the escape hatch for schema shapes that the core DSL cannot describe. Use it sparingly and keep the implementation narrow so the surrounding schema stays declarative.

## When Contextual Is Appropriate
- The section mixes headers and data in a way that requires peeking ahead or consuming a variable number of lines before the next recognizer.
- Data is arranged in grids or interleaved arrays where `tupleArrayField` or `countedFixedWidthArray` cannot express the required shape.
- The block needs to branch on subtype headers (`Type=...`) or share state between adjacent arrays.

If a line can be expressed with `stringField`, `numberField`, `tupleField`, `multiField`, `tupleArrayField`, `repeat`, or `section`, prefer those instead. Contextual should be the smallest possible wrapper around the truly irregular segment.

## Required Structure
- Implement contextual blocks with a parser and serializer pair that operate on `lines` and `startIndex`/`nextIndex`.
- Keep helper variables defined inside the contextual closure unless they are imported utilities.
- Document the format with concise comments so future contributors understand the control flow.
- Return `null` immediately when the recognizer does not match, and leave downstream lines untouched.

## Allowed Utilities
- Reuse helpers from `src/schema/parsingUtils.ts` such as `parseKeyValue`, `parseCommaSeparated`, `parseMultilineArray`, `splitIntoTuples`, and `parseMaybeFloat`.
- Reuse helpers from `src/schema/serializationUtils.ts` such as `formatFixedWidth`, `formatHECRASCoordinateNumber`, `formatHECRASStationNumber`, `formatStationElevationPairs`, and `formatNullableNumber`.
- Do not reimplement or locally copy these utilities. If a new helper is needed, add it once to the shared util file before using it here.

## Serializer Expectations
- Build the output as an array of strings and return it directly from the serializer function.
- Mirror the parse order exactly; counts and padding must match the source spacing conventions (`width`, `pad`, sentinel values, etc.).
- Keep branching logic data-driven—avoid hard-coded indexes when you can iterate over tuples or derive lengths from the parsed value.

## Testing
- Add focused tests that exercise both the success path and the fallback `null` behavior.
- Include round-trip coverage: parse → serialize → parse should return the same value slice the contextual block is responsible for.
- Verify padding, blank fields, and boolean encodings using fixture lines that reflect real HEC-RAS files.
