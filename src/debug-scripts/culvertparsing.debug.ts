import { parseCulvertData } from "../../src/parsers/culvertParser"

const lineString = `Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 1 ,Culvert #1  , 0 ,
    3.56    4.96    6.56    9.96
Conn Culvert Barrel=1,Barrel #01,2
    484557.98934   4751436.44773     484544.9229   4751438.60715
Conn Culvert Barrel=2,Barrel #02,3
    414557.989346744151436.44773     434544.9229   4351438.60715
     424544.9229   4251438.60715`

const lines = lineString.split("\n")

const culvertData = parseCulvertData(lines[0], lines, 0)
console.log(JSON.stringify(culvertData.data, null, 2))
