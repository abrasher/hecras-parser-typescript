# Safe Serialization Migration Guide

## Problem

The codebase has 40+ instances of `lines.push(...array)` that can cause **stack overflow** with large arrays (>~10,000 elements). This happened with Dingman 2D.g01 which has 145,136 lines in its storage area.

## Solution

Use safe array utilities from `src/serializers/utils/safeArrayUtils.ts` instead of spread operators.

## Migration Pattern

### BEFORE (Unsafe - Can cause stack overflow):

```typescript
export function serializeSomeComponent(data: SomeData): string[] {
  const lines: string[] = []

  // These can cause stack overflow with large arrays:
  lines.push(...serializeSubComponent(data.subData))
  lines.push(...otherLines)

  return lines
}
```

### AFTER (Safe):

```typescript
import { appendLines } from "../utils/safeArrayUtils"

export function serializeSomeComponent(data: SomeData): string[] {
  const lines: string[] = []

  // These are safe with any array size:
  appendLines(lines, serializeSubComponent(data.subData))
  appendLines(lines, otherLines)

  return lines
}
```

## Files that Need Migration

Based on grep analysis, these files have unsafe `lines.push(...` patterns:

### High Priority (Serializers):

- `src/serializers/geometry/connectionSerializer.ts` - 5 instances
- `src/serializers/geometry/boundaryConditionSerializer.ts` - 1 instance
- `src/serializers/geometry/bridgeSerializer.ts` - 12 instances
- `src/serializers/geometry/riverReachSerializer.ts` - 5 instances
- `src/serializers/geometry/culvertSerializer.ts` - 2 instances
- `src/serializers/geometry/geometryHeaderSerializer.ts` - 1 instance

### Medium Priority (Parsers - less likely to hit limits):

- Parser files also use spread operators but typically with smaller arrays

## Alternative Approaches

### 1. Generator-Based (Most Memory Efficient)

```typescript
export function* serializeGeometry(geometry: HECRASGeometry): Generator<string> {
  yield* serializeGeometryHeader(geometry)

  for (const storageArea of geometry.storageAreas) {
    yield* serializeStorageArea(storageArea) // Must be generator too
  }
}

// Usage:
const lines = Array.from(serializeGeometry(geometry))
```

### 2. String Builder (Memory Efficient)

```typescript
export function serializeGeometryString(geometry: HECRASGeometry): string {
  let result = ""
  result += serializeGeometryHeaderString(geometry)

  for (const storageArea of geometry.storageAreas) {
    result += serializeStorageAreaString(storageArea)
  }

  return result
}
```

### 3. Stream-Based (Best for Very Large Files)

```typescript
export function serializeGeometryToStream(geometry: HECRASGeometry, stream: Writable): void {
  for (const line of serializeGeometryHeader(geometry)) {
    stream.write(line + "\n")
  }

  for (const storageArea of geometry.storageAreas) {
    for (const line of serializeStorageArea(storageArea)) {
      stream.write(line + "\n")
    }
  }
}
```

## Recommendation

**Use the `appendLines` utility** for now as it:

- ✅ Requires minimal code changes
- ✅ Maintains existing API contracts
- ✅ Prevents stack overflow with any array size
- ✅ Is easy to understand and maintain

The generator/string builder approaches are more advanced but would require larger refactoring efforts.
