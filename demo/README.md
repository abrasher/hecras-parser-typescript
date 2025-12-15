# HEC-RAS Parser Demo

Interactive demo for the hecras-parser library. Parse, edit, and export HEC-RAS plan files.

## Features

- **Load Files**: Select from example files or upload your own HEC-RAS plan files (.p01-.p06)
- **Edit Data**:
  - Quick edit for simulation title
  - Full JSON editor for all parsed data
- **Export**: Download modified plan files
- **Diff Viewer**: Side-by-side comparison of original vs modified files

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Adding Example Files

1. Copy example files to `public/examples/`
2. Add entries to the `EXAMPLES` array in `src/App.tsx`:

```typescript
const EXAMPLES = [
  { name: 'BaldEagleDamBrk.p06', path: '/examples/BaldEagleDamBrk.p06' },
  { name: 'YourExample.p01', path: '/examples/YourExample.p01' },
]
```

## Tech Stack

- React 19 + TypeScript
- Vite for build tooling
- @microlink/react-json-view for JSON editing
- react-diff-viewer-continued for diff display
- hecras-parser (local package)

## Notes

- The demo uses the local `hecras-parser` package via `file:../` reference
- Any changes to the parent parser library require rebuilding the parent (`npm run build` in root)
- Uses `--legacy-peer-deps` due to React 19 compatibility with some dependencies
