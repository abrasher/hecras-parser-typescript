Your task is to create a typescript interface and reference mapping of HEC-RAS unsteady flow file fields to parsing utility functions using test/data/BaldEagleDamBrk.u02 as a reference.

You will output the typescript interface in the src/models/unsteadyFlow/index.ts file
You will output the reference mapping document in docs/file-formats/unsteadyFlow.md file

You can look at the current geometry parser to understand how HECRAS files are formatted as geometry files the same conventions.

## Process

1. Read the HEC-RAS file completely
2. Extract every unique field pattern (ignore duplicate instances)
3. For each unique field, determine the appropriate parsing function(s)
4. Output ONLY the typescript interface and field mappings - no implementation details

## Critical Requirements

- Extract ONLY unique field patterns (don't repeat the same field type)
- Map fields to functions that exist in <utility-functions>
- This is a reference document, not implementation code
- Mark uncertain mappings as "NEEDS REVIEW"

## Output Format

Provide information and mappings:

```
## Connection=
Example:
`Connection=Culv_43         ,0,0`
Parser(s):
[name: string, centroidX: number, centroidY: number] = parseValueAsCSV
Notes: (OPTIONAL FIELD)
- `name` is limitted to 16 characters
- first line of a "Connection" section
```

<guide>
Usage Guide by Data Type

Simple key=value: Use parseKeyValue()
key=csv format: Use parseValueAsCSV()
Duration values: Use parseDurationLine()
Multi-line arrays: Use parseMultilineArray()
Optional numbers: Use parseMaybeInt() or parseMaybeFloat()
Boolean values: Use parseBooleanLine()
</guide>

<utility-functions>

atomic.ts
Key-Value Parsers:

- parseKeyValue(line, separator="=") → {key: string, value: string}
- parseValueAsCSV(line) → string[] (parses value from key=csv format)

List/Array Parsers:

- parseCommaSeparated(line) → string[]

Fixed-Width Parsing:

- chunkStringToNumbers(str, chunkWidth) → number[] (skips empty chunks)
- chunkStringToNumbersOrNull(str, chunkWidth) → (number|null)[] (null for empty chunks)
- chunkStringToStrings(str, chunkWidth) → string[]

Coordinate Conversion:

- numbersToCoordinates(nums) → {x: number, y: number}[]

Optional Parsing:

- parseMaybeInt(value) → number|null
- parseMaybeFloat(value) → number|null

Duration Parsing:

- parseDurationLine(line) → number (seconds)
- parseHECRASDuration(value) → number (parses "5MIN", "2HOUR", etc.)

lineParsers.ts - Line-Level Parsers (Tier 2)

Fixed-Width Line Parsers:

- parseLineToCoordinates(line) → {x: number, y: number}[] (16 chars/number)
- parseLineStationPairs(line) → {upstreamStation: number, downstreamStation: number}[] (8 chars/number)
- parseLineStationPairsWithNulls(line) → {upstreamStation: number|null, downstreamStation: number|null}[] (8 chars/number)

multiLineParsers.ts - Multi-Line Parsers

Multi-Line Array Parsing:

- parseMultilineArray({lines, width, maxWidth, numOfEntries, currentIndex}) → {data: string[], nextIndex: number}
- parseMultilineCSV({lines, currentIndex, numberOfLines}) → {data: string[][], nextIndex: number}

Utility Functions:

- arrayToNumberPairs(arr, chunkSize) → number[][]
  </utility-functions>

<example>
You are given a file that looks like this:

```
Connection=Culv_43         ,0,0
Connection Desc=Dimensions assumed by KGS 2024
Connection Line=2
    484553.74016    4751433.1891484551.728939999   4751441.22004
Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 1 ,Culvert #1  , 0 ,
    3.56    4.96
```

Then you will map what utility functions should used in parsing

```
## Connection=
Example
`Connection=Culv_43         ,0,0`
Parser(s):
[name: string, centroidX: number, centroidY: number] = parseValueAsCSV
Notes:
- `name` is limitted to 16 characters
- First line of a "Connection" section

## Connection Desc=
Example:
`Connection Desc=Dimensions assumed by KGS 2024`
description: string = parseKeyValue

## Connection Line=
Example:
`Connection Line=2
    484553.74016    4751433.1891484551.728939999   4751441.22004`
line: [x: number, y: number][] = parseMultilineArray, map with parseFloat, arrayToNumberPairs(chunkSize = 2)
Notes:
- maxWidth=64, width=16, numOfEntries=2 values per entry

## Connection Centerline Profile=
Example:
`Connection Desc=Dimensions assumed by KGS 2024`
description: string = parseKeyValue

## Connection Culv=
Example:
`Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 1 ,Culvert #1  , 0 ,
    3.56    4.96`
Parsers:
Custom Implementation Required
Notes:
- first line is a csv
- second line is start of multiline array

```

</example>
