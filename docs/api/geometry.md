# Geometry Files Guide

HEC-RAS geometry files (.gXX) define the physical model including rivers, cross sections, storage areas, and hydraulic structures.

## Geometry Structure Overview

```typescript
interface Geometry {
  // Metadata
  geomTitle?: string
  programVersion?: string
  description?: string
  viewingRectangle?: [xMin: number, yMin: number, xMax: number, yMax: number]

  // Main collections
  rivers?: River[]
  storageAreas?: StorageArea[]
  junctions?: Junction[]
  connections?: Connection[]
  boundaryConditions?: BoundaryCondition[]
  breakLines?: BreakLine[]
  icPoints?: ICPoint[]
  streamNodes?: StreamNode[]
  landCover?: LandCover

  // GIS/Raster configuration
  gisUnits?: string
  gisDtmPath?: string
  gisMapProjection?: string
  // ... additional GIS fields
}
```

## Rivers and Reaches

Rivers contain reaches, and reaches contain river stations (cross sections, bridges, weirs, etc.).

```typescript
// Access rivers
for (const river of geometry.rivers ?? []) {
  console.log(`River: ${river.name}`)

  for (const reach of river.reaches ?? []) {
    console.log(`  Reach: ${reach.name}`)
    console.log(`  Coordinates: ${reach.coordinates?.length} points`)

    // Process stations (cross sections, structures)
    for (const station of reach.stations ?? []) {
      switch (station.type) {
        case 1: // Cross section
          console.log(`    XS at ${station.riverStation}`)
          break
        case 3: // 1D Bridge
          console.log(`    Bridge at ${station.riverStation}`)
          break
        case 5: // Inline weir
          console.log(`    Inline weir at ${station.riverStation}`)
          break
        case 6: // Lateral weir
          console.log(`    Lateral weir at ${station.riverStation}`)
          break
      }
    }
  }
}
```

### Cross Sections (Type 1)

Cross sections define channel geometry at specific river stations.

```typescript
const crossSection = reach.stations?.find((s) => s.type === 1)

if (crossSection) {
  // Station/Elevation profile
  const profile = crossSection.stationElevation // [station, elevation][]

  // Manning's roughness
  const manning = crossSection.manning // { station, nValue, unknownParameter }[]

  // Bank stations
  const leftBank = crossSection.bankStation?.[0]
  const rightBank = crossSection.bankStation?.[1]

  // Levees
  const levees = crossSection.levees // [leftStation, leftElev, rightStation, rightElev]

  // Ineffective flow areas
  const ineffective = crossSection.ineffective
}
```

### Structures

Hydraulic structures are embedded within reaches:

- **Type 2**: Culvert structure
- **Type 3**: 1D Bridge
- **Type 5**: Inline weir
- **Type 6**: Lateral weir

```typescript
// Find all bridges in a reach
const bridges = reach.stations?.filter((s) => s.type === 3) ?? []

for (const bridge of bridges) {
  console.log(`Bridge at RS ${bridge.riverStation}`)
  console.log(`  Description: ${bridge.description}`)
}
```

## Storage Areas

Storage areas can be 1D (volume-elevation curves) or 2D (mesh-based).

```typescript
for (const sa of geometry.storageAreas ?? []) {
  console.log(`Storage Area: ${sa.name}`)
  console.log(`  Type: ${sa.is2D ? "2D" : "1D"}`)
  console.log(`  Min Elevation: ${sa.minElevation}`)

  if (sa.is2D) {
    // 2D mesh points
    console.log(`  2D Points: ${sa.points2D?.length}`)
    console.log(`  Manning's n: ${sa.mannings}`)
  } else {
    // Volume-elevation curve
    for (const point of sa.volumeElevation ?? []) {
      console.log(`  Elev ${point.elevation}: Vol ${point.volume}`)
    }
  }

  // Surface line (perimeter)
  console.log(`  Surface line: ${sa.surfaceLine?.length} points`)
}
```

### Modifying Storage Areas

```typescript
const reservoir = geometry.storageAreas?.find((sa) => sa.name === "Reservoir")

if (reservoir) {
  // Convert to 2D
  reservoir.is2D = true

  // Update Manning's roughness
  reservoir.mannings = 0.035

  // Add 2D mesh parameters
  reservoir.cellVolumeFilterTolerance = 0.01
}
```

## Junctions

Junctions connect multiple river reaches.

```typescript
for (const junction of geometry.junctions ?? []) {
  console.log(`Junction: ${junction.name}`)

  // Upstream connections
  for (const upstream of junction.upstreamConnections ?? []) {
    console.log(`  Upstream: ${upstream.river} / ${upstream.reach}`)
  }

  // Downstream connection
  console.log(`  Downstream: ${junction.downstreamRiver} / ${junction.downstreamReach}`)
}
```

## Connections

Connections link storage areas and can include hydraulic structures.

```typescript
for (const conn of geometry.connections ?? []) {
  console.log(`Connection: ${conn.name}`)
  console.log(`  From: ${conn.upstreamStorageArea}`)
  console.log(`  To: ${conn.downstreamStorageArea}`)

  // Weir overflow
  if (conn.weirCoefficient) {
    console.log(`  Weir coefficient: ${conn.weirCoefficient}`)
  }

  // Culverts
  for (const culvert of conn.culverts ?? []) {
    console.log(`  Culvert: ${culvert.shape}`)
  }

  // Gates
  for (const gate of conn.gates ?? []) {
    console.log(`  Gate: ${gate.name}`)
  }
}
```

## Boundary Conditions

Boundary condition lines define where external flows enter/exit the model.

```typescript
for (const bc of geometry.boundaryConditions ?? []) {
  console.log(`BC: ${bc.name}`)
  console.log(`  Storage Area: ${bc.storageArea}`)
  console.log(`  Start: [${bc.startPosition}]`)
  console.log(`  End: [${bc.endPosition}]`)
}
```

## Land Cover

Land cover defines Manning's roughness across the model domain.

```typescript
if (geometry.landCover) {
  console.log("Land Cover Table:")
  for (const entry of geometry.landCover.table ?? []) {
    console.log(`  ${entry.name}: n=${entry.value}`)
  }

  console.log("Land Cover Regions:")
  for (const region of geometry.landCover.regions ?? []) {
    console.log(`  Region: ${region.name}`)
    console.log(`    Polygon: ${region.polygon?.length} points`)
  }
}
```

## Break Lines

Break lines control 2D mesh generation.

```typescript
for (const breakLine of geometry.breakLines ?? []) {
  console.log(`Break Line: ${breakLine.name}`)
  console.log(`  Cell size range: ${breakLine.cellSizeMin} - ${breakLine.cellSizeMax}`)
  console.log(`  Points: ${breakLine.polylinePoints?.length}`)
}
```

## Common Types

### Coordinate Types

```typescript
// 2D coordinate [x, y]
type Coordinate = [x: number, y: number]

// Station-elevation pair [station, elevation]
type StationElevation = [station: number, elevation: number]
```

### Point Structures

```typescript
interface StationElevationPoint {
  station: number // Distance along cross section
  elevation: number // Vertical elevation
}

interface VolumeElevationPoint {
  elevation: number // Water surface elevation
  volume: number // Storage volume at this elevation
}

interface ManningSegment {
  station: number // Start station of segment
  nValue: number // Manning's n roughness coefficient
  unknownParameter: number // Additional HEC-RAS parameter
}
```

## Example: Extract All Cross Section Data

```typescript
import { parseGeometry } from "hecras-parser"
import { readFileSync } from "fs"

const geometry = parseGeometry(readFileSync("model.g01", "utf-8"))

interface CrossSectionSummary {
  river: string
  reach: string
  station: number
  numPoints: number
  minElevation: number
  maxElevation: number
}

const crossSections: CrossSectionSummary[] = []

for (const river of geometry.rivers ?? []) {
  for (const reach of river.reaches ?? []) {
    for (const station of reach.stations ?? []) {
      if (station.type === 1 && station.stationElevation) {
        const elevations = station.stationElevation.map(([, elev]) => elev)
        crossSections.push({
          river: river.name,
          reach: reach.name,
          station: station.riverStation,
          numPoints: station.stationElevation.length,
          minElevation: Math.min(...elevations),
          maxElevation: Math.max(...elevations),
        })
      }
    }
  }
}

console.table(crossSections)
```

## Example: Modify All Manning's Values

```typescript
import { parseGeometry, serializeGeometry } from "hecras-parser"

const geometry = parseGeometry(content)

// Increase all Manning's n values by 10%
for (const river of geometry.rivers ?? []) {
  for (const reach of river.reaches ?? []) {
    for (const station of reach.stations ?? []) {
      if (station.type === 1 && station.manning) {
        for (const segment of station.manning) {
          segment.nValue *= 1.1
        }
      }
    }
  }
}

const output = serializeGeometry(geometry)
```

## See Also

- [Type Reference](./generated/types.md) - Complete type definitions
- [Plan Files Guide](./plan.md) - Working with simulation settings
- [API Reference](./index.md) - Core functions
