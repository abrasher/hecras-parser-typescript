# Generate HEC-RAS Parser

Generate a complete parser implementation for a new HEC-RAS file type using the 7-step workflow.

## Usage

```
/generate-parser <file-path>
```

## Parameters

- `file-path`: Path to the HEC-RAS file to analyze and create a parser for

## Implementation

This command triggers the comprehensive HEC-RAS parser generation workflow defined in `/prompts/generate-parser-workflow.md`. The AI assistant will execute all 7 steps:

1. **Document Format**: Analyze file and create parsing specification
2. **Generate Models**: Create TypeScript interfaces
3. **Generate Tests**: Create comprehensive test suite
4. **Implement Parser**: Build parser using three-tier architecture
5. **Test Parser**: Validate implementation
6. **Implement Serializer**: Create reverse conversion
7. **Round-trip Test**: End-to-end validation

## Architecture

Follows established codebase patterns:

- **Atomic Level**: `src/parsers/atomic.ts`
- **Line Level**: `src/parsers/lineParsers.ts`
- **Component Level**: `src/parsers/geometry/[type]Parser.ts`
- **Models**: `src/models/geometry/[type].ts`
- **Tests**: Comprehensive coverage with real HEC-RAS data

## Example

```
/generate-parser data/sample.flow
```

This analyzes `data/sample.flow` and generates complete parser infrastructure.
