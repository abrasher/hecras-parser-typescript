import type { BoundaryCondition, UnsteadyFlow } from "../models/unsteadyFlow"
import { formatKeyValue, formatCommaSeparated, formatFixedWidth, formatDuration } from "./atomic"
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

function serializeBoundary(boundary: BoundaryCondition): string[] {
  const lines: string[] = []

  const reach = formatFixedWidth(boundary.river, 16, " ", "end")
  const river = formatFixedWidth(boundary.reach, 16, " ", "end")

  const stn = boundary.station
  const param1 = formatFixedWidth(boundary.param1, 8, " ", "end")
  const param2 = formatFixedWidth(boundary.param2, 16, " ", "end")
  const param3 = formatFixedWidth(boundary.param3, 16, " ", "end")
  const param4 = formatFixedWidth(boundary.param4, 16, " ", "end")
  const param5 = formatFixedWidth(boundary.param5, 32, " ", "end")
  const param6 = formatFixedWidth(boundary.param6, 32, " ", "end")

  const locLine = formatKeyValue(
    "Boundary Location",
    [reach, river, stn, param1, param2, param3, param4, param5, param6].join(","),
  )

  lines.push(locLine)

  if (boundary.interval) lines.push(formatKeyValue("Interval", formatDuration(boundary.interval)))

  if (boundary.flowHydrograph) {
    lines.push(formatKeyValue("Flow Hydrograph", ` ${boundary.flowHydrograph.length} `))
    appendLines(lines, formatNumberArrayLines(boundary.flowHydrograph))
  }

  if (boundary.stageHydrographTWCheck !== undefined)
    lines.push(
      formatKeyValue(
        "Stage Hydrograph TW Check",
        formatBoolean(boundary.stageHydrographTWCheck, false),
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
    lines.push(
      formatKeyValue(
        "Fixed Start Date/Time",
        `${boundary.fixedStartDateTime.date},${boundary.fixedStartDateTime.time}`,
      ),
    )

  insertLinesAtIndices(lines, boundary.unparsedLines)
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

  for (const storage of flow.initialStorageElevations) {
    const line = formatKeyValue(
      "Initial Storage Elev",
      formatCommaSeparated([
        formatFixedWidth(storage.name, 16, " ", "end"),
        storage.elevation,
        formatBoolean(storage.fixedDuringWarmup),
      ]),
    )
    lines.push(line)
  }

  for (const bc of flow.boundaries) {
    lines.push(...serializeBoundary(bc))
  }

  insertLinesAtIndices(lines, flow.unparsedLines)
  // add empty line to end of file
  lines.push("")
  return lines
}

export function serializeUnsteadyFlowString(flow: UnsteadyFlow): string {
  return serializeUnsteadyFlow(flow).join("\n") + "\n"
}
