# Unsteady Flow (.u##) Field Mappings

Reference mapping for HEC-RAS Unsteady Flow fields based on test/data/unsteady_flows/BaldEagleDamBrk.u02. This document lists unique field patterns and the recommended parsing utilities. Marked as NEEDS REVIEW where uncertain.

## Flow Title=

Example:
`Flow Title=Single 2D Area with Bridges`
Parsers:
title: string = parseKeyValue

## Program Version=

Example:
`Program Version=5.10`
Parsers:
version: string = parseKeyValue

## Use Restart=

Example:
`Use Restart= 0 `
Parsers:
useRestart: boolean = parseBooleanLine
Notes:

- NEEDS REVIEW: Some files use True/False strings instead of -1/0

## Boundary Location=

Example:
`Boundary Location=                ,                ,        ,        ,                ,BaldEagleCr     ,                ,DSNormalDepth                   `
Parsers:
columns: string[] = parseValueAsCSV
Notes:

- Pads are fixed-width; values are trimmed strings
- Same pattern is used for gates and normal depth boundaries

## Friction Slope=

Example:
`Friction Slope=0.0003,0`
Parsers:
[slope: number|null, flag: number|null] = parseValueAsCSV + parseMaybeFloat

## Interval=

Example:
`Interval=1HOUR`
Parsers:
intervalSeconds: number = parseDurationLine

## Flow Hydrograph=

Example:

```
Flow Hydrograph= 200
    1000    3000    6500    8000    9500   11000   12500   14000   15500   17000
```

Parsers:
count: number = parseKeyValue + parseMaybeInt
values: number[] = parseMultilineArray (width=8, maxWidth=80, numOfEntries=count) + map(parseFloat)
Notes:

- First line provides count of values that follow

## Stage Hydrograph TW Check=

Example:
`Stage Hydrograph TW Check=0`
Parsers:
twCheck: boolean = parseBooleanLine
Notes:

- NEEDS REVIEW: Value uses 0/-1 convention; verify against other files

## Flow Hydrograph QMult=

Example:
`Flow Hydrograph QMult= 0.5 `
Parsers:
qMult: number|null = parseKeyValue + parseMaybeFloat

## Flow Hydrograph Slope=

Example:
`Flow Hydrograph Slope= 0.0005 `
Parsers:
slope: number|null = parseKeyValue + parseMaybeFloat

## DSS Path=

Example:
`DSS Path=`
Parsers:
path: string = parseKeyValue

## Use DSS=

Example:
`Use DSS=False`
Parsers:
useDSS: boolean = parseKeyValue
Notes:

- NEEDS REVIEW: parseBooleanLine expects -1/0; this uses True/False

## Use Fixed Start Time=

Example:
`Use Fixed Start Time=False`
Parsers:
useFixedStartTime: boolean = parseKeyValue
Notes:

- NEEDS REVIEW: True/False literal, not -1/0

## Fixed Start Date/Time=

Example:
`Fixed Start Date/Time=,`
Parsers:
[date: string, time: string] = parseValueAsCSV

## Is Critical Boundary=

Example:
`Is Critical Boundary=False`
Parsers:
isCritical: boolean = parseKeyValue
Notes:

- NEEDS REVIEW: True/False literal

## Critical Boundary Flow=

Example:
`Critical Boundary Flow=`
Parsers:
criticalBoundaryFlow: number|null = parseKeyValue + parseMaybeFloat

## Gate Name=

Example:
`Gate Name=Gate #1     `
Parsers:
gateName: string = parseKeyValue

## Gate DSS Path=

Example:
`Gate DSS Path=`
Parsers:
path: string = parseKeyValue

## Gate Use DSS=

Example:
`Gate Use DSS=False`
Parsers:
useDSS: boolean = parseKeyValue
Notes:

- NEEDS REVIEW: True/False literal

## Gate Time Interval=

Example:
`Gate Time Interval=1HOUR`
Parsers:
intervalSeconds: number = parseDurationLine

## Gate Use Fixed Start Time=

Example:
`Gate Use Fixed Start Time=False`
Parsers:
useFixedStartTime: boolean = parseKeyValue
Notes:

- NEEDS REVIEW: True/False literal

## Gate Fixed Start Date/Time=

Example:
`Gate Fixed Start Date/Time=,`
Parsers:
[date: string, time: string] = parseValueAsCSV

## Gate Openings=

Example:
`Gate Openings= 100 `
`       2       2       2       2       2       2       2       2       2       2`
Parsers:
count: number = parseKeyValue + parseMaybeInt
values: number[] = parseMultilineArray (NEEDS REVIEW width/maxWidth) + map(parseFloat)

## Precipitation Mode=

Example:
`Precipitation Mode=`
Parsers:
mode: string = parseKeyValue

## Wind Mode=

Example:
`Wind Mode=`
Parsers:
mode: string = parseKeyValue

## Air Density Mode=

Example:
`Air Density Mode=`
Parsers:
mode: string = parseKeyValue

## Met BC=

Example:
`Met BC=Air Density|Constant Value=1.225`
Parsers:

- step1: {key:"Met BC", value:string} = parseKeyValue
- step2: {key:string, value:string} = parseKeyValue(value)
  Notes:
- NEEDS REVIEW: To split the left-hand "key" into category and setting, a manual split on '|' is needed (no dedicated utility)

## Non-Newtonian Method=

Example:
`Non-Newtonian Method= 0 `
Parsers:
method: number|null = parseKeyValue + parseMaybeInt

## Non-Newtonian Constant Vol Conc=

Example:
`Non-Newtonian Constant Vol Conc=0`
Parsers:
value: number|null = parseKeyValue + parseMaybeFloat

## Non-Newtonian Yield Method=

Example:
`Non-Newtonian Yield Method= 0 `
Parsers:
method: number|null = parseKeyValue + parseMaybeInt

## Non-Newtonian Yield Coef=

Example:
`Non-Newtonian Yield Coef=0, 0`
Parsers:
[coef1: number|null, coef2: number|null] = parseValueAsCSV + parseMaybeFloat

## User Yeild=

Example:
`User Yeild=   0`
Parsers:
value: number|null = parseKeyValue + parseMaybeInt

## Non-Newtonian Sed Visc=

Example:
`Non-Newtonian Sed Visc= 0 `
Parsers:
value: number|null = parseKeyValue + parseMaybeFloat

## Non-Newtonian Obrian B=

Example:
`Non-Newtonian Obrian B=0`
Parsers:
value: number|null = parseKeyValue + parseMaybeFloat

## User Viscosity=

Example:
`User Viscosity=0`
Parsers:
value: number|null = parseKeyValue + parseMaybeFloat

## User Viscosity Ratio=

Example:
`User Viscosity Ratio=0`
Parsers:
value: number|null = parseKeyValue + parseMaybeFloat

## Herschel-Bulkley Coef=

Example:
`Herschel-Bulkley Coef=0, 0`
Parsers:
[coef1: number|null, coef2: number|null] = parseValueAsCSV + parseMaybeFloat

## Clastic Method=

Example:
`Clastic Method= 0 `
Parsers:
method: number|null = parseKeyValue + parseMaybeInt

## Voellmy Phi=

Example:
`Voellmy Phi=0`
Parsers:
value: number|null = parseKeyValue + parseMaybeFloat

## Non-Newtonian Hindered FV=

Example:
`Non-Newtonian Hindered FV= 0 `
Parsers:
value: number|null = parseKeyValue + parseMaybeFloat

## Non-Newtonian FV K=

Example:
`Non-Newtonian FV K=0`
Parsers:
value: number|null = parseKeyValue + parseMaybeFloat

## Non-Newtonian ds=

Example:
`Non-Newtonian ds=0`
Parsers:
value: number|null = parseKeyValue + parseMaybeFloat

## Non-Newtonian Max Cv=

Example:
`Non-Newtonian Max Cv=0`
Parsers:
value: number|null = parseKeyValue + parseMaybeFloat

## Non-Newtonian Bulking Method=

Example:
`Non-Newtonian Bulking Method= 0 `
Parsers:
method: number|null = parseKeyValue + parseMaybeInt

## Non-Newtonian High C Transport=

Example:
`Non-Newtonian High C Transport= 0 `
Parsers:
value: number|null = parseKeyValue + parseMaybeFloat
