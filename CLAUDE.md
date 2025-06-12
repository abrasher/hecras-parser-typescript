# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start Vite development server  
- `npm run build` - Build project (TypeScript compilation + Vite build)
- `npm run preview` - Preview built project
- `tsc` - Run TypeScript compiler for type checking

### Testing  
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:run` - Run tests once (CI mode)

### Code Quality
- `npm run format` - Format code with Prettier

## Architecture

This is a TypeScript library for parsing HEC-RAS geometry files (.g01, .g02, etc.) into structured data models.

### Core Components

**Main Parser**: `HECRASGeometryParser.ts` - The primary entry point that orchestrates parsing of HEC-RAS geometry files. Uses a line-by-line parsing approach with section detection.

**Modular Parsers**: `/src/parsers/` - Specialized parsers for different geometry sections:
- `headerParser.ts` - File metadata and viewing rectangles
- `reachParser.ts` - River reach data and coordinates  
- `crossSectionParser.ts` - Cross-section geometry and Manning coefficients
- `connectionParser.ts` - Storage area and lateral structure connections
- `storageAreaParser.ts` - Storage area definitions
- `lateralStructureParser.ts` - Lateral structure data
- `gisParser.ts` - GIS projection and mapping information

**Data Models**: `/src/models/` - TypeScript interfaces and classes representing HEC-RAS geometry entities:
- `geometry.ts` - Root geometry container
- `reach.ts` - River reach with cross-sections and coordinates
- `crossSection.ts` - Cross-section geometry, Manning values, and flow areas
- `connection.ts` - Various connection types (SA, lateral structure, etc.)
- `storageArea.ts` - Storage area definitions
- `common.ts` - Shared types like coordinates and Manning segments

### Parsing Strategy

The parser uses a stateful, line-by-line approach:
1. Detects section headers using keyword matching
2. Delegates to specialized parsers for each section type
3. Maintains parsing state with `currentIndex` to track position
4. Each parser advances the index and returns the new position

### Test Data

Test files use real HEC-RAS geometry data:
- `test/data/Muncie.g01` - Full geometry file for comprehensive testing
- `test/data/Dingman.g01` - Smaller geometry file optimized for LLM usage
- `test/data/connectionTestData.ts` - Expected data for connection parsing validation
- `test/data/muncieGeometryData.ts` - Expected data for Muncie geometry validation