#!/usr/bin/env tsx

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { HECRASParserV2 } from '../src/HECRASParserV2'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function debugParser() {
  console.log('🔍 Debug: HECRASParserV2 parsing')
  
  const parser = new HECRASParserV2()
  const filePath = join(__dirname, '..', 'test', 'data', 'Dingman.g01')
  const fileContent = readFileSync(filePath, 'utf-8')
  
  console.log('First 10 lines of file:')
  const lines = fileContent.split('\n')
  lines.slice(0, 10).forEach((line, i) => {
    console.log(`${i + 1}: "${line}"`)
  })
  
  try {
    // First, let's manually test the tokenizer
    const { HECRASTokenizer } = await import('../src/core/tokenizer.js')
    const { GeometryParserPlugin } = await import('../src/plugins/geometryPlugin.js')
    
    const plugin = new GeometryParserPlugin()
    const tokenizer = new HECRASTokenizer(plugin.tokenizerConfig)
    
    console.log('\n🔍 Testing tokenizer directly...')
    const tokenResult = await tokenizer.process(fileContent, {
      filePath,
      fileType: 'geometry',
      originalContent: fileContent,
      lines: fileContent.split('\n'),
      currentLine: 0,
      metadata: {}
    })
    
    console.log('Tokenizer success:', tokenResult.success)
    console.log('Number of tokens:', tokenResult.data?.length || 0)
    
    if (tokenResult.data && tokenResult.data.length > 0) {
      console.log('\nFirst 10 tokens:')
      tokenResult.data.slice(0, 10).forEach((token, i) => {
        console.log(`  ${i + 1}. ${token.type}: "${token.content}" (line ${token.lineStart})`)
        if (token.metadata) {
          console.log(`     metadata:`, token.metadata)
        }
      })
    }
    
    // Try the direct parse method to see what's returned
    const parseResult = await parser.parse(fileContent, filePath)
    
    console.log('\n📊 Parse Result:')
    console.log('Success:', parseResult.success)
    console.log('Errors:', parseResult.errors?.length || 0)
    console.log('Warnings:', parseResult.warnings?.length || 0)
    
    if (parseResult.errors && parseResult.errors.length > 0) {
      console.log('\n❌ Errors:')
      parseResult.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.message} (${error.code})`)
      })
    }
    
    if (parseResult.warnings && parseResult.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      parseResult.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning.message}`)
      })
    }
    
    if (parseResult.data) {
      console.log('\n📋 Data keys:', Object.keys(parseResult.data))
      console.log('Data:', JSON.stringify(parseResult.data, null, 2))
    }
    
  } catch (error) {
    console.error('\n💥 Exception thrown:')
    console.error(error)
  }
}

debugParser().catch(console.error)