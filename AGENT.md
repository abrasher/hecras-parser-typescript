# AGENT.md - HEC-RAS Parser TypeScript
This is a framework for parsing HECRAS files. Currently it supports some of geometry (.g0x files)

## Build/Test/Lint Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build project (TypeScript compilation + Vite build)
- `npm run preview` - Preview built project
- `tsc` - Run TypeScript compiler directly for type checking
- No test framework configured currently

## Architecture & Structure

- **Core Parser**: `HECRASGeometryParser.ts` - main parsing logic
- **Generator**: `HECRASGeometryGenerator.ts` - file generation/recreation
- **Models**: `/src/models/` - TypeScript interfaces for geometry data structures
  - `geometry.ts`, `reach.ts`, `crossSection.ts`, `connection.ts`, `storageArea.ts`, etc.
- **Utils**: `utils.ts` - parsing helper functions
- **Entry**: `main.ts` - DOM manipulation and file handling logic

## Code Style & Conventions

- ES2020+ target, ESNext modules, strict TypeScript mode
- Import style: `import type` for types, named imports preferred
- Naming: PascalCase for classes, camelCase for variables/functions
- Error handling: try/catch blocks with Error type checking
- File structure: models in separate files, utilities extracted
- Comments: Single-line `//` style, minimal inline documentation
