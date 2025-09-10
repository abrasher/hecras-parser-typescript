import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

type ContextHit = {
  file: string
  lineNumber: number // 1-based
  lines: string[] // matched line + up to 2 following lines
}

type DedupHit = {
  lines: string[]
  first: { file: string; lineNumber: number }
  duplicates: Array<{ file: string; lineNumber: number }>
}

type Output = {
  token: string
  unique: DedupHit[]
}

function getContextLines(content: string, token: string): ContextHit[] {
  const lines = content.split(/\r?\n/)
  const hits: ContextHit[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes(token)) {
      const context = [line]
      if (i + 1 < lines.length) context.push(lines[i + 1])
      if (i + 2 < lines.length) context.push(lines[i + 2])
      hits.push({ file: '', lineNumber: i + 1, lines: context })
    }
  }

  return hits
}

function main() {
  const [, , token, ...files] = process.argv
  if (!token || files.length === 0) {
    console.error('Usage: tsx scripts/extract-token-context.ts <token> <file1> [file2 ...]')
    process.exit(1)
  }

  const results: Record<string, ContextHit[]> = {}
  for (const path of files) {
    let content: string
    try {
      content = readFileSync(path, 'utf8')
    } catch (err) {
      console.error(`Failed to read file: ${path}`)
      console.error(err)
      continue
    }
    const hits = getContextLines(content, token).map((h) => ({
      ...h,
      file: basename(path),
    }))
    results[basename(path)] = hits
  }

  // Build deduplicated contexts across all files, preserving discovery order
  const seen = new Map<string, DedupHit>()
  const unique: DedupHit[] = []
  const keyFor = (ctx: ContextHit) => ctx.lines.join('\n')

  for (const [file, hits] of Object.entries(results)) {
    for (const h of hits) {
      const key = keyFor(h)
      if (!seen.has(key)) {
        const entry: DedupHit = {
          lines: [...h.lines],
          first: { file, lineNumber: h.lineNumber },
          duplicates: [],
        }
        seen.set(key, entry)
        unique.push(entry)
      } else {
        seen.get(key)!.duplicates.push({ file, lineNumber: h.lineNumber })
      }
    }
  }

  const output: Output = { token, unique }
  const json = JSON.stringify(output, null, 2)
  console.log(json)

  // Also write an artifact under scripts/tokens for convenience
  try {
    const outDir = join('scripts', 'tokens')
    mkdirSync(outDir, { recursive: true })
    const label = files.length === 1 ? basename(files[0]) : `${files.length}-files`
    // Sanitize token for filename
    const safeToken = token.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 80)
    const outPath = join(outDir, `context-${safeToken}-${label}.json`)
    writeFileSync(outPath, json, 'utf8')
  } catch (err) {
    console.error('Failed to write context output under scripts/tokens')
    console.error(err)
    process.exitCode = 2
  }
}

main()
