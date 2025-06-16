#!/usr/bin/env tsx

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { HECRASParserV2 } from '../src/HECRASParserV2'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function debugStorageAreas() {
  console.log('🔍 Debug: Storage Area parsing')
  
  const parser = new HECRASParserV2()
  const filePath = join(__dirname, '..', 'test', 'data', 'Dingman.g01')
  const fileContent = readFileSync(filePath, 'utf-8')
  
  try {
    const parseResult = await parser.parse(fileContent, filePath)
    
    console.log('Parse Result Success:', parseResult.success)
    
    if (parseResult.data) {
      console.log('\n📊 Full Data Structure:')
      console.log(JSON.stringify(parseResult.data, null, 2))
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

debugStorageAreas().catch(console.error)