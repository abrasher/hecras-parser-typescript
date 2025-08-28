# HEC-RAS Parser TypeScript

A work-in-progress TypeScript library for parsing HEC-RAS geometry files (.gXX).

Currently targetting HECRAS 6.6 as of August 2025.

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
| **Flow Files**    | `.f0x`, `.u0x`, etc. | ❌ **Not Supported** | Steady/unsteady flow data files  |
| **Plan Files**    | `.p01`, `.p02`, etc. | ❌ **Not Supported** | Project plan definition files    |
| **Project Files** | `.prj`               | ❌ **Not Supported** | HEC-RAS project files            |
| **Results Files** | `.hdf`               | ❌ **Out of Scope**  | Simulation results in HDF format |

## Geometry File Parsing Support

### Core Geometry Elements

| Element                 | Support Level     | Parser | Serializer | Description                                    |
| ----------------------- | ----------------- | ------ | ---------- | ---------------------------------------------- |
| **File Headers**        | ✅ **Complete**   | ✅     | ✅         | Title, version, viewing rectangle, description |
| **Storage Areas**       | ✅ **Complete**   | ✅     | ✅         | 2D flow areas, elevation data, Manning's n     |
| **Connections**         | ✅ **Complete**   | ✅     | ✅         | All connection types between storage areas     |
| **Boundary Conditions** | ✅ **Complete**   | ✅     | ✅         | Flow boundary condition lines                  |
| **Break Lines**         | ✅ **Complete**   | ✅     | ✅         | Terrain modification lines                     |
| **Junctions**           | ✅ **Complete**   | ✅     | ✅         | Flow junctions and splits                      |
| **Pipes**               | ❌**Not Started** | ✅     | ✅         | Flow junctions and splits                      |
| **Global Settings**     | ❌**Partial**     | ✅     | ✅         | LCMann time, channel cuts, GIS settings        |
| **River Reaches**       | ❌**Incomplete**  | ❌     | ❌         | 1D river centerlines, cross-sections, stations |

### Connection Types

| Connection Type         | Support Level   | Features Supported                                              |
| ----------------------- | --------------- | --------------------------------------------------------------- |
| **General Connections** | ✅ **Complete** | Connection lines, centerline profiles, hydraulic tables         |
| **Weir Connections**    | ✅ **Complete** | Weir coefficients, station-elevation data, ogee settings        |
| **Bridge Connections**  | ✅ **Complete** | Bridge geometry, deck data, piers, approach sections            |
| **Culvert Connections** | ✅ **Complete** | All culvert shapes, barrel configurations, flow characteristics |

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
