### Development

- `npm run build` - Build project (TypeScript compilation + Vite build)
- `tsc` - Run TypeScript compiler for type checking

### Testing

- `npm test` - Run tests with Vitest
- `npm run test:run` - Run tests once (CI mode)

### Code Quality

- `npm run format` - Format code with Prettier
- `npm run lint` - Run ESLint for code linting
- `npm run lint:fix` - Run ESLint with automatic fixes

## Architecture

This is a TypeScript library for parsing HEC-RAS geometry files (.g01, .g02, etc.) into structured data models.

### Core Components

**Main Parser**: `parseGeometry` (from `/src/parseGeometry.ts`) - The main entry point for parsing HEC-RAS geometry files. Uses a simplified, direct parsing approach with specialized parsers for different geometry components.

**Atomic Parsers**: `/src/parsers/atomic.ts` - Low-level parsing primitives for extracting data from HEC-RAS file lines:

- Line parsing utilities
- Data type extraction functions
- Format-specific parsing helpers

**Line Parsers**: `/src/parsers/lineParsers.ts` - Higher-level line-based parsing utilities for common HEC-RAS patterns:

- `parseLineToCoordinates()` - Parse fixed-width coordinate data (16 chars per number)
- `parseLineStationPairs()` - Parse station pair data (8 chars per number)
- **Use these premade parsers when applicable** instead of reimplementing coordinate/station parsing logic

**Specialized Parsers**: `/src/parsers/geometry/` - Component-specific parsers:

- `culvertParser.ts` - Culvert connection parsing (modern implementation pattern)
- `bridgeParser.ts` - Bridge connection parsing
- `storageAreaParser.ts` - Storage area definitions
- `connectionParser.ts` - General connection parsing utilities

**Data Models**: `/src/models/` - TypeScript interfaces representing HEC-RAS geometry entities:

**Core Models**:

- `/src/models/geometry/geometryHeaders.ts` - Root geometry container and headers
- `/src/models/geometry/storageArea.ts` - Storage area definitions
- `/src/models/geometry/culvert.ts` - Comprehensive culvert connection interfaces with enums
- `/src/models/geometry/bridge.ts` - Bridge connection interfaces and components
- `/src/models/geometry/connection.ts` - General connection types
- `/src/models/geometry/common.ts` - Common geometry interfaces and utilities

### Parsing Strategy

**Modern Parsing Pattern**: Follow the conventions established in `/src/parsers/geometry/culvertParser.ts`:

- Use atomic parsing functions from `/src/parsers/atomic.ts`
- **Use premade line parsers from `/src/parsers/lineParsers.ts`** for coordinate/station data when applicable
- Implement structured parsing with clear data extraction phases
- Return both parsed data and parsing metadata (lines consumed, etc.)
- Use TypeScript interfaces for strong typing
- Include comprehensive error handling

**Atomic Parsing System**: The codebase uses a three-level parsing approach:

1. **Atomic Level** (`/src/parsers/atomic.ts`) - Low-level line parsing, data type extraction
2. **Line Level** (`/src/parsers/lineParsers.ts`) - Common line patterns (coordinates, station pairs) - **use these when applicable**
3. **Component Level** (`/src/parsers/geometry/`) - Higher-level component assembly using atomic and line functions

**Connection Types Supported**:

- **Culvert Connections** - Full implementation with detailed flow characteristics
- **Bridge Connections** - Comprehensive bridge geometry and hydraulic parameters
- **Storage Area Connections** - Storage area definitions and connections

## HEC-RAS Format Gotchas

**CRITICAL**: HEC-RAS files have strict but weird formatting that can break parsers if not handled carefully. Always use a combination of atomic or line parsers if possible. Do not duplicate functionality.

### Parsing Challenges

**Important Parsing Note**:

- Always use `wc -c` or similar commands to measure actual line widths instead of making assumptions about HEC-RAS format field widths. Use `cut -c` to verify field boundaries in fixed-width data.

### General Parsing Principles

Always assume the format is wrong until proven right. Use comprehensive validation and provide meaningful error messages for format inconsistencies.

## Core Philosophy

**PRAGMATIC PARSING IS THE PRIORITY.** This library focuses on correctly parsing complex engineering file formats where clarity, maintainability, and correctness take precedence over abstract programming principles. The code should be readable by engineers familiar with HEC-RAS formats.
