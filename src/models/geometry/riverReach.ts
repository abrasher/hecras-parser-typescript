import type { RiverReachSchema as RiverReachSchemaType } from "../../schemas/riverReachSchema"
import type { Coordinate } from "./common"
import type { UpstreamDownstreamValue } from "./common"

export enum CrossSectionType {
  NORMAL = 1,
  BRIDGE = 2,
  CULVERT = 3,
  MULTIPLE_OPENING = 4,
  INLINE_WEIR = 5,
  LATERAL_WEIR = 6,
}

export interface IneffectiveFlowArea {
  leftStation: number
  rightStation: number
  elevation: number
}

export interface BlockedObstruction {
  leftStation: number
  rightStation: number
  elevation: number
}

export interface CrossSection {
  type: CrossSectionType
  // River mile is a string to preserve formatting (e.g., "12.34", "12", "12.0")
  riverMile: string
  lengthLeft: number
  lengthChannel: number
  lengthRight: number
  gisLine: Coordinate[]
  lastEditedTime?: string
  stationElevation: [station: number, elevation: number][]
  manningValues?: number[][]
  ineffectiveFlowAreas?: [upstreamStn: number, downstreamStn: number, elevation: number][]
  permanentIneffective?: boolean[]
  blockedObstructions?: UpstreamDownstreamValue[]
  blockedObstructionCount?: number
  skewAngle?: number
  leftBankStation?: number
  rightBankStation?: number
  ratingCurveType?: number
  ratingCurveValue?: number
  htabStartingElevation?: number
  htabIncrement?: number
  htabCount?: number
  htabHorizontalDistribution?: number[]
  expansionContractionCoefficients?: {
    expansion: number
    contraction: number
  }
}

export type RiverReachCore = Omit<
  RiverReachSchemaType,
  "coordinates" | "textPosition" | "coordinateCount"
> & {
  coordinates: Coordinate[]
  textPosition?: Coordinate
  coordinateCount: number
}

export interface RiverReach extends RiverReachCore {
  crossSections: CrossSection[]
}

export interface LateralWeir {
  position: number // Lateral Weir Pos=
  end: {
    //Lateral Weir End=
    param1: string | null
    param2: string | null
    param3: string | null
    param4: string
  }
  distance: number // Lateral Weir Distance=
  twMultipleXS: number // Lateral Weir TW Multiple XS=
  width: number // Lateral Weir WD=
  coefficient: number // Lateral Weir Coef=

  // LW OverFlow Method 2D=
  use2DOverflowMethod?: boolean
  // LW OverFlow Use Velocity Into 2D=
  useVelocityInto2D?: boolean

  waterSurfaceCriteria: boolean // Lateral Weir WSCriteria=

  // Lateral Weir Flap Gates=
  // 0 = No flap gates
  // 1 = Flaps prevent Negative Flow
  // 2 = Flaps prevent Positive Flow
  flapGates: 0 | 1 | 2

  // Lateral Weir Hagers EQN=
  hagesEquation: {
    param1: number
    param2: number | null
    param3: number | null
    param4: number | null
    param5: number | null
    param6: number | null
  }
  // Lateral Weir SS=
  slipeSlope: [number, number]
  // Lateral Weir Type=
  type: number
  // Lateral Weir Connection Pos and Dist=
  connectionPosAndDist?: [number, number]

  // Lateral Weir SE=
  stationElevation: [number, number][]
  // Lateral Weir Centerline=
  centerline: [number, number][]

  // Lateral Weir HW RS User Defined=
  // True = -1, if line doesn't exist, it is false
  headWaterUserDefined?: true

  // Lateral Weir HW RS Station={X},{Y}
  // The line above repeats for each headwater connection
  headwaterConnections: [number, number][]

  // Lateral Weir TW RS User Defined=
  // True = -1, if line doesn't exist, it is false
  tailWaterUserDefined?: true
  // Lateral Weir TW RS Station={X},{Y}
  tailwaterConnections: []

  // LW Div RC= 0 ,True,,
  // Outlet flow computed as a function of upstream: Water Surface = False, Flow = True
  diversion: {
    useFlow: boolean // 2nd part of LW Div RC=

    stationForOutletFlows: number | null
    outletWidth: number | null
    curvePoints: [number, number][]

    // LW OutletRC Name=ratingcurve1
    // this property disappears if it is blank, likely can't be null
    ratingCurveName?: string
  }
}
