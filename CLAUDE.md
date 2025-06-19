\*\*\*\*# CLAUDE.md

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

### Examples

- `npm run example:dingman` - Run example parser on Dingman test file

## Architecture

This is a TypeScript library for parsing HEC-RAS geometry files (.g01, .g02, etc.) into structured data models.

### Core Components

**Main Parser**: `HECRASParser` (from `/src/core/plugins.ts`) - The plugin-based parser architecture that provides extensibility and validation. Built on the core plugin system with modular file type support.

**Modular Parsers**: `/src/parsers/` - Specialized parsers for different geometry sections:

- `headerParser.ts` - File metadata and viewing rectangles
- `reachParser.ts` - River reach data and coordinates
- `crossSectionParser.ts` - Cross-section geometry and Manning coefficients
- `connectionParser.ts` - Storage area and lateral structure connections
- `storageAreaParser.ts` - Storage area definitions
- `lateralStructureParser.ts` - Lateral structure data
- `gisParser.ts` - GIS projection and mapping information

**Core Architecture**: `/src/core/` - Plugin-based parsing system with validation and model building:

- `plugins.ts` - Plugin system and registry for file type parsers
- `pipeline.ts` - Parsing pipeline orchestration and context management
- `tokenizer.ts` - Token parsing and configuration for different file formats
- `validator.ts` - Data validation schemas and error handling
- `modelBuilder.ts` - Model building and mapping from parsed data
- `primitives.ts` - Core parsing primitives and utilities
- `sectionConfig.ts` - Section configuration and detection

**Parser Plugins**: `/src/plugins/` - Modular parsers for different file types:

- `geometryPlugin.ts` - Geometry file parsing plugin with validation

**Data Models**: `/src/models/` - TypeScript interfaces and classes representing HEC-RAS geometry entities:

- `geometry.ts` - Root geometry container
- `reach.ts` - River reach with cross-sections and coordinates
- `crossSection.ts` - Cross-section geometry, Manning values, and flow areas
- `connection.ts` - Various connection types (SA, lateral structure, etc.)
- `storageArea.ts` - Storage area definitions
- `ineffectiveFlowArea.ts` - Ineffective flow area definitions
- `common.ts` - Shared types like coordinates and Manning segments

### Parsing Strategy

The parsing strategy should be based on the conventions in @src/parsers/culvertParser.ts
Other parsers in the project follow a different legacy approach that should not be used

### Examples

Example scripts demonstrating parser usage:

- `examples/parse-dingman.ts` - Basic geometry parsing example
- `examples/debug-parser.ts` - Parser debugging utilities
- `examples/debug-storage-areas.ts` - Storage area parsing diagnostics

### Test Data

Test files use real HEC-RAS geometry data:

- `test/data/Muncie.g01` - Full geometry file for comprehensive testing
- `test/data/Dingman.g01` - Smaller geometry file optimized for LLM usage
- `test/data/connectionTestData.ts` - Expected data for connection parsing validation
- `test/data/muncieGeometryData.ts` - Expected data for Muncie geometry validation

Test suites:

- `test/HECRASParser.test.ts` - Main parser tests with validation
- `test/GeometryParser.test.ts` - Geometry parsing tests
- `test/ConnectionParsing.test.ts` - Connection parsing tests

## HEC-RAS Format Gotchas

**CRITICAL**: HEC-RAS files have inconsistent formatting that can break parsers if not handled carefully. See `docs/hecras-file-format-notes.md` for detailed format specification.

### Key Parsing Challenges

**Fixed-Width vs Variable-Width Fields**:

- Some fields are fixed-width (usually powers of 2: 2,4,8,16,32 characters)
- Others are variable-width with limits
- Fixed-width fields MUST preserve exact spacing, even if it looks wrong
- Example: `Storage Area=2D_Grid         ,,` (note the trailing spaces)

**Inconsistent Key Formats**:

- Most keys are "Key=Value" format with sentence case
- Some mix spaces: `Storage Area 2D PointsPerimeterTime=21May2025 13:18:09`
- Some use colons for nesting: `Conn BR: BR SE=1,0`
- Snake_case occasionally appears: `Is_Ogee`

**Multiline Value Parsing**:

- Values can span multiple lines unpredictably
- First line often indicates count: `Storage Area Surface Line= 6`
- Subsequent lines have no consistent spacing rules

**Table-Like Data**:

- Some sections store data in pseudo-table format with no clear delimiters
- Values may be space-separated but with inconsistent spacing
- Headers don't always align with data columns

**Long Text Fields**:

- Surrounded by `BEGIN PROPERTYNAME:` and `END PROPERTYNAME:` blocks
- Can contain multiple lines and special characters
- No apparent length limits

### Parsing Strategy

Always assume the format is wrong until proven right. The parser uses validation schemas to catch format inconsistencies early and provide meaningful error messages.

## Important things when Developming Parsers

When writing parsing logic, populate an adjacent documentation file in the docs folder. The document will be used to reconstruct the geometry file at a later date.

It should at minimum list for each property

- Original Key Name in the HECRAS file
- Key Object Path it is mapped to
- The type of value / parsing logic required to extract it
- Any special notes such as field lengths or other quirks
- An example input and example output
