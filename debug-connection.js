// Simple debug script to test connection parsing
import { HecRasGeometryParser } from "./src/HECRASGeometryParser.js"

const connectionTestData = `
Connection=Culv_43         ,0,0
Connection Desc=Dimensions assumed by KGS 2024
Connection Line=2
    484553.74016    4751433.1891484551.728939999   4751441.22004
Connection Centerline Profile=0
Connection Last Edited Time=May-21-2025 14:53:52
Conn CellSize Min=2
Conn Near Repeats=1
Connection Up SA=2D_Grid         
Connection Dn SA=2D_Grid         
Conn Routing Type= 1 
Conn Use RC Family=False
Conn OverFlow Method 2D=True
Conn Weir WD=3.23
Conn Weir Coef=1.4
Conn Weir Is Ogee= 0 
Conn Simple Spill Pos Coef=0.05
Conn Simple Spill Neg Coef=0.05
Conn Weir SE= 2 
       0  262.45    8.28   262.5

Connection=DM22-38608      ,0,0
Connection Desc=2nd bridge downstream of Dingman Dr
Connection Line=2
    483888.50815    4751220.0721     483877.6897    4751236.0422
Connection Centerline Profile=0
Connection Last Edited Time=May-15-2025 15:58:25
Conn CellSize Min=2
Conn Near Repeats=1
Connection Up SA=2D_Grid         
Connection Dn SA=2D_Grid         
Conn Routing Type= 32 
Conn Use RC Family=False
Conn OverFlow Method 2D=True
Conn Weir WD=3
Conn Weir Coef=1.4
Conn Weir Is Ogee= 0 
Conn Weir Design EG=0
Conn Weir Design HT=0
Conn Simple Spill Pos Coef=0.05
Conn Simple Spill Neg Coef=0.05
Conn Weir SE= 0 
Conn HTab HWMax=267
`

const parser = new HecRasGeometryParser()
console.log("Parsing test data...")
console.log("First few lines:")
console.log(connectionTestData.split("\n").slice(0, 5))

const result = parser.parse(connectionTestData)
console.log("Connections found:", result.connections.length)

if (result.connections.length > 0) {
  console.log("First connection:", result.connections[0])
} else {
  console.log("No connections found")
}
