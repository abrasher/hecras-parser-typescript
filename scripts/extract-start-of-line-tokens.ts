import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { basename, join } from 'node:path'

type Result = {
  file: string
  tokens: Record<string, number>
  emptyLineNumbers: number[]
  emptyLineCount: number
  tokensSequence: string[]
}

function isAlpha(char: string): boolean {
  return /[A-Za-z]/.test(char)
}

function firstNonSpaceChar(s: string): string | undefined {
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c !== ' ' && c !== '\t') return c
  }
  return undefined
}

function extractTokens(content: string, fileLabel: string): Result {
  const lines = content.split(/\r?\n/)
  const counts = new Map<string, number>()
  const emptyLineNumbers: number[] = []
  const tokensSequence: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1
    const raw = lines[i]

    // Empty line: no characters at all
    if (raw.length === 0) {
      emptyLineNumbers.push(lineNo)
      continue
    }

    // Ignore whitespace-only lines
    const ltrimmed = raw.replace(/^\s+/, '')
    if (ltrimmed.length === 0) {
      continue
    }

    // Ignore lines where first non-space character is a digit
    const first = firstNonSpaceChar(raw)
    if (first && /[0-9]/.test(first)) {
      continue
    }

    // Determine token
    const work = ltrimmed
    let token: string | undefined

    const eqIdx = work.indexOf('=')
    if (eqIdx !== -1) {
      token = work.slice(0, eqIdx).replace(/\s+$/, '') // trim trailing space before '='
    } else {
      // No equals: token is entire line if it begins with alphabetic text
      const firstChar = work[0]
      if (!isAlpha(firstChar)) {
        continue
      }
      token = work
    }

    if (!token) continue

    // Normalize internal whitespace sequences to single space for stability
    // but preserve punctuation like ':'
    token = token.replace(/\s+/g, ' ')

    const prev = counts.get(token) ?? 0
    counts.set(token, prev + 1)
    tokensSequence.push(token)
  }

  // Convert Map to plain object
  const tokens: Record<string, number> = {}
  for (const [k, v] of counts) tokens[k] = v

  return {
    file: fileLabel,
    tokens,
    emptyLineNumbers,
    emptyLineCount: emptyLineNumbers.length,
    tokensSequence,
  }
}

function main() {
  const [, , filePath] = process.argv
  if (!filePath) {
    console.error('Usage: tsx scripts/extract-start-of-line-tokens.ts <path-to-text-file>')
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

  const result = extractTokens(content, basename(filePath))
  // Preserve discovery order (no sorting)
  // Stdout: preserve prior shape (no sequence array)
  const display = {
    file: result.file,
    tokens: result.tokens,
    emptyLineNumbers: result.emptyLineNumbers,
    emptyLineCount: result.emptyLineCount,
  }
  const json = JSON.stringify(display, null, 2)
  console.log(json)

  // Also write to scripts/tokens/tokens-<INPUTFILENAME.EXT>.json
  try {
    const outDir = join('scripts', 'tokens')
    mkdirSync(outDir, { recursive: true })
    const base = basename(filePath) // includes original extension, e.g., Dingman.g01
    const outPath = join(outDir, `tokens-${base}.json`)
    writeFileSync(outPath, json, 'utf8')

    // Also write the ordered keys (with duplicates) file
    const keysOutPath = join(outDir, `tokens-${base}.keys.json`)
    const keysJson = JSON.stringify(
      { file: result.file, keys: result.tokensSequence },
      null,
      2
    )
    writeFileSync(keysOutPath, keysJson, 'utf8')
  } catch (err) {
    console.error('Failed to write output JSON file in scripts/tokens')
    console.error(err)
    process.exitCode = 2
  }
}

main()
