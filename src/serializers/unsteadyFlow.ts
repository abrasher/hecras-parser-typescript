import type {
  UnsteadyFlow,
  Boundary,
  Gate,
  InitialStorageElevation,
  InitialRRRElevation,
} from "../models/unsteadyFlow"
import { formatKeyValue, formatCommaSeparated, formatFixedWidth } from "./atomic"
import { appendLines, insertLinesAtIndices } from "./utils/safeArrayUtils"
import { formatBoolean } from "./utils"

// Helper to format numeric arrays into fixed-width lines (8 chars per value, 10 per line)
function formatNumberArrayLines(numbers: number[]): string[] {
  const lines: string[] = []
  const width = 8
  const perLine = 10
  for (let i = 0; i < numbers.length; i += perLine) {
    const chunk = numbers.slice(i, i + perLine)
    const line = chunk.map((n) => formatFixedWidth(n.toString(), width)).join("")
    lines.push(line)
  }
  return lines
}

function serializeInitialStorageElevation(e: InitialStorageElevation): string {
  return formatKeyValue("Initial Storage Elev", formatCommaSeparated([e.name, e.elevation]))
}

function serializeInitialRRRElevation(e: InitialRRRElevation): string {
  return formatKeyValue(
    "Initial RRR Elev",
    formatCommaSeparated([e.river, e.reach, e.station, e.elevation]),
  )
}

function serializeGate(gate: Gate): string[] {
  const lines: string[] = []
  lines.push(formatKeyValue("Gate Name", gate.name))
  if (gate.dssPath !== undefined) lines.push(formatKeyValue("Gate DSS Path", gate.dssPath))
  if (gate.useDSS !== undefined)
    lines.push(formatKeyValue("Gate Use DSS", gate.useDSS ? "True" : "False"))
  if (gate.timeInterval !== undefined)
    lines.push(formatKeyValue("Gate Time Interval", gate.timeInterval))
  if (gate.useFixedStartTime !== undefined)
    lines.push(
      formatKeyValue("Gate Use Fixed Start Time", gate.useFixedStartTime ? "True" : "False"),
    )
  if (gate.fixedStartDateTime !== undefined)
    lines.push(formatKeyValue("Gate Fixed Start Date/Time", gate.fixedStartDateTime))
  if (gate.openings && gate.openings.length > 0) {
    lines.push(
      formatKeyValue("Gate Openings", formatFixedWidth(gate.openings.length.toString(), 4)),
    )
    appendLines(lines, formatNumberArrayLines(gate.openings))
  }
  insertLinesAtIndices(lines, gate.unparsedLines)
  return lines
}

function serializeBoundary(boundary: Boundary): string[] {
  const lines: string[] = []

  const reach = formatFixedWidth(boundary.location.reach, 16, " ", "end")
  const river = formatFixedWidth(boundary.location.river, 16, " ", "end")

  const stn = boundary.location.station.toString()
  const param1 = formatFixedWidth(boundary.location.param1, 8, " ", "end")
  const param2 = formatFixedWidth(boundary.location.param2, 16, " ", "end")
  const param3 = formatFixedWidth(boundary.location.param3, 16, " ", "end")
  const param4 = formatFixedWidth(boundary.location.param4, 16, " ", "end")
  const param5 = formatFixedWidth(boundary.location.param5, 32, " ", "end")
  const param6 = formatFixedWidth(boundary.location.param6, 32, " ", "end")

  const locLine = formatKeyValue(
    "Boundary Location",
    [reach, river, stn, param1, param2, param3, param4, param5, param6].join(","),
  )

  lines.push(locLine)

  if (boundary.frictionSlope)
    lines.push(formatKeyValue("Friction Slope", formatCommaSeparated(boundary.frictionSlope)))
  if (boundary.interval) lines.push(formatKeyValue("Interval", boundary.interval))
  if (boundary.flowHydrograph && boundary.flowHydrograph.length > 0) {
    lines.push(formatKeyValue("Flow Hydrograph", ` ${boundary.flowHydrograph.length} `))
    appendLines(lines, formatNumberArrayLines(boundary.flowHydrograph))
  }
  if (boundary.lateralInflowHydrograph && boundary.lateralInflowHydrograph.length > 0) {
    lines.push(
      formatKeyValue(
        "Lateral Inflow Hydrograph",
        formatFixedWidth(boundary.lateralInflowHydrograph.length.toString(), 4),
      ),
    )
    appendLines(lines, formatNumberArrayLines(boundary.lateralInflowHydrograph))
  }
  if (
    boundary.uniformLateralInflowHydrograph &&
    boundary.uniformLateralInflowHydrograph.length > 0
  ) {
    lines.push(
      formatKeyValue(
        "Uniform Lateral Inflow Hydrograph",
        formatFixedWidth(boundary.uniformLateralInflowHydrograph.length.toString(), 4),
      ),
    )
    appendLines(lines, formatNumberArrayLines(boundary.uniformLateralInflowHydrograph))
  }
  if (boundary.stageHydrographTWCheck !== undefined)
    lines.push(
      formatKeyValue(
        "Stage Hydrograph TW Check",
        formatBoolean(boundary.stageHydrographTWCheck, false),
      ),
    )
  if (boundary.flowHydrographQMult !== undefined)
    lines.push(
      formatKeyValue(
        "Flow Hydrograph QMult",
        formatFixedWidth(
          boundary.flowHydrographQMult.toString(),
          boundary.flowHydrographQMult.toString().length + 1,
        ),
      ),
    )
  if (boundary.flowHydrographSlope !== undefined)
    lines.push(
      formatKeyValue(
        "Flow Hydrograph Slope",
        formatFixedWidth(
          boundary.flowHydrographSlope.toString(),
          boundary.flowHydrographSlope.toString().length + 1,
        ),
      ),
    )
  if (boundary.flowHydrographQMin !== undefined)
    lines.push(
      formatKeyValue(
        "Flow Hydrograph QMin",
        formatFixedWidth(
          boundary.flowHydrographQMin.toString(),
          boundary.flowHydrographQMin.toString().length + 1,
        ),
      ),
    )
  if (boundary.dssFile !== undefined) lines.push(formatKeyValue("DSS File", boundary.dssFile))
  if (boundary.dssPath !== undefined) lines.push(formatKeyValue("DSS Path", boundary.dssPath))
  if (boundary.useDSS !== undefined)
    lines.push(formatKeyValue("Use DSS", boundary.useDSS ? "True" : "False"))
  if (boundary.useFixedStartTime !== undefined)
    lines.push(
      formatKeyValue("Use Fixed Start Time", boundary.useFixedStartTime ? "True" : "False"),
    )
  if (boundary.fixedStartDateTime !== undefined)
    lines.push(formatKeyValue("Fixed Start Date/Time", boundary.fixedStartDateTime))
  if (boundary.isCriticalBoundary !== undefined)
    lines.push(
      formatKeyValue("Is Critical Boundary", boundary.isCriticalBoundary ? "True" : "False"),
    )
  if (boundary.criticalBoundaryFlow !== undefined)
    lines.push(formatKeyValue("Critical Boundary Flow", boundary.criticalBoundaryFlow))

  for (const gate of boundary.gates) {
    appendLines(lines, serializeGate(gate))
  }
<<<<<<< HEAD
=======
  insertLinesAtIndices(lines, boundary.unparsedLines)
>>>>>>> ce30b6fdc8362b4b480445bee486f7cefb8ea1fe
  return lines
}

export function serializeUnsteadyFlow(flow: UnsteadyFlow): string[] {
  const lines: string[] = []
  if (flow.flowTitle) lines.push(formatKeyValue("Flow Title", flow.flowTitle))
  if (flow.programVersion) lines.push(formatKeyValue("Program Version", flow.programVersion))
  if (flow.useRestart !== undefined)
    lines.push(formatKeyValue("Use Restart", flow.useRestart ? "-1 " : " 0 "))
  if (flow.programVersion) lines.push(formatKeyValue("Restart Filename", flow.restartFile))
  for (const loc of flow.initialFlowLocations) {
    const river = formatFixedWidth(loc.river, 16, " ", "end")
    const reach = formatFixedWidth(loc.reach, 16, " ", "end")

    const line = formatKeyValue(
      "Initial Flow Loc",
      formatCommaSeparated([river, reach, loc.station, loc.flow]),
    )
    lines.push(line)
  }
  for (const elev of flow.initialStorageElevations) {
    lines.push(serializeInitialStorageElevation(elev))
  }
  for (const elev of flow.initialRRRElevations) {
    lines.push(serializeInitialRRRElevation(elev))
  }

  for (const b of flow.boundaries) {
    appendLines(lines, serializeBoundary(b))
  }

  for (const met of flow.metBC) {
    if (
      met.startsWith("Met Point Raster Parameters=") ||
      met.startsWith("Precipitation Mode=") ||
      met.startsWith("Wind Mode=") ||
      met.startsWith("Air Density Mode=")
    ) {
      lines.push(met)
    } else {
      lines.push(formatKeyValue("Met BC", met))
    }
  }

  for (const [key, value] of Object.entries(flow.nonNewtonian)) {
    lines.push(formatKeyValue(key, value))
  }
  if (flow.lava) {
    for (const [key, value] of Object.entries(flow.lava)) {
      lines.push(formatKeyValue(key, value))
    }
  }
  if (flow.globalFlowHydrograph && flow.globalFlowHydrograph.length > 0) {
    lines.push(
      formatKeyValue(
        "Flow Hydrograph",
        formatFixedWidth(flow.globalFlowHydrograph.length.toString(), 4),
      ),
    )
    appendLines(lines, formatNumberArrayLines(flow.globalFlowHydrograph))
  }
  insertLinesAtIndices(lines, flow.unparsedLines)
  return lines
}

export function serializeUnsteadyFlowString(flow: UnsteadyFlow): string {
  return serializeUnsteadyFlow(flow).join("\n") + "\n"
}
