Parsing Flow

Split Into Lines: Converts content to lines and uses a moving cursor index to scan top-to-bottom in one pass (src/parseGeometry.ts:21).
Header First: Delegates the file preamble (title, version, view rect, optional description) to parseHeader, which consumes only header-like lines and returns nextIndex to the first non-header line (src/parseGeometry.ts:39, src/parsers/geometry/headerParser.ts:16).
Dispatch Loop: Iterates while index < lines.length, skipping blanks, reading the current line, and routing by start-of-line sentinel strings via line.startsWith(...) checks (src/parseGeometry.ts:50–57, 59–121).
Section Delegation: For each recognized section, calls a dedicated parser module, collects its data into the geometry object, and advances the cursor using either nextIndex or linesConsumed from the result (src/parseGeometry.ts:60–121).
Unknown Lines: If a line doesn’t match any known section start, it increments index and continues, allowing forward-compatibility with unhandled tokens (src/parseGeometry.ts:122–125).
Error Context: A top-level try/catch wraps parsing and reports the failing line number, bubbling up the specific sub-parser’s error message (src/parseGeometry.ts:128–134).
Sub-Parser Pattern

Entry Contract: Sub-parsers accept the full lines array plus a startIndex (and sometimes the current line) and return { data, nextIndex } or { data, linesConsumed }, enabling the caller to advance the cursor precisely (e.g., storage/connection/boundary/junction/river parsers).
Sentinel-Guided Scans: Within a section, parsers iterate while lines match expected prefixes for that section, breaking when they encounter another section’s start or a non-matching line. Examples:
Header parsing stops at first non-header line (src/parsers/geometry/headerParser.ts:20–50).
Connection parsing guards with isConnectionLine and breaks on a new section or the next connection block (src/parsers/geometry/connectionParser.ts:35–53).
River reach parsing similarly uses isRiverReachLine to bound the section (src/parsers/geometry/riverReachParser.ts:20–33).
Count-Then-Read Lists: Many lists are introduced by a header line that includes a count; parsers then consume a known number of fixed-width lines using shared helpers, transforming them into coordinates/tuples (e.g., reach XY, surface lines, profiles).
Optional/Repeated Blocks: Repeated items are handled by “while next line starts with X” loops; optional data often short-circuits if counts are 0 or values are blank, returning early with minimal cursor movement.
Utilities & Conventions

Key/Value Lines: parseKeyValue extracts key=value pairs; variants handle CSV and fixed-width fields (src/parsers/atomic.ts:1).
Fixed-Width Multiline Data: parseMultilineArray slices lines by field width and total entry count, then converters like arrayToCoordinates/arrayToNumberPairs shape them into typed tuples (src/parsers/multiLineParsers.ts:19, 71; exports at 69–80).
Tolerant Number Parsing: Helpers like parseMaybeInt/parseMaybeFloat convert blanks to null and guard against NaNs where appropriate (src/parsers/atomic.ts:87–123).
Clear Termination: Each sub-parser either:
Stops when it sees a different section’s sentinel, or
Stops when expected per-section keys no longer match,
ensuring it doesn’t consume subsequent top-level sections.
Mental Model

Single-pass scanner with a cursor.
Start-of-line sentinels drive routing.
Each section has a small state machine confined to known prefixes.
Lists use “count header → fixed-width rows → convert to tuples”.
Sub-parsers always return where to resume, keeping the top-level loop in sync.