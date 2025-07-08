# HEC-RAS Geometry Serialization Implementation Plan

## Overview

Implement exact-format serialization for HEC-RAS geometry files using a bottom-up, behavior-driven development approach. The serializer will produce output that matches the original input format exactly (spacing, line breaks, field ordering).

## Implementation Strategy

### Phase 1: Foundation - Atomic Serializers

**Goal**: Create low-level formatting utilities that mirror the atomic parsers

**Components**:

- `src/serializers/atomic.ts` - Low-level formatting functions
  - `formatKeyValue(key: string, value: string | number | undefined): string`
  - `formatCoordinates(coords: Coordinate[]): string[]` - 16-char fixed-width per number
  - `formatStationPairs(stations: number[]): string[]` - 8-char fixed-width per number
  - `formatFixedWidth(value: number | string, width: number): string`
  - `formatDescriptionBlock(description: string): string[]` - BEGIN/END blocks

**Testing**: Unit tests for each atomic function with exact format validation

### Phase 2: Component Serializers (Bottom-Up BDD)

#### 2.1 Culvert Serializer

**File**: `src/serializers/geometry/culvertSerializer.ts`
**Target**: `CulvertGroupProperties` interface from `src/models/geometry/culvert.ts`

**BDD Tests**:

- GIVEN a culvert with basic properties WHEN serialized THEN produces valid culvert section
- GIVEN a culvert with barrel stations WHEN serialized THEN formats station pairs correctly
- GIVEN a culvert with coordinates WHEN serialized THEN formats coordinate lines correctly
- GIVEN a culvert with undefined optional fields WHEN serialized THEN omits those lines
- GIVEN a culvert with null fields WHEN serialized THEN outputs blank spacing

**Key Format Requirements**:

- Culvert group headers: `Culvert Group=N`
- Barrel properties: Fixed-width formatting for dimensions
- Station data: 8-character fixed-width fields
- Coordinate data: 16-character fixed-width fields

#### 2.2 Bridge Serializer

**File**: `src/serializers/geometry/bridgeSerializer.ts`
**Target**: `BridgeConnection` interface from `src/models/geometry/bridge.ts`

**BDD Tests**:

- GIVEN a bridge with deck parameters WHEN serialized THEN formats deck section correctly
- GIVEN a bridge with cross-sections WHEN serialized THEN formats cross-section data
- GIVEN a bridge with pier data WHEN serialized THEN formats pier coordinates
- GIVEN a bridge with approach sections WHEN serialized THEN formats approach data

**Key Format Requirements**:

- Bridge headers and deck parameters
- Cross-section coordinate formatting
- Pier and approach section formatting

#### 2.3 Connection Serializer

**File**: `src/serializers/geometry/connectionSerializer.ts`
**Target**: `Connection` interface from `src/models/geometry/connection.ts`

**BDD Tests**:

- GIVEN a connection with basic properties WHEN serialized THEN formats connection header
- GIVEN a connection with culvert data WHEN serialized THEN delegates to culvert serializer
- GIVEN a connection with bridge data WHEN serialized THEN delegates to bridge serializer
- GIVEN a connection with storage area links WHEN serialized THEN formats storage area references

**Key Format Requirements**:

- Connection headers: `Connection Name=value`
- Storage area references: `Upstream Storage Area=value`
- Coordinate line formatting: Connection line coordinates

#### 2.4 Storage Area Serializer

**File**: `src/serializers/geometry/storageAreaSerializer.ts`
**Target**: `StorageArea` interface from `src/models/geometry/storageArea.ts`

**BDD Tests**:

- GIVEN a storage area with basic properties WHEN serialized THEN formats header section
- GIVEN a storage area with surface line WHEN serialized THEN formats coordinate array
- GIVEN a storage area with 2D points WHEN serialized THEN formats 2D point data
- GIVEN a storage area with volume elevation data WHEN serialized THEN formats volume table

**Key Format Requirements**:

- Storage area headers: `Storage Area Name=value`
- Surface line coordinates: Counted array format
- 2D point data: Fixed-width coordinate formatting
- Volume elevation tables: Station-elevation pairs

#### 2.5 Boundary Condition Serializer

**File**: `src/serializers/geometry/boundaryConditionSerializer.ts`
**Target**: `BoundaryCondition` interface from `src/models/geometry/common.ts`

**BDD Tests**:

- GIVEN a boundary condition with position data WHEN serialized THEN formats position coordinates
- GIVEN a boundary condition with arc data WHEN serialized THEN formats arc coordinates
- GIVEN a boundary condition with text positioning WHEN serialized THEN formats text position

**Key Format Requirements**:

- Position coordinate formatting
- Arc coordinate arrays
- Text positioning data

#### 2.6 Geometry Header Serializer

**File**: `src/serializers/geometry/geometryHeaderSerializer.ts`
**Target**: `HECRASGeometry` header fields from `src/models/geometry/geometryHeaders.ts`

**BDD Tests**:

- GIVEN geometry with title and version WHEN serialized THEN formats header section
- GIVEN geometry with viewing rectangle WHEN serialized THEN formats viewing rectangle
- GIVEN geometry with description WHEN serialized THEN formats description block

**Key Format Requirements**:

- Geometry title and program version
- Viewing rectangle coordinates
- Description BEGIN/END blocks

### Phase 3: Main Serializer Integration

#### 3.1 Main Serializer Function

**File**: `src/serializers/geometrySerializer.ts`
**Function**: `serializeGeometry(geometry: HECRASGeometry): string`

**BDD Tests**:

- GIVEN a complete geometry object WHEN serialized THEN produces valid HEC-RAS file
- GIVEN geometry with mixed component types WHEN serialized THEN maintains correct ordering
- GIVEN geometry with optional sections WHEN serialized THEN handles undefined sections correctly

**Integration Logic**:

1. Serialize header section (title, version, viewing rectangle)
2. Serialize description block if present
3. Serialize storage areas in order
4. Serialize connections in order
5. Serialize boundary conditions in order
6. Combine all sections with proper line breaks

#### 3.2 Individual Component Access

**File**: `src/serializers/index.ts`
**Exports**: Individual serializer functions for direct use

**Functions**:

- `serializeCulvert(culvert: CulvertGroupProperties): string`
- `serializeBridge(bridge: BridgeConnection): string`
- `serializeConnection(connection: Connection): string`
- `serializeStorageArea(storageArea: StorageArea): string`
- `serializeBoundaryCondition(bc: BoundaryCondition): string`

### Phase 4: Testing Strategy

#### 4.1 Unit Tests

**Location**: `src/serializers/__tests__/`
**Coverage**: Each serializer component with BDD-style tests

**Test Structure**:

```typescript
describe("CulvertSerializer", () => {
  describe("GIVEN a culvert with basic properties", () => {
    it("WHEN serialized THEN produces valid culvert section", () => {
      // Test implementation
    })
  })
})
```

#### 4.2 Integration Tests

**Location**: `src/serializers/__tests__/integration/`
**Coverage**: Round-trip testing (parse → serialize → parse)

**Test Cases**:

- Load existing HEC-RAS files
- Parse using existing parsers
- Serialize using new serializers
- Parse serialized output
- Compare original vs round-trip parsed data

#### 4.3 Format Validation Tests

**Location**: `src/serializers/__tests__/format/`
**Coverage**: Exact format compliance

**Test Cases**:

- Line-by-line comparison with known good files
- Field width validation
- Spacing and alignment verification
- Line ending consistency

### Phase 5: Documentation and Examples

#### 5.1 API Documentation

**File**: `src/serializers/README.md`
**Content**: Usage examples, API reference, format specifications

#### 5.2 Examples

**File**: `examples/serialization/`
**Content**: Working examples showing serialization usage

## Implementation Order

1. **Foundation**: Atomic serializers and utilities
2. **Bottom-Up Components**: Culvert → Bridge → Connection → Storage Area → Boundary Condition
3. **Integration**: Main geometry serializer
4. **Testing**: Comprehensive BDD tests for each component
5. **Validation**: Round-trip and format compliance testing
6. **Documentation**: API docs and examples

## Success Criteria

- ✅ All BDD tests pass
- ✅ Round-trip testing maintains data integrity
- ✅ Serialized output matches original format exactly
- ✅ Individual component serializers work independently
- ✅ Main serializer handles complete geometry objects
- ✅ Null fields produce blank spacing, undefined fields are omitted
- ✅ External HEC-RAS programs can read serialized output

## Technical Considerations

- **Exact Format Matching**: Use existing parsing utilities as reference for format specifications
- **Performance**: Optimize for correctness over speed
- **Error Handling**: Assume valid input, focus on format compliance
- **Maintainability**: Mirror existing parser structure for consistency
- **Testing**: Comprehensive BDD coverage with real-world HEC-RAS files
