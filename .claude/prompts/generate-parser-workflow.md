# HEC-RAS Parser Generation Workflow

You are an expert HEC-RAS file format parser generator. Follow this exact 7-step workflow to create a complete parser implementation for a new HEC-RAS file type.

## Prerequisites

Before starting, you have access to:

- The target HEC-RAS file to analyze
- Existing codebase with parsing patterns in `/src/parsers/`
- Existing models in `/src/models/geometry/`
- Existing tests in `/test/` or similar
- Documentation at `/docs/hecras-parsing-format-specification.md`

## Workflow Steps

### Step 1: Document File Format Assumptions

**Objective**: Create precise parsing specification documentation

**Tasks**:

1. Analyze the target HEC-RAS file line by line
2. Use `wc -c` to measure actual line lengths
3. Use `cut -c` to verify field boundaries
4. Reference existing parsers for similar patterns
5. Document using the format specification template:

```markdown
# [File Type] Parsing Format

## Field Layout
```

Position: 1-8 9-16 17-24 25-32
Format: [NNNN.NN][NNNN.NN][SSSSSS][III]

```

## Parsing Rules
- **Field specifications with exact positions**
- **Data types and alignment rules**
- **Multi-line patterns and calculations**

## Critical Parsing Notes
- **Edge cases and gotchas**
- **Empty field handling**
- **Format variations**
```

**Deliverable**: Markdown documentation file in `/docs/`

### Step 2: Generate Model Files

**Objective**: Create TypeScript interfaces for the new file type

**Tasks**:

1. Analyze documented format to identify data structures
2. Create interfaces in `/src/models/geometry/[fileType].ts`
3. Follow existing model patterns from similar geometry types
4. Include:
   - Main data interface
   - Sub-component interfaces
   - Enum types for coded values
   - Union types for optional fields

**Reference Patterns**:

- `/src/models/geometry/culvert.ts` - Complex nested structures
- `/src/models/geometry/bridge.ts` - Multiple components
- `/src/models/geometry/storageArea.ts` - Optional properties

**Deliverable**: TypeScript model file with comprehensive interfaces

### Step 3: Generate Test Cases

**Objective**: Create comprehensive test suite for the new parser

**Tasks**:

1. Create test file in `/test/parsers/geometry/[fileType]Parser.test.ts`
2. Generate test cases covering:
   - Basic parsing functionality
   - Edge cases (empty fields, nulls, boundaries)
   - Error conditions
   - Multi-line data blocks
   - Optional components
3. Include sample HEC-RAS data strings for testing
4. Follow existing test patterns from similar parsers

**Reference Patterns**:

- Existing test files in `/test/` directory
- Test data setup and assertion patterns
- Error handling test cases

**Deliverable**: Comprehensive test file with sample data

### Step 4: Implement Parser

**Objective**: Build the parser using established architectural patterns

**Tasks**:

1. Create parser file in `/src/parsers/geometry/[fileType]Parser.ts`
2. Follow three-tier architecture:
   - Use atomic parsers from `/src/parsers/atomic.ts`
   - Use line parsers from `/src/parsers/lineParsers.ts` when applicable
   - Implement component-level logic
3. Follow modern parsing pattern from `/src/parsers/geometry/culvertParser.ts`:
   - Structured parsing phases
   - Return parsed data + metadata
   - Comprehensive error handling
4. Handle multi-line data blocks correctly
5. Implement proper index tracking

**Architecture Requirements**:

- Use `parseKeyValue()`, `parseCommaSeparated()` from atomic
- Use `parseLineToCoordinates()`, `parseLineStationPairs()` when applicable
- Use `parseMultilineArray()` for complex data blocks
- Return `{data: ParsedType, nextIndex: number}` pattern

**Deliverable**: Fully implemented parser with proper error handling

### Step 5: Run Parser Tests

**Objective**: Validate parser implementation

**Tasks**:

1. Run the generated test suite
2. Fix any failing tests
3. Add additional test cases for discovered edge cases
4. Ensure 100% test coverage for critical parsing paths
5. Validate against actual HEC-RAS file data

**Commands**:

- `npm test` - Run full test suite
- `npm test -- [fileType]Parser` - Run specific parser tests

**Deliverable**: Passing test suite with comprehensive coverage

### Step 6: Implement Serializer

**Objective**: Create serializer to convert parsed data back to HEC-RAS format

**Tasks**:

1. Create serializer file in `/src/serializers/geometry/[fileType]Serializer.ts`
2. Implement functions to convert parsed models back to HEC-RAS string format
3. Follow exact formatting requirements from Step 1 documentation
4. Handle:
   - Fixed-width field formatting
   - Number precision and alignment
   - Multi-line data block reconstruction
   - Key-value pair formatting
5. Create serializer tests in `/test/serializers/geometry/[fileType]Serializer.test.ts`

**Formatting Requirements**:

- Match original field widths exactly
- Preserve number formatting (decimal places, alignment)
- Handle null/empty field serialization correctly
- Maintain line length constraints

**Deliverable**: Working serializer with passing tests

### Step 7: Round-Trip Testing

**Objective**: Implement end-to-end validation

**Tasks**:

1. Create round-trip test in `/test/integration/[fileType]RoundTrip.test.ts`
2. Implement test that:
   - Reads original HEC-RAS file
   - Parses it using new parser
   - Serializes parsed data back to string
   - Compares serialized result with original
3. Handle acceptable differences:
   - Whitespace normalization
   - Number precision differences
   - Optional field ordering
4. Ensure semantic equivalence of parsed/serialized data

**Test Structure**:

```typescript
test("round-trip parsing preserves data integrity", () => {
  const originalFile = fs.readFileSync("path/to/file.hecras", "utf8")
  const parsed = parseFile(originalFile)
  const serialized = serializeFile(parsed)

  // Compare semantic equivalence
  expect(normalize(serialized)).toEqual(normalize(originalFile))
})
```

**Deliverable**: Passing round-trip test demonstrating data integrity

## Workflow Execution Notes

1. **Always start with Step 1** - proper documentation is critical
2. **Use existing patterns** - reference similar components in codebase
3. **Test incrementally** - run tests after each implementation step
4. **Focus on precision** - HEC-RAS formats are strict and unforgiving
5. **Handle errors gracefully** - provide meaningful error messages
6. **Document assumptions** - capture any format ambiguities discovered

## Success Criteria

✅ Complete format documentation with exact field specifications
✅ Comprehensive TypeScript models following codebase patterns  
✅ Full test suite with edge case coverage
✅ Working parser using three-tier architecture
✅ All parser tests passing
✅ Working serializer with format precision
✅ Passing round-trip test demonstrating data integrity

The workflow is complete when a HEC-RAS file can be parsed, manipulated as structured data, serialized back to the original format, and the result is semantically equivalent to the input.
