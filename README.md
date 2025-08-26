# HEC-RAS Parser TypeScript

A work-in-progress TypeScript library for parsing HEC-RAS geometry files (.gXX).

## Installation

```bash
npm install hecras-parser
```

## Quick Start

```typescript
import { parseGeometry, loadGeometry } from "hecras-parser"

// Parse geometry file content
const geometry = parseGeometry(fileContent)

// Or load from file path (Node.js)
const geometry = await loadGeometry("./path/to/file.g01")
```

## File Support Overview

### Currently Supported File Types

| File Type          | Extension            | Support Level  | Description                                |
| ------------------ | -------------------- | -------------- | ------------------------------------------ |
| **Geometry Files** | `.g01`, `.g02`, etc. | 🚧 **Partial** | Complete parsing and serialization support |

### Not Yet Supported File Types

| File Type         | Extension            | Status               | Description                      |
| ----------------- | -------------------- | -------------------- | -------------------------------- |
| **Flow Files**    | `.f01`, `.f02`, etc. | ❌ **Not Supported** | Steady/unsteady flow data files  |
| **Plan Files**    | `.p01`, `.p02`, etc. | ❌ **Not Supported** | Project plan definition files    |
| **Project Files** | `.prj`               | ❌ **Not Supported** | HEC-RAS project files            |
| **Results Files** | `.hdf`               | ❌ **Not Supported** | Simulation results in HDF format |

## Geometry File Parsing Support

### Core Geometry Elements

| Element                 | Support Level   | Parser | Serializer | Description                                    |
| ----------------------- | --------------- | ------ | ---------- | ---------------------------------------------- |
| **File Headers**        | ✅ **Complete** | ✅     | ✅         | Title, version, viewing rectangle, description |
| **Storage Areas**       | ✅ **Complete** | ✅     | ✅         | 2D flow areas, elevation data, Manning's n     |
| **River Reaches**       | ✅ **Complete** | ✅     | ✅         | 1D river centerlines, cross-sections, stations |
| **Connections**         | ✅ **Complete** | ✅     | ✅         | All connection types between storage areas     |
| **Boundary Conditions** | ✅ **Complete** | ✅     | ✅         | Flow boundary condition lines                  |
| **Break Lines**         | ✅ **Complete** | ✅     | ✅         | Terrain modification lines                     |
| **Junctions**           | ✅ **Complete** | ✅     | ✅         | Flow junctions and splits                      |
| **Global Settings**     | ✅ **Complete** | ✅     | ✅         | LCMann time, channel cuts, GIS settings        |

### Connection Types

| Connection Type         | Support Level   | Features Supported                                              |
| ----------------------- | --------------- | --------------------------------------------------------------- |
| **General Connections** | ✅ **Complete** | Connection lines, centerline profiles, hydraulic tables         |
| **Weir Connections**    | ✅ **Complete** | Weir coefficients, station-elevation data, ogee settings        |
| **Bridge Connections**  | ✅ **Complete** | Bridge geometry, deck data, piers, approach sections            |
| **Culvert Connections** | ✅ **Complete** | All culvert shapes, barrel configurations, flow characteristics |

### Bridge Connection Features

| Feature               | Support Level   | Details                                  |
| --------------------- | --------------- | ---------------------------------------- |
| **Basic Properties**  | ✅ **Complete** | Name, stations, hydraulic method         |
| **Deck Geometry**     | ✅ **Complete** | Deck coordinates, elevation profiles     |
| **Pier Data**         | ✅ **Complete** | Pier stations, widths, shapes, roughness |
| **Approach Sections** | ✅ **Complete** | Upstream/downstream cross-sections       |
| **Flow Distribution** | ✅ **Complete** | Energy loss coefficients, flow ratios    |

### Culvert Connection Features

| Feature                  | Support Level   | Details                                                                      |
| ------------------------ | --------------- | ---------------------------------------------------------------------------- |
| **Culvert Shapes**       | ✅ **Complete** | Circle, box, pipe arch, arch, semi-circle, low arch, high arch, conspan arch |
| **Barrel Configuration** | ✅ **Complete** | Multiple barrels, individual barrel properties                               |
| **Hydraulic Properties** | ✅ **Complete** | Manning's n, entrance/exit losses, invert elevations                         |
| **Flow Characteristics** | ✅ **Complete** | Charts, scale factors, length, rise, span                                    |

### Storage Area Features

| Feature                    | Support Level   | Details                                          |
| -------------------------- | --------------- | ------------------------------------------------ |
| **2D Grid Areas**          | ✅ **Complete** | Grid generation parameters, computational points |
| **Elevation Data**         | ✅ **Complete** | Surface lines, minimum elevation                 |
| **Hydraulic Properties**   | ✅ **Complete** | Manning's n values, roughness regions            |
| **Computational Settings** | ✅ **Complete** | Cell filtering, area fractions, face profiles    |

### River Reach Features

| Feature                 | Support Level   | Details                                         |
| ----------------------- | --------------- | ----------------------------------------------- |
| **Centerline Geometry** | ✅ **Complete** | River centerline coordinates                    |
| **Cross Sections**      | ✅ **Complete** | Station-elevation data, cut lines               |
| **Flow Parameters**     | ✅ **Complete** | Manning's n, contraction/expansion coefficients |
| **Bank Stations**       | ✅ **Complete** | Left/right bank identifiers                     |

## Parsing Accuracy & Validation

- **Round-trip Testing**: All supported elements can be parsed and re-serialized to match original files
- **Format Compliance**: Strict adherence to HEC-RAS file format specifications
- **Error Handling**: Comprehensive error messages for invalid or unsupported data
- **Type Safety**: Full TypeScript type definitions for all data structures

## API Reference

### Main Functions

```typescript
// Parse geometry file content (string)
function parseGeometry(content: string): HECRASGeometry

// Load and parse from file path (Node.js)
function loadGeometry(filePath: string): Promise<HECRASGeometry>
function loadGeometrySync(filePath: string): HECRASGeometry

// Serialize geometry back to HEC-RAS format
function serializeGeometry(geometry: HECRASGeometry): string
```

### Data Models

All geometry elements are strongly typed with TypeScript interfaces:

- `HECRASGeometry` - Root geometry container
- `StorageArea` - 2D flow area definitions
- `Connection` - All connection types (bridge, culvert, weir, general)
- `RiverReach` - 1D river channel data
- `BoundaryCondition` - Flow boundary definitions
- `BreakLine` - Terrain modification lines
- `JunctionProperties` - Flow junction data

## Examples

### Basic Parsing

```typescript
import { parseGeometry } from "hecras-parser"
import fs from "fs"

const content = fs.readFileSync("model.g01", "utf-8")
const geometry = parseGeometry(content)

console.log(`Title: ${geometry.geomTitle}`)
console.log(`Storage Areas: ${geometry.storageAreas.length}`)
console.log(`Connections: ${geometry.connections.length}`)
```

### Working with Connections

```typescript
// Find all culvert connections
const culverts = geometry.connections.filter((conn) => conn.culvert)

culverts.forEach((conn) => {
  console.log(`Culvert: ${conn.name}`)
  conn.culvert?.forEach((group) => {
    console.log(`  Shape: ${group.shape}, Barrels: ${group.numberOfBarrels}`)
  })
})
```

### Serialization

```typescript
import { serializeGeometry } from "hecras-parser"

// Parse and modify geometry
const geometry = parseGeometry(content)
geometry.geomTitle = "Modified Model"

// Serialize back to HEC-RAS format
const output = serializeGeometry(geometry)
fs.writeFileSync("modified.g01", output)
```

## Contributing

This library focuses on HEC-RAS geometry file parsing. For other file types (flow, plan, results), please open an issue to discuss implementation priorities.

## License

MIT
