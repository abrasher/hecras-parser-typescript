import { readFileSync } from 'fs'
import { parseWithSchema } from './src/schema/driver'
import { planSchema } from './src/schemas/planSchema'

const planFile = './test/data/plans/BaldEagleDamBrk.p01'
const lines = readFileSync(planFile, 'utf-8').split(/\r?\n/)

try {
  const result = parseWithSchema(planSchema, lines, 0, { strict: true })
  console.log('Parsing stopped at line:', result.nextIndex)
  console.log('Total lines:', lines.length)
  console.log('\nNext few lines after parsing stopped:')
  for (let i = result.nextIndex; i < Math.min(result.nextIndex + 10, lines.length); i++) {
    console.log(`${i}: ${lines[i]}`)
  }

  console.log('\nParsed data:')
  console.log(JSON.stringify(result.value, null, 2))
} catch (error) {
  console.error('Error parsing:')
  console.error(error)
}
