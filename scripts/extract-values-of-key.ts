import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

type Output = {
  file: string
  keys: Record<string, string[]>
  unmatched: string[]
}

function main() {
  const [, , filePath] = process.argv
  if (!filePath) {
    console.error('Usage: tsx scripts/extract-key-values.ts <path-to-text-file>')
    process.exit(1)
  }

  let content: string
  try {
    content = readFileSync(filePath, 'utf8')
  } catch (err) {
    console.error(`Failed to read file: ${filePath}`)
    console.error(err)
    process.exit(1)
  }

  const keys = new Map<string, string[]>()
  const unmatched: string[] = []

  const lines = content.split(/\r?\n/)
  for (const raw of lines) {
    if (raw.length === 0) continue
    const line = raw.replace(/\r$/, '')

    const trimmedLeft = line.replace(/^\s+/, '')
    // Only consider lines that begin with alphabetic or punctuation keys (not numeric)
    const first = trimmedLeft[0]
    if (first && /[0-9]/.test(first)) continue

    const eq = trimmedLeft.indexOf('=')
    if (eq !== -1) {
      const key = trimmedLeft.slice(0, eq).trimEnd()
      const value = trimmedLeft.slice(eq + 1).trim()
      if (!keys.has(key)) keys.set(key, [])
      if (value.length > 0) keys.get(key)!.push(value)
      else keys.get(key)!.push('')
    } else {
      // No equals sign; collect as unmatched (unique keys may not be Key=)
      // Keep the full trimmed line
      if (trimmedLeft.length > 0) unmatched.push(trimmedLeft)
    }
  }

  const out: Output = {
    file: basename(filePath),
    keys: Object.fromEntries(keys),
    unmatched,
  }

  const json = JSON.stringify(out, null, 2)
  console.log(json)

  try {
    const outDir = join('scripts', 'tokens')
    mkdirSync(outDir, { recursive: true })
    const outPath = join(outDir, `key-values-${basename(filePath)}.json`)
    writeFileSync(outPath, json, 'utf8')
  } catch (err) {
    console.error('Failed to write key-values output under scripts/tokens')
    console.error(err)
    process.exitCode = 2
  }
}

main()

