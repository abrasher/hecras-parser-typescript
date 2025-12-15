import { useState, useRef, useEffect } from 'react'
import ReactJson from '@microlink/react-json-view'
import ReactDiffViewer from 'react-diff-viewer-continued'
import { parsePlan, serializePlan } from 'hecras-parser'
import { CollapsibleSection } from './components/CollapsibleSection'
import './App.css'

const EXAMPLES = [
  { name: 'BaldEagleDamBrk.p06', path: '/examples/BaldEagleDamBrk.p06' },
]

function usePrefersDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setIsDark(e.matches)
    media.addEventListener?.('change', onChange)
    media.addListener?.(onChange)
    return () => {
      media.removeEventListener?.('change', onChange)
      media.removeListener?.(onChange)
    }
  }, [])

  return isDark
}

const BOOLEAN_LIKE_VALUES = new Set(
  [
    '-1',
    '0',
    '1',
    '10',
    '01',
    't',
    'f',
    'true',
    'false',
    'y',
    'n',
    'yes',
    'no',
    'on',
    'off',
    'enable',
    'disable',
  ].map((value) => value.toLowerCase()),
)

function isBooleanToken(token: string) {
  if (!token) return false
  return BOOLEAN_LIKE_VALUES.has(token.toLowerCase())
}

function linesEquivalent(originalLine: string, serializedLine: string) {
  if (originalLine === serializedLine) return true

  const originalEquals = originalLine.indexOf('=')
  const serializedEquals = serializedLine.indexOf('=')
  if (originalEquals === -1 || serializedEquals === -1) return false

  const originalKey = originalLine.slice(0, originalEquals).trim()
  const serializedKey = serializedLine.slice(0, serializedEquals).trim()
  if (originalKey !== serializedKey) return false

  const originalValue = originalLine.slice(originalEquals + 1)
  const serializedValue = serializedLine.slice(serializedEquals + 1)
  if (!originalValue.includes(',') || !serializedValue.includes(',')) return false

  const originalTokens = originalValue.split(',').map((segment) => segment.trim())
  const serializedTokens = serializedValue.split(',').map((segment) => segment.trim())
  if (originalTokens.length !== serializedTokens.length) return false
  if (!originalTokens.every((token, index) => token === serializedTokens[index])) return false

  const originalBooleanTokens = originalTokens.slice(1)
  const serializedBooleanTokens = serializedTokens.slice(1)
  if (originalBooleanTokens.length === 0 || serializedBooleanTokens.length === 0) return false
  if (!originalBooleanTokens.every(isBooleanToken)) return false
  if (!serializedBooleanTokens.every(isBooleanToken)) return false

  return true
}

function findDiffIndex(a: string, b: string) {
  const maxLength = Math.max(a.length, b.length)
  for (let i = 0; i < maxLength; i++) {
    if (a[i] !== b[i]) return i
  }
  return -1
}

function App() {
  const [originalContent, setOriginalContent] = useState<string>('')
  const [parsedData, setParsedData] = useState<any>(null)
  const [editedData, setEditedData] = useState<any>(null)
  const [title, setTitle] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const prefersDarkMode = usePrefersDarkMode()

  useEffect(() => {
    const example = EXAMPLES[0]
    if (!example) return

    ;(async () => {
      try {
        const response = await fetch(example.path)
        const text = await response.text()
        const normalizedOriginal = text.replace(/\r\n/g, '\n')
        const originalLines = normalizedOriginal.split('\n')
        const parsed = parsePlan(text)
        const serialized = serializePlan(parsed).replace(/\r\n/g, '\n')
        const serializedLines = serialized.split('\n')

        const maxLines = Math.max(originalLines.length, serializedLines.length)
        let firstDiff: { line: number; original: string; serialized: string; index: number } | null =
          null
        for (let i = 0; i < maxLines; i++) {
          const originalLine = originalLines[i] || ''
          const serializedLine = serializedLines[i] || ''
          if (!linesEquivalent(originalLine, serializedLine)) {
            firstDiff = {
              line: i + 1,
              original: originalLine,
              serialized: serializedLine,
              index: findDiffIndex(originalLine, serializedLine),
            }
            break
          }
        }

        if (!firstDiff) {
          console.info(
            `[compare-example] ${example.name}: match (${originalLines.length} lines)`,
          )
          return
        }

        console.groupCollapsed(
          `[compare-example] ${example.name}: first diff at line ${firstDiff.line}`,
        )
        console.log('Original:', firstDiff.original)
        console.log('Serialized:', firstDiff.serialized)
        if (firstDiff.index >= 0) {
          console.log('Diff index:', firstDiff.index)
        }
        console.groupEnd()
      } catch (error) {
        console.error('[compare-example] failed:', error)
      }
    })()
  }, [])

  const loadExample = async (path: string) => {
    try {
      const response = await fetch(path)
      const text = await response.text()
      loadFile(text)
    } catch (error) {
      console.error('Failed to load example:', error)
      alert('Failed to load example file')
    }
  }

  const loadFile = (content: string) => {
    setOriginalContent(content)
    try {
      const parsed = parsePlan(content)

      const serialized = serializePlan(parsed)

      if (serialized !== content) {
        console.warn('Serialized content does not match original')
      }
      setParsedData(parsed)
      setEditedData(JSON.parse(JSON.stringify(parsed))) // Deep clone
      setTitle(parsed.simulationTitle || '')
    } catch (error) {
      console.error('Parse error:', error)
      alert('Failed to parse file: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        loadFile(content)
      }
      reader.readAsText(file)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    setEditedData({ ...editedData, simulationTitle: newTitle })
  }

  const handleJsonEdit = (edit: any) => {
    setEditedData(edit.updated_src)
    // Update title if it was changed via JSON editor
    if (edit.updated_src.simulationTitle !== title) {
      setTitle(edit.updated_src.simulationTitle || '')
    }
  }

  const exportFile = () => {
    try {
      const serialized = serializePlan(editedData)
      const blob = new Blob([serialized], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'edited-plan.p06'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Serialization error:', error)
      alert('Failed to serialize file: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const getSerializedOutput = () => {
    try {
      return serializePlan(editedData)
    } catch (error) {
      return `Error serializing: ${error instanceof Error ? error.message : String(error)}`
    }
  }

  // Normalize line breaks only for diff comparison
  const normalizeForDiff = (content: string) => {
    return content.replace(/\r\n/g, '\n')
  }

  return (
    <div className="app">
      <header>
        <h1>HEC-RAS Parser Demo</h1>
        <p>Parse, edit, and export HEC-RAS plan files</p>
      </header>

      <main>
        <CollapsibleSection title="1. Load File">
          <div className="load-section">
            <div className="load-option">
              <label htmlFor="example-select">Load Example:</label>
              <select
                id="example-select"
                onChange={(e) => loadExample(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Select an example...</option>
                {EXAMPLES.map((ex) => (
                  <option key={ex.path} value={ex.path}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="load-option">
              <label>Or Upload File:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".p06,.p01,.p02,.p03,.p04,.p05"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </CollapsibleSection>

        {parsedData && (
          <>
            <CollapsibleSection title="2. Edit Data">
              <div className="edit-section">
                <div className="title-edit">
                  <label htmlFor="title-input">Simulation Title:</label>
                  <input
                    id="title-input"
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter simulation title"
                  />
                </div>

                <div className="json-editor">
                  <h3>JSON Editor</h3>
                  <ReactJson
                    src={editedData}
                    onEdit={handleJsonEdit}
                    onAdd={handleJsonEdit}
                    onDelete={handleJsonEdit}
                    theme={prefersDarkMode ? 'monokai' : 'bright'}
                    displayDataTypes={false}
                    enableClipboard={true}
                    collapsed={2}
                  />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="3. View Output">
              <div className="output-section">
                <button onClick={exportFile} className="export-button">
                  Export .p06 File
                </button>

                <div className="diff-viewer">
                  <h3>Diff: Original vs Modified</h3>
                  <ReactDiffViewer
                    oldValue={normalizeForDiff(originalContent)}
                    newValue={normalizeForDiff(getSerializedOutput())}
                    splitView={true}
                    leftTitle="Original"
                    rightTitle="Modified"
                    showDiffOnly={false}
                  />
                </div>
              </div>
            </CollapsibleSection>
          </>
        )}

        {!parsedData && (
          <div className="placeholder">
            <p>👆 Load an example file or upload your own to get started</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
