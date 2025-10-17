# Connection Gate Support Plan

## Goal
Extend the connection schema so 2D connection gate blocks round-trip reliably, including user curve sets, multiple gates in sequence, and per-gate opening geometry.

## Scope
- Parse and serialize `Connection Gate User Curve Set` blocks (name, headwater array, optional per-opening array, and flows table).
- Support multiple gate headers in one connection, each with its own metadata, station list, and opening coordinates.
- Attach parsed openings to the correct gate so tests can assert on `gate.openings`.
- Preserve existing behaviour for culverts, bridges, weirs, and outlet rating curves.

## Deliverables
1. Updated schemas: `src/schemas/geometry/connectionSchema.ts`, `src/schemas/geometry/gateSchema.ts`, and helpers as needed.
2. Comprehensive tests in `test/schemas/geometry/connectionSchema.test.ts` covering real-world examples (including the provided block).
3. Documentation updates noting the new coverage in `docs/hecras-parsing-format-specification.md`.

## Implementation Strategy
1. **Model Review**
   - Define TypeScript interfaces for gate user curve sets and ensure `ConnectionSchema` reflects a list of gate blocks, each owning its openings and curve references.
2. **Schema Changes**
   - Introduce a new schema fragment (likely `gateUserCurveSetSchema`) that:
     - Recognizes the four-line header block with multiple repeats.
     - Uses `contextual` parsing plus `parseMultilineArray` to read the numeric tables.
   - Update `gateSchema` so the contextual parser collects its subsequent opening lines and returns them as `gate.openings`; consider storing them in the parsing context in order to reuse existing repeat logic cleanly.
   - Allow multiple gate blocks: wrap the gate contextual item in a `repeat("gates", startsWith("Conn Gate Name"), gateBlockSchema)` within `connectionSchema`. Each returned gate object should include metadata, stations, openings, and optional curve set references.
   - Ensure serialization mirrors the input format, including 16-character coordinate formatting, padding on station lines, and blank-line handling between blocks.
3. **Testing**
   - Add fixtures mirroring the provided gate block (both parsing and expected serialization).
   - Verify round-trip for:
     - Connection with one gate and openings (existing test).
     - Connection with multiple gates and shared curve sets (new test).
     - Connection with curve sets but no gate data to confirm optionality.
4. **Docs**
   - Document the new gate coverage and any assumptions (e.g., single curve set per gate vs shared) in the format spec decisions log.

## Validation
- `npm test -- connectionSchema`
- Manual inspection of serialized output against the provided example.

## Open Questions / Risks
- Clarify whether curve sets can omit the `Gate Opening` line or include multiple `Gate Opening` lines (observed in the example).
- Confirm whether curve sets must be referenced by name from the gate block or merely co-located.
- Validate that multiple gate sections do not require separator blank lines; adjust serializers if necessary.
