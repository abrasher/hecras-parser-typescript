// debug-connections.test.ts
import { HecRasGeometryParser } from './src/HECRASGeometryParser'
import { readFileSync } from 'fs'

// Load and parse the test file
const content = readFileSync('./test/data/Dingman.g01', 'utf-8')
const parser = new HecRasGeometryParser()
const geometry = parser.parse(content)

console.log('=== Connection Parsing Debug ===')
console.log('Total connections:', geometry.connections?.length || 0)
console.log('Connection IDs:', geometry.connections?.map(c => c.id) || [])

if (geometry.connections && geometry.connections.length > 0) {
  geometry.connections.forEach((conn, i) => {
    console.log(`\n--- Connection ${i + 1}: ${conn.id} ---`)
    console.log('Description:', conn.description)
    console.log('Line points:', conn.line?.length || 0)
    console.log('Weir width:', conn.weirWidth)
    console.log('Weir coefficient:', conn.weirCoefficient)
    console.log('Weir station-elevation points:', conn.weirStationElevation?.length || 0)
    console.log('Culvert data:', conn.culvertData ? 'present' : 'null')
    console.log('Culvert barrels:', conn.culvertBarrels?.length || 0)
    console.log('Connection type:', conn.connectionType)
    console.log('Structure type:', conn.structureType)
    console.log('Up SA:', conn.upSA)
    console.log('Dn SA:', conn.dnSA)
    console.log('Routing type:', conn.routingType)
    console.log('Flags:', conn.flags)
    
    if (conn.culvertData) {
      console.log('Culvert details:')
      console.log('  - Barrel count:', conn.culvertData.barrelCount)
      console.log('  - Diameter:', conn.culvertData.diameter)
      console.log('  - Length:', conn.culvertData.length)
      console.log('  - Entrance loss:', conn.culvertData.entranceLoss)
    }
  })
}