# Claude Code Commands for HEC-RAS Parser

This directory contains custom Claude Code commands for the HEC-RAS parser project.

## Available Commands

### `/generate-parser <file-path>`

Generate a complete parser implementation for a new HEC-RAS file type.

**Usage Example:**

```bash
/generate-parser test/data/Muncie.g01
```

**What it does:**

1. **Document Format**: Analyzes the file and creates precise parsing specifications
2. **Generate Models**: Creates TypeScript interfaces following codebase patterns
3. **Generate Tests**: Creates comprehensive test suite with edge cases
4. **Implement Parser**: Builds parser using three-tier architecture (atomic, line, component)
5. **Test Parser**: Validates implementation with generated tests
6. **Implement Serializer**: Creates reverse conversion functionality
7. **Round-trip Test**: End-to-end validation ensuring data integrity

**Output:**

- Format documentation in `/docs/`
- Model interfaces in `/src/models/geometry/`
- Parser implementation in `/src/parsers/geometry/`
- Test files in `/test/parsers/geometry/`
- Serializer in `/src/serializers/geometry/`
- Integration tests for round-trip validation

## Files Structure

```
.claude/
├── commands/
│   ├── generate-parser.md      # Command documentation
│   └── generate-parser.sh      # Shell script (optional)
├── prompts/
│   ├── generate-parser-workflow.md  # Detailed 7-step workflow
│   └── document-file-format.md      # Format documentation template
└── README.md                   # This file
```

## Architecture Integration

The workflow integrates with the existing codebase architecture:

- **Atomic Parsers**: Uses `src/parsers/atomic.ts` for basic field extraction
- **Line Parsers**: Leverages `src/parsers/lineParsers.ts` for common patterns
- **Component Parsers**: Creates specialized parsers in `src/parsers/geometry/`
- **Models**: Follows patterns from `src/models/geometry/`
- **Testing**: Comprehensive coverage with real HEC-RAS data

## Usage Tips

1. **Start with existing files**: Use files in `test/data/` to understand format patterns
2. **Reference documentation**: Check `/docs/hecras-parsing-format-specification.md` for format details
3. **Follow patterns**: The workflow automatically follows established codebase conventions
4. **Test thoroughly**: Each step includes validation to ensure correctness

## Examples

Generate parser for different HEC-RAS file types:

```bash
# Geometry files
/generate-parser test/data/Muncie.g01

# Flow files (if available)
/generate-parser data/sample.flow

# Plan files (if available)
/generate-parser data/sample.plan
```

The workflow is designed to handle any HEC-RAS file format by analyzing the structure and generating appropriate parsing infrastructure.
