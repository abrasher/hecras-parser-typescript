import type { BoundaryCondition, UnsteadyFlow } from "./models/unsteadyFlow"

import {
  parseKeyValue,
  parseDuration,
  parseCommaSeparated,
  parseBoolean,
  parseMultilineArray,
} from "./parsers/utils"

export function parseUnsteadyFlow(content: string): UnsteadyFlow {
  const lines = content.split(/\r\n|\r|\n/)
  const flow: UnsteadyFlow = {
    initialFlowLocations: [],
    initialStorageElevations: [],
    initialRRRElevations: [],
    boundaries: [],
    metBC: [],
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line || line.trim() === "") {
      i++
      continue
    }
    if (line.startsWith("Flow Title=")) {
      flow.flowTitle = parseKeyValue(line).value
      i++
      continue
    }
    if (line.startsWith("Restart Filename=")) {
      flow.restartFile = parseKeyValue(line).value
      i++
      continue
    }
    if (line.startsWith("Program Version=")) {
      flow.programVersion = parseKeyValue(line).value
      i++
      continue
    }
    if (line.startsWith("Use Restart=")) {
      const { value } = parseKeyValue(line)
      flow.useRestart = parseBoolean(value)
      i++
      continue
    }
    if (line.startsWith("Initial Flow Loc=")) {
      const { value } = parseKeyValue(line)
      const [river, reach, station, intialFlow] = parseCommaSeparated(value)

      flow.initialFlowLocations.push({
        river,
        reach,
        station: parseFloat(station),
        flow: parseFloat(intialFlow),
      })
      i++
      continue
    }
    if (line.startsWith("Initial Storage Elev=")) {
      const { value } = parseKeyValue(line)
      const [name, elevation, fixed] = parseCommaSeparated(value)
      flow.initialStorageElevations.push({
        name,
        elevation: parseFloat(elevation),
        fixedDuringWarmup: parseBoolean(fixed),
      })
      i++
      continue
    }

    if (line.startsWith("Boundary Location=")) {
      const { data, nextIndex } = parseBoundaryCondition(lines, i)
      flow.boundaries.push(data)
      i = nextIndex
      continue
    }
    if (line.startsWith("Met Point Raster Parameters=")) {
      const { value } = parseKeyValue(line)
      const [left, right, rows, cols, cellSize] = parseCommaSeparated(value).map((x) =>
        parseFloat(x),
      )
      flow.metPointRasterParameters = {
        left,
        right,
        rows,
        cols,
        cellSize,
      }
      i++
      continue
    }
    flow.unparsedLines = flow.unparsedLines || []
    flow.unparsedLines.push({ index: i, content: line })
    i++
  }
  return flow
}

function parseBoundaryCondition(
  lines: string[],
  currentIndex: number,
): { data: BoundaryCondition; nextIndex: number } {
  let index = currentIndex

  const bc = {} as BoundaryCondition

  const map = {
    "Boundary Location": () => {
      const { value } = parseKeyValue(lines[index])
      const parts = parseCommaSeparated(value)

      bc.river = parts[0]
      bc.reach = parts[1]
      bc.station = parseFloat(parts[2])
      bc.param1 = parts[3]
      bc.param2 = parts[3]
      bc.param3 = parts[4]
      bc.param4 = parts[5]
      bc.param5 = parts[6]
      bc.param6 = parts[7]
      index++
    },
    "Friction Slope": () => {
      const { value } = parseKeyValue(lines[index])
      bc.frictionSlope = parseCommaSeparated(value).map((s) => parseFloat(s))
      index++
    },
    Interval: () => {
      const { value } = parseKeyValue(lines[index])
      bc.interval = parseDuration(value)
      index++
    },
    "Flow Hydrograph": () => {
      const numOfEntries = Number(parseKeyValue(lines[index]).value)
      index++

      const { data, nextIndex } = parseMultilineArray({
        lines,
        width: 8,
        maxWidth: 80,
        numOfEntries,
        currentIndex: index,
      })

      bc.flowHydrograph = data.map((s) => parseFloat(s))
      index = nextIndex
    },
    "Stage Hydrograph TW Check": () => {
      const { value } = parseKeyValue(lines[index])
      bc.stageHydrographTWCheck = parseBoolean(value)
      index++
    },
    "DSS Path": () => {
      bc.dssPath = parseKeyValue(lines[index]).value
      index++
    },
    "Use DSS": () => {
      const { value } = parseKeyValue(lines[index])
      bc.useDSS = parseBoolean(value)
      index++
    },
    "Use Fixed Start Time": () => {
      const { value } = parseKeyValue(lines[index])
      bc.useFixedStartTime = parseBoolean(value)
      index++
    },
    "Fixed Start Date/Time": () => {
      const { value } = parseKeyValue(lines[index])
      const [date, time] = parseCommaSeparated(value)
      bc.fixedStartDateTime = {
        date,
        time,
      }
      index++
    },
    "Is Critical Boundary": () => {
      const { value } = parseKeyValue(lines[index])
      bc.isCriticalBoundary = parseBoolean(value)
      index++
    },
    "Critical Boundary Flow": () => {
      bc.criticalBoundaryFlow = parseKeyValue(lines[index]).value
      index++
    },
  }

  while (index < lines.length) {
    const line = lines[index]
    // Stop when we hit the next boundary
    if (line.startsWith("Boundary Location=") && index !== currentIndex) break

    const key = parseKeyValue(line).key as keyof typeof map
    if (key in map) {
      map[key]()
    } else {
      break
    }
  }
  return { data: bc, nextIndex: index }
}
