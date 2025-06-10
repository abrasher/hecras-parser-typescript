// models/lateralStructure.ts
import type { StationElevationPoint } from "./common"

export class LateralStructure {
  riverStation: number // The RM from "Type RM Length L Ch R = 6, RM, ..."
  associatedRiverStation: string | null = null // From "Lateral Weir HW RS Station="
  description: string = "Lateral Weir" // Default
  weirWidth: number = 0
  weirCoefficient: number = 0
  stationElevationData: StationElevationPoint[] = []
  // Add other properties like TWMultipleXS, WSCriteria, FlapGates etc.

  constructor(riverStation: number) {
    this.riverStation = riverStation
  }
}
