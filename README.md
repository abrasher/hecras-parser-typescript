# hecras-parser

> TypeScript parser and serializer for HEC-RAS text files (`.g`, `.p`, `.f`, `.u`)

`hecras-parser` turns HEC-RAS input text files into typed TypeScript objects and back into HEC-RAS text again. It has been tested on HEC-RAS example files version 6.6 and above (see the test suite).

This library is for automating edits to HEC-RAS source files through a typed API with editor autocomplete, instead of hand-editing text or stitching together regexes. Think of it as infrastructure for your own scripts, CLIs, and tools — not a finished automation product.

## Quick Start

```ts
import { parseGeometry, serializeGeometry } from "hecras-parser"
import { readFileSync, writeFileSync } from "node:fs"

const geometryText = readFileSync("model.g01", "utf8")
const geometry = parseGeometry(geometryText)

geometry.geomTitle = "Updated geometry title"

const updatedGeometryText = serializeGeometry(geometry, { lineEndings: "\r\n" })
writeFileSync("model.g02", updatedGeometryText)
```

Once the file is parsed, your editor can autocomplete the available fields on `geometry` and its nested objects. You stop guessing what to edit in the raw text file.

## Example: Batch Edit Geometry

Because the file becomes a normal TypeScript object, you can do model-wide edits that would be painful by hand.

This example raises every cross-section elevation in a geometry file by `0.5`:

```ts
import { parseGeometry, serializeGeometry } from "hecras-parser"
import { readFileSync, writeFileSync } from "node:fs"

const geometry = parseGeometry(readFileSync("model.g01", "utf8"))

for (const reach of geometry.rivers ?? []) {
  for (const entry of reach.riverStationEntries ?? []) {
    if (entry.type !== 1) continue

    entry.stationElevation = entry.stationElevation.map(([station, elevation]) => [
      station,
      elevation + 0.5,
    ])
  }
}

writeFileSync("model-shifted.g01", serializeGeometry(geometry))
```

The same pattern applies to:

- shifting Manning's n values across every reach in a large project
- generating many `.pXX` plan iterations from a base plan with tightly controlled parameter changes
- batch-editing inline weir crest elevations before a calibration run
- building web tools or CLIs that expose HEC-RAS files through a typed API

## API

The public API is four parse/serialize pairs — one per supported file type:

```ts
import {
  parseGeometry,    serializeGeometry,
  parsePlan,        serializePlan,
  parseSteadyFlow,  serializeSteadyFlow,
  parseUnsteadyFlow, serializeUnsteadyFlow,
} from "hecras-parser"
```

Each `parse*` function accepts the raw file text and returns a plain TypeScript object. Each `serialize*` function accepts that object and returns HEC-RAS-formatted text ready to write to disk.

## Supported File Types and Sections

| File type | Extension | Parse | Serialize | Notes |
|---|---|---|---|---|
| Geometry | `.gXX` | ✅ | ✅ | See geometry section detail below |
| Plan | `.pXX` | ✅ | ✅ | |
| Steady Flow | `.fXX` | ✅ | ✅ | |
| Unsteady Flow | `.uXX` | ✅ | ✅ | |
| Project | `.prj` | ✅ | ✅ | |

### Geometry sections

| Section | Parse | Serialize |
|---|---|---|
| Cross sections | ✅ | ✅ |
| River / reach structure | ✅ | ✅ |
| Junctions | ✅ | ✅ |
| Inline weirs | ✅ | ✅ |
| Lateral weirs | ✅ | ✅ |
| Bridges (1D) | ✅ | ✅ |
| Culverts | ✅ | ✅ |
| Storage areas | ✅ | ✅ |
| Storage area connections | ✅ | ✅ |
| Break lines | ✅ | ✅ |
| Land cover | ✅ | ✅ |
| Boundary conditions | ✅ | ✅ |
| IC points | ✅ | ✅ |
| Stream nodes | ✅ | ✅ |

## When To Use It

Use `hecras-parser` when you need to:

- read and rewrite HEC-RAS text files without breaking their formatting
- make large or repetitive changes to HEC-RAS inputs programmatically
- build scripts, CLIs, or web tools on top of a typed HEC-RAS API

Do not use `hecras-parser` when you want:

- a tool that runs HEC-RAS for you
- HDF5 result extraction or post-processing (covered well by other libraries)

## Limitations

**Alpha software.** HEC-RAS has many features and edge-cases that may not yet be covered, and support depth varies by file type. If you find a case that is not covered, please open an issue and provide the file.

**No model validation.** This library checks that supported entries are formatted correctly. It does not validate that your model inputs will be accepted by HEC-RAS itself. For example, if you enter a cross-section with more than 500 points, this library will not reject it — but HEC-RAS will.

## Design Goals

- **Round-trip fidelity first.** Parsing and serializing preserve HEC-RAS formatting conventions, not normalize them away.
- **Schema-first architecture.** Schemas define parsing, serialization, and TypeScript types together, so the three never drift apart.
- **Incremental coverage.** Unsupported or partially supported areas degrade honestly rather than pretending to be lossless.
- **Real regression protection.** Parser changes are checked against real HEC-RAS example files, not only tiny synthetic tests.

## Alternative Projects

| Project | Best for |
|---|---|
| [`ras-commander`](https://github.com/gpt-cmdr/ras-commander) | Orchestrating HEC-RAS runs and inspecting results |
| [`rashdf`](https://rashdf.readthedocs.io/en/stable/) | HDF5 output files (2D results, plan outputs) |
| [`pyHMT2D`](https://github.com/psu-efd/pyHMT2D) | Converting between hydraulic model formats |

If you want to automate HEC-RAS execution or extract results, the tools above are a better fit. If you need to read and rewrite the actual HEC-RAS text files with high formatting fidelity, that is what this repo is for.

## How It Works

The library is built around a schema-first DSL where each schema defines parsing, serialization, and the TypeScript type simultaneously.

```ts
// simplified pseudocode
const geometrySchema = schema(
  stringField("geomTitle", "Geometry Title="),
  multiField("description", "Description="),
  booleanField("useIcFromFile", "Use IC From File="),
  tupleArrayField("perimeter", "Perimeter="),
  // ...
)
```

There are no classes with read/write methods. Parsing produces a plain object; serializing consumes one. This makes the result easy to inspect, modify, and test.

For API reference and internal DSL documentation, see [`docs/api/index.md`](docs/api/index.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
