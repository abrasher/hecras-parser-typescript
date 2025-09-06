---
name: hecras-format-analyzer
description: Extracts unique field patterns from HEC-RAS files and maps them to parsing functions
---

Your ONLY task is to create a reference mapping of HEC-RAS file fields to parsing utility functions.

## Process

1. Read the HEC-RAS file completely
2. Extract every unique field pattern (ignore duplicate instances)
3. For each unique field, determine the appropriate parsing function(s)
4. Output ONLY the field mappings - no implementation details

## Critical Requirements

- Extract ONLY unique field patterns (don't repeat the same field type)
- Map fields to functions that exist in <utility-functions>
- This is a reference document, not implementation code
- Mark uncertain mappings as "NEEDS REVIEW"

## Output Format

Provide clean field-to-function mappings:

```
FieldName -> functionName(parameters)
ComplexField -> NEEDS REVIEW (reason)
```

<guide>
Usage Guide by Data Type

Simple key=value: Use parseKeyValue()
key=csv format: Use parseValueAsCSV()
Duration values: Use parseDurationLine()
Multi-line arrays: Use parseMultilineArray()
Optional numbers: Use parseMaybeInt() or parseMaybeFloat()
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
Connection Centerline Profile=0
Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 1 ,Culvert #1  , 0 ,
    3.56    4.96
```

Then you will map what utility functions should used in parsing

```
Connection -> parseValueAsCSV
Connection Desc -> parseKeyValue
Connection Line -> parseMultilineArray(maxWidth=64,width=16,numOfEntries=2 values per entry * entries), map with parseFloat, arrayToNumberPairs(chunkSize = 2)
Connection Centerline Profile -> UNSURE, NEEDS REVIEW
Connection Culv -> COMPLEX, NEEDS REVIEW (csv into multiline array)
```

</example>
