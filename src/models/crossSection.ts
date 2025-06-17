import type {
  Coordinate,
  StationElevationPoint,
  ManningSegment,
} from "./common"
import type { IneffectiveFlowArea } from "./ineffectiveFlowArea"

export class CrossSection {
  riverStation: number
  lengthL: number = 0
  lengthCh: number = 0
  lengthR: number = 0
  gisCutLine: Coordinate[] = []
  lastEditedTime: string | null = null
  staElevData: StationElevationPoint[] = []
  manningSegments: ManningSegment[] = []
  bankStations: { left: number | null; right: number | null } = {
    left: null,
    right: null,
  }
  expansionCoefficient: number = 0
  contractionCoefficient: number = 0
  ineffectiveFlowAreas: IneffectiveFlowArea[] = []
  // Add other XS properties as needed: ratingCurve, htab, etc.

  constructor(riverStation: number) {
    this.riverStation = riverStation
  }
}
