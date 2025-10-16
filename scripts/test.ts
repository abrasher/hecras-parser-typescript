import { parseMultilineArray, chunkToObjects } from "../src/parsers/multiLineParsers"

const lineString = `Conn Weir SE= 36 
       0  265.09      .3  265.08     1.3  265.09     2.3  265.07     6.8  265.07
     7.8  265.04     9.9  265.06    10.9  265.03    11.4  265.06    11.9  265.05
    13.4  265.06    13.9  265.04    14.9  265.04    15.4  265.01    16.4  265.06
    17.4  265.03    17.9  265.05    19.4  265.03    21.4  265.08    21.9  265.05
      23  265.08    25.5  265.06    26.5  265.09      27  265.07    27.5  265.09
      28  265.07    28.5  265.07      29  265.09    29.5  265.07    30.5   265.1
    31.5  265.08      32   265.1    33.9  265.11    34.5   265.1      35  265.13
    35.9  265.13`

const lines = lineString.split("\n").slice(1)

const numberOfEntries = 36
const width = 8
const maxWidth = 80

const res = parseMultilineArray(lines, numberOfEntries, width, maxWidth)
const res1 = res.data.map((d) => parseFloat(d))
console.log(chunkToObjects(res1, ["station", "elevation"]))
