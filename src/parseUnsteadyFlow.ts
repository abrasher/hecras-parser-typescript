import type {
  Boundary,
  Gate,
  InitialFlowLocation,
  InitialRRRElevation,
  InitialStorageElevation,
  UnsteadyFlow,
} from "./models/unsteadyFlow"
import { parseCommaSeparated, parseKeyValue } from "./parsers/atomic"
import { parseMultilineArray } from "./parsers/multiLineParsers"

const parseNumbers = (arr: string[]) => arr.map((d) => parseFloat(d))

function parseInitialFlowLocation(value: string): InitialFlowLocation {
  const [river, reach, stn, flow] = parseCommaSeparated(value)
  return {
    river: river.trim(),
    reach: reach.trim(),
    station: parseFloat(stn),
    flow: parseFloat(flow),
  }
}

function parseInitialStorageElevation(value: string): InitialStorageElevation {
  const [name, elev] = parseCommaSeparated(value)
  return { name: name.trim(), elevation: parseFloat(elev) }
}

function parseInitialRRRElevation(value: string): InitialRRRElevation {
  const [river, reach, stn, elev] = parseCommaSeparated(value)
  return {
    river: river.trim(),
    reach: reach.trim(),
    station: parseFloat(stn),
    elevation: parseFloat(elev),
  }
}

function parseGate(lines: string[], startIndex: number): { gate: Gate; next: number } {
  const gate: Gate = { name: "", openings: [] }
  let i = startIndex
  while (i < lines.length) {
    const line = lines[i]
    if (!line || line.trim() === "") {
      i++
      continue
    }
    if (line.startsWith("Gate Name=")) {
      gate.name = parseKeyValue(line).value
      i++
    } else if (line.startsWith("Gate DSS Path=")) {
      gate.dssPath = parseKeyValue(line).value
      i++
    } else if (line.startsWith("Gate Use DSS=")) {
      gate.useDSS = parseKeyValue(line).value.trim().toLowerCase() === "true"
      i++
    } else if (line.startsWith("Gate Time Interval=")) {
      gate.timeInterval = parseKeyValue(line).value
      i++
    } else if (line.startsWith("Gate Use Fixed Start Time=")) {
      gate.useFixedStartTime = parseKeyValue(line).value.trim().toLowerCase() === "true"
      i++
    } else if (line.startsWith("Gate Fixed Start Date/Time=")) {
      gate.fixedStartDateTime = parseKeyValue(line).value
      i++
    } else if (line.startsWith("Gate Openings=")) {
      const count = parseInt(parseKeyValue(line).value)
      const { data, nextIndex } = parseMultilineArray({
        lines,
        width: 8,
        maxWidth: 80,
        numOfEntries: count,
        currentIndex: i + 1,
      })
      gate.openings = parseNumbers(data)
      i = nextIndex
    } else if (line.startsWith("Gate Name=") || line.startsWith("Boundary Location=")) {
      break
    } else {
      break
    }
  }
  return { gate, next: i }
}

function parseBoundary(lines: string[], startIndex: number): { boundary: Boundary; next: number } {
  const line = lines[startIndex]
  const location = parseCommaSeparated(parseKeyValue(line).value)
  const boundary: Boundary = { location, gates: [] }
  let i = startIndex + 1

  while (i < lines.length) {
    const l = lines[i]
    if (!l || l.trim() === "") {
      i++
      continue
    }
    if (
      l.startsWith("Boundary Location=") ||
      l.startsWith("Initial Flow Loc=") ||
      l.startsWith("Met ") ||
      l.startsWith("Precipitation Mode=") ||
      l.startsWith("Wind Mode=") ||
      l.startsWith("Air Density Mode=") ||
      l.startsWith("Non-Newtonian") ||
      l.startsWith("Lava") ||
      l.startsWith("Temperature") ||
      l.startsWith("Heat Ballance") ||
      l.startsWith("Viscosity") ||
      l.startsWith("Yield Strength") ||
      l.startsWith("Consistency Factor") ||
      l.startsWith("Profile Coefficient") ||
      l.startsWith("Lava Param")
    ) {
      break
    }

    if (l.startsWith("Friction Slope=")) {
      boundary.frictionSlope = parseNumbers(parseCommaSeparated(parseKeyValue(l).value))
      i++
      continue
    }
    if (l.startsWith("Interval=")) {
      boundary.interval = parseKeyValue(l).value
      i++
      continue
    }
    if (l.startsWith("Flow Hydrograph=")) {
      const count = parseInt(parseKeyValue(l).value)
      const { data, nextIndex } = parseMultilineArray({
        lines,
        width: 8,
        maxWidth: 80,
        numOfEntries: count,
        currentIndex: i + 1,
      })
      boundary.flowHydrograph = parseNumbers(data)
      i = nextIndex
      continue
    }
    if (l.startsWith("Lateral Inflow Hydrograph=")) {
      const count = parseInt(parseKeyValue(l).value)
      const { data, nextIndex } = parseMultilineArray({
        lines,
        width: 8,
        maxWidth: 80,
        numOfEntries: count,
        currentIndex: i + 1,
      })
      boundary.lateralInflowHydrograph = parseNumbers(data)
      i = nextIndex
      continue
    }
    if (l.startsWith("Uniform Lateral Inflow Hydrograph=")) {
      const count = parseInt(parseKeyValue(l).value)
      const { data, nextIndex } = parseMultilineArray({
        lines,
        width: 8,
        maxWidth: 80,
        numOfEntries: count,
        currentIndex: i + 1,
      })
      boundary.uniformLateralInflowHydrograph = parseNumbers(data)
      i = nextIndex
      continue
    }
    if (l.startsWith("Stage Hydrograph TW Check=")) {
      boundary.stageHydrographTWCheck = parseFloat(parseKeyValue(l).value)
      i++
      continue
    }
    if (l.startsWith("Flow Hydrograph QMult=")) {
      boundary.flowHydrographQMult = parseFloat(parseKeyValue(l).value)
      i++
      continue
    }
    if (l.startsWith("Flow Hydrograph Slope=")) {
      boundary.flowHydrographSlope = parseFloat(parseKeyValue(l).value)
      i++
      continue
    }
    if (l.startsWith("Flow Hydrograph QMin=")) {
      boundary.flowHydrographQMin = parseFloat(parseKeyValue(l).value)
      i++
      continue
    }
    if (l.startsWith("DSS File=")) {
      boundary.dssFile = parseKeyValue(l).value
      i++
      continue
    }
    if (l.startsWith("DSS Path=")) {
      boundary.dssPath = parseKeyValue(l).value
      i++
      continue
    }
    if (l.startsWith("Use DSS=")) {
      boundary.useDSS = parseKeyValue(l).value.trim().toLowerCase() === "true"
      i++
      continue
    }
    if (l.startsWith("Use Fixed Start Time=")) {
      boundary.useFixedStartTime = parseKeyValue(l).value.trim().toLowerCase() === "true"
      i++
      continue
    }
    if (l.startsWith("Fixed Start Date/Time=")) {
      boundary.fixedStartDateTime = parseKeyValue(l).value
      i++
      continue
    }
    if (l.startsWith("Is Critical Boundary=")) {
      boundary.isCriticalBoundary = parseKeyValue(l).value.trim().toLowerCase() === "true"
      i++
      continue
    }
    if (l.startsWith("Critical Boundary Flow=")) {
      boundary.criticalBoundaryFlow = parseKeyValue(l).value
      i++
      continue
    }
    if (l.startsWith("Gate Name=")) {
      const { gate, next } = parseGate(lines, i)
      boundary.gates.push(gate)
      i = next
      continue
    }

    boundary.extra = boundary.extra || []
    boundary.extra.push(l)
    i++
  }
  return { boundary, next: i }
}

export function parseUnsteadyFlow(content: string): UnsteadyFlow {
  const lines = content.split(/\r\n|\r|\n/)
  const flow: UnsteadyFlow = {
    initialFlowLocations: [],
    initialStorageElevations: [],
    initialRRRElevations: [],
    boundaries: [],
    metBC: [],
    nonNewtonian: {},
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
    if (line.startsWith("Program Version=")) {
      flow.programVersion = parseKeyValue(line).value
      i++
      continue
    }
    if (line.startsWith("Use Restart=")) {
      flow.useRestart = parseInt(parseKeyValue(line).value)
      i++
      continue
    }
    if (line.startsWith("Initial Flow Loc=")) {
      flow.initialFlowLocations.push(parseInitialFlowLocation(parseKeyValue(line).value))
      i++
      continue
    }
    if (line.startsWith("Initial Storage Elev=")) {
      flow.initialStorageElevations.push(parseInitialStorageElevation(parseKeyValue(line).value))
      i++
      continue
    }
    if (line.startsWith("Initial RRR Elev=")) {
      flow.initialRRRElevations.push(parseInitialRRRElevation(parseKeyValue(line).value))
      i++
      continue
    }
    if (line.startsWith("Boundary Location=")) {
      const { boundary, next } = parseBoundary(lines, i)
      flow.boundaries.push(boundary)
      i = next
      continue
    }
    if (line.startsWith("Met BC=")) {
      flow.metBC.push(parseKeyValue(line).value)
      i++
      continue
    }
    if (
      line.startsWith("Met Point Raster Parameters=") ||
      line.startsWith("Precipitation Mode=") ||
      line.startsWith("Wind Mode=") ||
      line.startsWith("Air Density Mode=")
    ) {
      const { key, value } = parseKeyValue(line)
      flow.metBC.push(`${key}=${value}`)
      i++
      continue
    }
    if (line.startsWith("Non-Newtonian")) {
      const { key, value } = parseKeyValue(line)
      flow.nonNewtonian[key] = value
      i++
      continue
    }
    if (
      line.startsWith("Lava") ||
      line.startsWith("Temperature") ||
      line.startsWith("Heat Ballance") ||
      line.startsWith("Viscosity") ||
      line.startsWith("Yield Strength") ||
      line.startsWith("Consistency Factor") ||
      line.startsWith("Profile Coefficient") ||
      line.startsWith("Lava Param")
    ) {
      const { key, value } = parseKeyValue(line)
      flow.lava = flow.lava || {}
      flow.lava[key] = value
      i++
      continue
    }
    if (line.startsWith("Flow Hydrograph=")) {
      const count = parseInt(parseKeyValue(line).value)
      const { data, nextIndex } = parseMultilineArray({
        lines,
        width: 8,
        maxWidth: 80,
        numOfEntries: count,
        currentIndex: i + 1,
      })
      flow.globalFlowHydrograph = parseNumbers(data)
      i = nextIndex
      continue
    }
    try {
      const { key, value } = parseKeyValue(line)
      flow.otherLines = flow.otherLines || {}
      flow.otherLines[key] = value
    } catch {
      // ignore
    }
    i++
  }
  return flow
}
