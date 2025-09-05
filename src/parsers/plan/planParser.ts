import type { HECRASPlan } from "../../models/plan/plan"
import { parseCommaSeparated, parseDurationLine, parseKeyValue } from "../atomic"

/**
 * Parse a BreakLine geometry definition from HEC-RAS format
 * @param lines Array of lines to parse
 * @param startIndex Index to start parsing from
 * @returns ParseResult containing the parsed BreakLine and lines consumed
 */
export function parsePlan(lines: string[]): HECRASPlan {
  let index = 0
  const plan = {} as HECRASPlan

  while (index < lines.length) {
    const line = lines[index]
    // Parse the line and update the plan object
    if (line.startsWith("Plan Title=")) {
      plan.title = parseKeyValue(line).value
    } else if (line.startsWith("Plan File Version=")) {
      plan.version = parseKeyValue(line).value
    } else if (line.startsWith("Short Identifier=")) {
      plan.shortIdentifier = parseKeyValue(line).value.trim()
    } else if (line.startsWith("Geom File=")) {
      plan.geomFile = parseKeyValue(line).value
    } else if (line.startsWith("Flow File=")) {
      plan.flowFile = parseKeyValue(line).value
    } else if (line.startsWith("DSS File=")) {
      plan.dssFile = parseKeyValue(line).value
    } else if (line.startsWith("Plan Description=")) {
      plan.description = parseKeyValue(line).value
    } else if (line.startsWith("Simulation Date=")) {
      const [startDate, startTime, endDate, endTime] = parseCommaSeparated(line)
      plan.simulationDate = { startDate, startTime, endDate, endTime }
    } else if (line.startsWith("Computation Time Step=")) {
      // plan.computationTimeStep = parseDurationLine(line)
    } else if (line.startsWith("Flow Settings=")) {
      // TODO: Parse flow settings
    } else if (line.startsWith("Run HTab=")) {
      if (!plan.runFlags) plan.runFlags = {} as any
      plan.runFlags.hTab = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Run UNet=")) {
      if (!plan.runFlags) plan.runFlags = {} as any
      plan.runFlags.uNet = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Run Sediment=")) {
      if (!plan.runFlags) plan.runFlags = {} as any
      plan.runFlags.sediment = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Run Post Process=")) {
      if (!plan.runFlags) plan.runFlags = {} as any
      plan.runFlags.postProcess = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Run WQNet=")) {
      if (!plan.runFlags) plan.runFlags = {} as any
      plan.runFlags.wqNet = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Run RasMapper=")) {
      if (!plan.runFlags) plan.runFlags = {} as any
      plan.runFlags.rasMapper = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Computation Interval=")) {
      plan.computationInterval = parseDurationLine(line)
    } else if (line.startsWith("Output Interval=")) {
      plan.outputInterval = parseDurationLine(line)
    } else if (line.startsWith("Instantaneous Interval=")) {
      plan.instantaneousInterval = parseDurationLine(line)
    } else if (line.startsWith("Mapping Interval=")) {
      plan.mappingInterval = parseDurationLine(line)
    } else if (line.startsWith("Write IC File=")) {
      plan.writeICFile = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Write IC File at Fixed Date Time=")) {
      plan.writeICFileAtFixedDateTime = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Write IC File at Sim End=")) {
      plan.writeICFileAtSimEnd = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Echo Input=")) {
      plan.echoInput = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Echo Parameters=")) {
      plan.echoParameters = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Echo Output=")) {
      plan.echoOutput = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Write Detailed=")) {
      plan.writeDetailed = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Parabolic Critical Depth=")) {
      plan.parabolicCriticalDepth = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Check Data=")) {
      plan.checkData = parseKeyValue(line).value === "True"
    } else if (line.startsWith("Global Log Level=")) {
      plan.globalLogLevel = parseInt(parseKeyValue(line).value)
    } else if (line.startsWith("Log Output Level=")) {
      plan.logOutputLevel = parseInt(parseKeyValue(line).value)
    } else if (line.startsWith("Friction Slope Method=")) {
      plan.frictionSlopeMethod = parseInt(parseKeyValue(line).value)
    } else if (line.startsWith("Unsteady Friction Slope Method=")) {
      plan.unsteadyFrictionSlopeMethod = parseInt(parseKeyValue(line).value)
    } else if (line.startsWith("Unsteady Bridges Friction Slope Method=")) {
      plan.unsteadyBridgesFrictionSlopeMethod = parseInt(parseKeyValue(line).value)
    } else if (line.startsWith("Global Vel Dist=")) {
      //
    } else if (line.startsWith("Encroach Param=")) {
      //
    } else if (line.startsWith("UNet Settings")) {
      // TODO: Parse UNet settings block
    } else if (line.startsWith("UNet 2D Area")) {
      // TODO: Parse UNet 2D Area settings
    } else if (line.startsWith("UNet D1D2 Settings")) {
      // TODO: Parse UNet D1D2 settings
    } else if (line.startsWith("Stage Flow Hydrograph")) {
      // TODO: Parse stage flow hydrograph
    } else if (line.startsWith("HDF Settings")) {
      // TODO: Parse HDF settings
    } else if (line.startsWith("Breach Location")) {
      // TODO: Parse breach location
    } else if (line.startsWith("Calibration Settings")) {
      // TODO: Parse calibration settings
    } else if (line.startsWith("Water Quality Settings")) {
      // TODO: Parse water quality settings
    } else if (line.startsWith("Sediment Settings")) {
      // TODO: Parse sediment settings
    }
    index++
  }

  return plan
}
