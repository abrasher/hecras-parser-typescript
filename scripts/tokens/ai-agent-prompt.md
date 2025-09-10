AI parser workflow instructions (Step 1 + Step 2)

Goal
- Produce a minimal per-key parse type map (Step 1) without loading whole blocks.
- Then, only for multiline/section keys, gather just enough metadata to configure the correct parser (Step 2).

Inputs
- Use these helpers to gather lightweight evidence:
  - scripts/extract-start-of-line-tokens.ts
  - scripts/extract-values-of-key.ts
  - scripts/extract-token-context.ts

Step 1: Key → Type Classification
- Output: an array of objects with:
  - startsWith: exact key, including trailing “=”
  - type: one of single, csv, multilineArray, multilineCSV, sectionStart, unknown
- Example:
  - { startsWith: "Storage Area=", type: "sectionStart" }
  - { startsWith: "Viewing Rectangle=", type: "csv" }
  - { startsWith: "XS GIS Cut Line=", type: "multilineArray" }

How to classify
- Tokenization:
  - Treat a “token/header line” as a line that starts with optional spaces, then letters or ‘#’, followed by text, and contains “=” (e.g., “XS GIS Cut Line=4”).
  - Always anchor matching to the start of line (do not use substring/contains for classification).
  - Use the exact tokens discovered by scripts/extract-start-of-line-tokens.ts.
- Look‑ahead window:
  - After the header line, inspect up to the next 5 non-empty lines.
  - Stop early if you hit the next token/header line.
- csv:
  - The header has “=” and the value contains at least one comma.
  - Within the look‑ahead window, the next non-empty, non-token line is either another token or EOF.
  - Examples: “Rch Text X Y=…”, “Bank Sta=…”, “Exp/Cntr=…”.
- single:
  - The header has “=” and the value contains no comma.
  - Within the look‑ahead window, the next non-empty, non-token line is either another token or EOF.
  - Examples: “Program Version=…”, “Reverse River Text=…”, “Node Last Edited Time=…”.
- multilineArray:
  - The header has “=” and either:
    - The value is an integer (e.g., “4”), and the next non-empty, non-token line appears numeric-only (digits/periods/spaces, no commas), OR
    - The next 1–5 non-empty, non-token lines appear numeric-only (no commas), suggesting fixed-width fields.
  - Common widths: 8 (station/elevations, triplets) and 16 (coordinates).
  - 0‑count case: if value is “0” and the next line is a token or EOF, still classify as multilineArray (zero-length block).
  - Examples: “XS GIS Cut Line=…”, “Reach XY=…”, “#Sta/Elev=…”, “#Mann=…”.
- multilineCSV:
  - The header has “=” and at least one of the next 1–5 non-empty, non-token lines contains commas before the next token.
- sectionStart:
  - The header begins a composite section that spans multiple sub-keys until a higher-level token appears.
  - Examples: “River Reach=…”, “Type RM Length L Ch R = …” (cross‑section start), “Storage Area=…”, “Connection=…”, “Junction=…”, “Boundary Conditions=…”.
  - Heuristic: within the look‑ahead window, you quickly see multiple distinct sub-keys (new tokens) logically belonging to the same component (e.g., “XS GIS Cut Line=”, “#Sta/Elev=”, … after “Type RM Length …”; or “Storage Area …” family after “Storage Area=”).
- unknown:
  - If none of the above can be decided confidently within the 5‑line look‑ahead, mark as unknown.

Step 1 procedure (concise)
- Get the ordered token list and counts with scripts/extract-start-of-line-tokens.ts.
- For each token:
  - Pull 1–3 anchored contexts with scripts/extract-token-context.ts <token> <file>.
  - Apply the look‑ahead window rules above to classify the token, without reading full blocks.
- Emit only the minimal array:
  - [{ startsWith: "<Key>=", type: "<type>" }, …]
  - Keep it small; no extra fields in Step 1.

Step 2: Deep Dive (only for multiline*/sectionStart)
- Purpose: compute parser parameters with minimal extra context.
- For multilineArray:
  - width/maxWidth:
    - Test width 8 and 16 over the observed data lines; choose the width that parses cleanly (fewest “remainder” chars).
    - maxWidth defaults: 80 for width 8, 64 for width 16; override if the sample shows otherwise.
  - entriesPerLine: maxWidth / width (typically 10 for width 8, 4 for width 16).
  - numOfEntries:
    - If header value is an integer N, use N (times pair/triplet factor if applicable).
    - If header value is CSV, infer by counting numeric fields across data lines until the next token.
  - structure:
    - Identify expected fields per entry when obvious (e.g., 2 for coordinates, 2 for station–elev pairs, 3 for triplets like “#Mann”).
- For multilineCSV:
  - numberOfLines: count CSV rows until the next token (cap at small N to avoid reading whole blocks).
  - fieldsPerRow: median number of commas + 1 across the observed sample.
- For sectionStart:
  - Enumerate immediate sub-keys and likely order using the token sequence (what typically follows).
  - Save only the sub-keys and a short ordered list; no need to expand each sub-key in Step 2 unless they are multiline*.
- Optional type hints (for Step 3 parser mapping):
  - boolean-like: “True/False”, “-1/0”, “0/1”, “Enable/Disable”.
  - duration-like: matches “(\d+(\.\d+)?)\s*(SEC|MIN|HOUR|DAY|WEEK|MONTH|YEAR)”.
  - numeric-enum: small closed sets of integers appearing repeatedly.

Guardrails
- Keep context bounded:
  - Do not read more than 5 non-empty lines past a header in Step 1.
  - In Step 2, limit sampling to the minimum lines needed to reliably infer width/shape.
- Anchor to start-of-line:
  - When fetching contexts or detecting “next token”, match headers at line start, not substring matches mid-line.
- Zero-length arrays:
  - “= 0” still implies multilineArray; just zero entries.
- Don’t overfit:
  - Prefer 8/16 width unless evidence contradicts; avoid inventing widths.

Examples (typical)
- csv: “Viewing Rectangle=…”, “Rch Text X Y=…”, “Bank Sta=…”, “Exp/Cntr=…”.
- single: “Program Version=…”, “Reverse River Text=…”, “Node Last Edited Time=…”.
- multilineArray: “Reach XY=…”, “XS GIS Cut Line=…”, “#Sta/Elev=…”, “#Mann=…”.
- sectionStart: “River Reach=…”, “Type RM Length L Ch R = …”, “Storage Area=…”, “Connection=…”.

Deliverables
- Step 1: minimal JSON array [{ startsWith, type }, …].
- Step 2: for items with type ∈ {multilineArray, multilineCSV, sectionStart}, a compact supplement with only:
  - multilineArray: { width, maxWidth, entriesPerLine, inferredNumOfEntries? }
  - multilineCSV: { numberOfLines?, fieldsPerRow? }
  - sectionStart: { subKeys: [“Key A=”, “Key B=”, …] }
- Keep both outputs small to avoid overwhelming downstream context.

