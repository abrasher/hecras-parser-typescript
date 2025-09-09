import type { BoundaryCondition, UnsteadyFlow } from "./models/unsteadyFlow"
import { parseBoolean, parseDurationLine, parseKeyValue, parseValueAsCSV } from "./parsers/atomic"
import { parseBooleanLine, parseNumberBooleanLine } from "./parsers/lineParsers"
import { parseMultilineArray } from "./parsers/multiLineParsers"

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
      flow.useRestart = parseNumberBooleanLine(line)
      i++
      continue
    }
    if (line.startsWith("Initial Flow Loc=")) {
      const [river, reach, station, intialFlow] = parseValueAsCSV(line)

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
      const [name, elevation, fixed] = parseValueAsCSV(line)
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
      const [left, right, rows, cols, cellSize] = parseValueAsCSV(line).map(
        (x) => parseFloat(x),
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
      const parts = parseValueAsCSV(lines[index])

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
      bc.frictionSlope = parseValueAsCSV(lines[index]).map((s) => parseFloat(s))
      index++
    },
    Interval: () => {
      bc.interval = parseDurationLine(lines[index])
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
      bc.stageHydrographTWCheck = parseNumberBooleanLine(lines[index])
      index++
    },
    "DSS Path": () => {
      bc.dssPath = parseKeyValue(lines[index]).value
      index++
    },
    "Use DSS": () => {
      bc.useDSS = parseBooleanLine(lines[index])
      index++
    },
    "Use Fixed Start Time": () => {
      bc.useFixedStartTime = parseBooleanLine(lines[index])
      index++
    },
    "Fixed Start Date/Time": () => {
      const [date, time] = parseValueAsCSV(lines[index])
      bc.fixedStartDateTime = {
        date,
        time,
      }
      index++
    },
    "Is Critical Boundary": () => {
      bc.isCriticalBoundary = parseBooleanLine(lines[index])
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
