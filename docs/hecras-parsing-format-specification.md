# HEC-RAS File Format Parsing Documentation

## Core Parsing Architecture

The codebase uses a **three-tier parsing system**:

1. **Atomic Level** (`atomic.ts`) - Low-level field extraction
2. **Line Level** (`lineParsers.ts`) - Single line parsing patterns
3. **Component Level** (`geometry/*.ts`) - Multi-line component assembly

## Fixed-Width Field Parsing Formats

### Coordinate Data Format

**Field Layout**

```
Position:  1-16      17-32     33-48     49-64
Format:   [NNNNNNNN.NNNNNN][NNNNNNNN.NNNNNN][NNNNNNNN.NNNNNN][NNNNNNNN.NNNNNN]
```

**Parsing Rules**

- **Field Width**: 16 characters per coordinate value
- **Data Type**: Float with variable decimal places
- **Alignment**: Right-aligned, space-padded
- **Coordinates per Line**: 4 values max (2 coordinate pairs)
- **Line Width**: 64 characters maximum

**Implementation**: `parseLineToCoordinates()` in `lineParsers.ts:15`

### Station Pair Data Format

**Field Layout**

```
Position:  1-8      9-16     17-24    25-32    33-40
Format:   [NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN]
```

**Parsing Rules**

- **Field Width**: 8 characters per station value
- **Data Type**: Float with variable decimal places
- **Alignment**: Right-aligned, space-padded
- **Values per Line**: 10 values max (5 station pairs)
- **Line Width**: 80 characters maximum
- **Null Support**: Empty fields contain spaces, parsed as null

**Implementation**: `parseLineStationPairs()` in `lineParsers.ts:24`

### Bridge Deck Parameters Format

**Field Layout**

```
Position:  1-8      9-16     17-24    25-32    33-40    41-48    49-56    57-64    65-72    73-80
Format:   [NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN]
```

**Parsing Rules**

- **Field Width**: 8 characters per value
- **Values per Line**: 10 values maximum
- **Line Width**: 80 characters
- **Data Types**: Mixed floats and nulls for low chord elevations
- **Multi-section Format**: Stations, high chords, low chords in sequence

**Implementation**: `parseDeckParameters()` in `bridgeParser.ts:265`

## Key-Value Parsing Format

### Basic Key-Value Structure

```
Format: Key=Value
Example: Connection Culv=1,2.5,3.0,150.0,0.045,0.5,0.5,1,1,100.0,99.5,2,CULV01,0
```

**Parsing Rules**

- **Separator**: `=` character (configurable)
- **Value Processing**: Comma-separated values after `=`
- **String Handling**: Values trimmed of whitespace
- **Multi-value Support**: CSV parsing for complex data

**Implementation**: `parseKeyValue()` in `atomic.ts:14`

## Multi-Line Data Block Parsing

### Variable Length Blocks

**Parsing Pattern**

```markdown
Header Line: [Component Type]=[Count or Metadata]
Data Lines: [Fixed-width data based on count]
```

**Calculation Logic**

- **Lines Required**: `Math.ceil(totalEntries / entriesPerLine)`
- **Entries per Line**: `maxLineWidth / fieldWidth`
- **Index Management**: Tracks current position through multi-line blocks

**Implementation**: `parseMultilineArray()` in `multiLineParsers.ts:19`

## Critical Parsing Edge Cases

### Empty Field Handling

- **Numeric Fields**: Empty = spaces → parsed as `null` or skipped
- **String Fields**: Empty = spaces → trimmed to empty string
- **Boolean Fields**: Missing values default to `0` or `false`

### Number Format Variations

- **Decimal Points**: May be implicit (e.g., `123` = `1.23`)
- **Scientific Notation**: Rare but supported in atomic parsers
- **Negative Values**: Standard `-` prefix
- **Zero Padding**: Not used in HEC-RAS format

### Line Length Variations

- **Fixed Sections**: Bridge deck data = exactly 80 characters
- **Variable Sections**: Connection coordinates = up to 64 characters
- **Partial Lines**: Last line may be shorter than expected width

## Component-Specific Parsing Gotchas

### Culvert Connections (`culvertParser.ts`)

- **Barrel Count Calculation**: Header counts are derived from `barrelStations.length` (still emitted with 5 station pairs per line)
- **Station Pair Width**: 8 characters, 5 pairs per 80-character line
- **Coordinate Width**: 16 characters, 2 pairs per 64-character line
- **Optional Sections**: Barrel definitions may be missing entirely

### Bridge Connections (`bridgeParser.ts`)

- **Deck Section Parsing**: Stations → High Chords → Low Chords sequence
- **Null Handling**: Low chord elevations may contain null gaps
- **Multi-ID Sections**: Cross sections identified by ID (1=upstream, 2=downstream)
- **Pier Data**: Fixed 8-character width for width/elevation pairs

### Storage Areas (`storageAreaParser.ts`)

- **2D Points**: 16-character coordinates, 4 per 64-character line
- **Surface Line**: 16-character coordinates, 2 per 32-character line
- **Dynamic Properties**: Many optional fields based on storage area type

## Parsing Error Handling

### Validation Requirements

- **Field Width Validation**: Exact character position checking
- **Data Type Validation**: Number parsing with NaN detection
- **Range Validation**: Logical bounds checking for engineering values
- **Format Consistency**: Multi-line block integrity verification

### Error Recovery Strategies

- **Skip Invalid Lines**: Continue parsing valid sections
- **Default Value Assignment**: Use engineering defaults for missing data
- **Partial Data Acceptance**: Process incomplete but structurally valid blocks
- **Detailed Error Messages**: Include line numbers and field positions

This documentation captures the exact parsing requirements from the existing codebase, focusing on the character-level precision and format specifications needed for robust HEC-RAS file parsing.
