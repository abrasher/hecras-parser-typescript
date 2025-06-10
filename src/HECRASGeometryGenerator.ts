// HecRasFileGenerator.ts
import {
  Coordinate,
  StationElevationPoint,
  ManningSegment,
  VolumeElevationPoint,
} from "./models/common"
import { HECRASGeometry, ViewingRectangle, GisInfo } from "./models/geometry"
import { Reach } from "./models/reach"
import { CrossSection } from "./models/crossSection"
import { LateralStructure } from "./models/lateralStructure"
import { StorageArea } from "./models/storageArea"
import { Connection } from "./models/connection"
import { IneffectiveFlowArea } from "./models/ineffectiveFlowArea"
import {
  formatNumber,
  formatCoordinatesToString,
  formatStaElevToString,
  formatManningSegmentsToString,
  formatVolumeElevationToString,
} from "./utils" // Or './formatter'

const DEFAULT_COORD_PRECISION = 2
const DEFAULT_ELEV_PRECISION = 2
const DEFAULT_MANNING_PRECISION = 2 // For .0X
const DEFAULT_LENGTH_PRECISION = 2

export class HecRasFileGenerator {
  private lines: string[] = []
  private geometry: HECRASGeometry

  constructor(geometry: HECRASGeometry) {
    this.geometry = geometry
  }

  private addLine(line: string): void {
    this.lines.push(line)
  }

  private addLines(newLines: string[]): void {
    this.lines.push(...newLines)
  }

  private generateHeader(): void {
    if (this.geometry.title) {
      this.addLine(`Geom Title=${this.geometry.title}`)
    }
    if (this.geometry.programVersion) {
      this.addLine(`Program Version=${this.geometry.programVersion}`)
    }
    if (this.geometry.viewingRectangle) {
      const vr = this.geometry.viewingRectangle
      this.addLine(
        `Viewing Rectangle= ${formatNumber(vr.minX, DEFAULT_COORD_PRECISION)} , ${formatNumber(vr.maxY, DEFAULT_COORD_PRECISION)} , ${formatNumber(vr.maxX, DEFAULT_COORD_PRECISION)} , ${formatNumber(vr.minY, DEFAULT_COORD_PRECISION)} `,
      )
    }
    this.addLine("") // Empty line after header
  }

  private generateReach(reach: Reach): void {
    this.addLine(`River Reach=${reach.riverName},${reach.reachName}`)
    if (reach.centerline.length > 0) {
      this.addLine(`Reach XY= ${reach.centerline.length} `) // Note trailing space
      this.addLines(
        formatCoordinatesToString(reach.centerline, 2, DEFAULT_COORD_PRECISION),
      )
    }
    if (reach.textPosition) {
      this.addLine(
        `Rch Text X Y=${formatNumber(reach.textPosition.x, DEFAULT_COORD_PRECISION)},${formatNumber(reach.textPosition.y, DEFAULT_COORD_PRECISION)}`,
      )
    }
    // Assuming default "Reverse River Text= 0"
    this.addLine("Reverse River Text= 0 ") // Note trailing space
    this.addLine("")

    reach.crossSections.forEach((xs) => this.generateCrossSection(xs))
    reach.lateralStructures.forEach((ls) => this.generateLateralStructure(ls))
  }

  private generateCrossSection(xs: CrossSection): void {
    const l = formatNumber(xs.lengthL, DEFAULT_LENGTH_PRECISION, "")
    const ch = formatNumber(xs.lengthCh, DEFAULT_LENGTH_PRECISION, "")
    const r = formatNumber(xs.lengthR, DEFAULT_LENGTH_PRECISION, "")
    this.addLine(
      `Type RM Length L Ch R = 1 ,${formatNumber(xs.riverStation, DEFAULT_LENGTH_PRECISION)},${l},${ch},${r}`,
    )

    if (xs.gisCutLine.length > 0) {
      this.addLine(`XS GIS Cut Line=${xs.gisCutLine.length}`)
      this.addLines(
        formatCoordinatesToString(xs.gisCutLine, 2, DEFAULT_COORD_PRECISION),
      ) // HEC-RAS can have 2 or more per line
    }
    if (xs.lastEditedTime) {
      this.addLine(`Node Last Edited Time=${xs.lastEditedTime}`)
    }
    if (xs.staElevData.length > 0) {
      this.addLine(`#Sta/Elev= ${xs.staElevData.length} `)
      this.addLines(
        formatStaElevToString(xs.staElevData, 5, DEFAULT_ELEV_PRECISION),
      )
    }
    if (xs.manningSegments.length > 0) {
      // The first number is the count of actual segments (station-nVal pairs)
      this.addLine(`#Mann= ${xs.manningSegments.length} , 0 , 0 `)
      this.addLines(
        formatManningSegmentsToString(
          xs.manningSegments,
          DEFAULT_MANNING_PRECISION,
        ),
      )
    }
    if (xs.bankStations.left !== null && xs.bankStations.right !== null) {
      this.addLine(
        `Bank Sta=${formatNumber(xs.bankStations.left, DEFAULT_ELEV_PRECISION)},${formatNumber(xs.bankStations.right, DEFAULT_ELEV_PRECISION)}`,
      )
    }
    // Assuming default for XS Rating Curve and HTab for now, add if parsed
    this.addLine("XS Rating Curve= 0 ,0")
    if (xs.staElevData.length > 0) {
      // Try to get a reasonable starting elevation for HTab
      const minElev = Math.min(...xs.staElevData.map((p) => p.elevation))
      this.addLine(
        `XS HTab Starting El and Incr=${formatNumber(minElev + 0.01, 2)},0.5, 100 `,
      ) // Approximate
    } else {
      this.addLine(`XS HTab Starting El and Incr=0,0.5, 100 `) // Fallback
    }
    this.addLine("XS HTab Horizontal Distribution= 5 , 5 , 5 ")
    this.addLine(
      `Exp/Cntr=${formatNumber(xs.expansionCoefficient, 1)},${formatNumber(xs.contractionCoefficient, 1)}`,
    )

    if (xs.ineffectiveFlowAreas.length > 0) {
      // Count only non-permanent if they are separate in the file structure
      // For simplicity, let's assume the count in #XS Ineff is total for now
      this.addLine(`#XS Ineff= ${xs.ineffectiveFlowAreas.length} ,-1 `) // -1 seems common
      xs.ineffectiveFlowAreas.forEach((ineff) => {
        // Example formatting for ineffective flow area
        const staStr = formatNumber(
          ineff.station,
          DEFAULT_ELEV_PRECISION,
        ).padStart(8, " ")
        const elevStr = formatNumber(
          ineff.elevation,
          DEFAULT_ELEV_PRECISION,
        ).padStart(8, " ")
        // The original file has the elevation twice for some reason, and an "18"
        // This is an example, exact replication of this specific line's extra numbers is tricky
        // For now, we'll just output station and elevation. The "18" might be a flow type.
        // If the original line was "808.43 1381.62952.5518", it's station, station, elevation+flowtype
        // Our parser stores station and elevation. We'll stick to that.
        this.addLine(
          `${staStr}${elevStr}${formatNumber(ineff.elevation, DEFAULT_ELEV_PRECISION)}${ineff.isPermanent ? "18" : ""}`,
        ) // Approximation
        if (ineff.isPermanent) {
          this.addLine("Permanent Ineff=")
          this.addLine(ineff.isPermanent ? "       T" : "       F")
        }
      })
    }
    this.addLine("") // Empty line after XS
  }

  private generateLateralStructure(ls: LateralStructure): void {
    this.addLine(
      `Type RM Length L Ch R = 6 ,${formatNumber(ls.riverStation, 0)}   ,,,`,
    ) // Lengths usually blank for LS
    this.addLine(`Node Last Edited Time=Dec/30/1899 00:00:00`) // Default if not parsed
    this.addLine(`Lateral Weir Pos= 0 `)
    // Simplified Lateral Weir End for now, this can be complex
    this.addLine(
      `Lateral Weir End=                ,                ,        ,${ls.associatedRiverStation || "150"}             `,
    )
    this.addLine(`Lateral Weir Distance=1`) // Example default
    this.addLine(`Lateral Weir TW Multiple XS=0`)
    this.addLine(`Lateral Weir WD=${formatNumber(ls.weirWidth, 0)}`)
    this.addLine(`Lateral Weir Coef=${formatNumber(ls.weirCoefficient, 0)}`)
    this.addLine(`Lateral Weir WSCriteria=-1 `)
    this.addLine(`Lateral Weir Flap Gates= 0 `)
    this.addLine(`Lateral Weir Hagers EQN= 0 ,,,,,`)
    this.addLine(`Lateral Weir SS=0.05,0.05,`)
    this.addLine(`Lateral Weir Type= 0 `)
    this.addLine(`Lateral Weir Connection Pos and Dist= 0 ,`)
    if (ls.stationElevationData.length > 0) {
      this.addLine(`Lateral Weir SE= ${ls.stationElevationData.length} `)
      this.addLines(
        formatStaElevToString(
          ls.stationElevationData,
          2,
          DEFAULT_ELEV_PRECISION,
        ),
      ) // Often 2 pairs per line
    }
    this.addLine(`Lateral Weir Centerline= 0 `)
    this.addLine(
      `Lateral Weir HW RS Station=${ls.associatedRiverStation || formatNumber(ls.riverStation, DEFAULT_LENGTH_PRECISION)},-1`,
    )
    this.addLine(`Lateral Weir TW RS Station=,0`) // Assuming default
    this.addLine(`LW Div RC= 0 ,False,`)
    this.addLine("")
  }

  private generateStorageArea(sa: StorageArea): void {
    const centroidX = sa.centroid
      ? formatNumber(sa.centroid.x, DEFAULT_COORD_PRECISION)
      : ""
    const centroidY = sa.centroid
      ? formatNumber(sa.centroid.y, DEFAULT_COORD_PRECISION)
      : ""
    this.addLine(
      `Storage Area=${formatNumber(sa.id, 0)}             ,${centroidX},${centroidY}`,
    )
    if (sa.surfaceLine.length > 0) {
      this.addLine(`Storage Area Surface Line= ${sa.surfaceLine.length} `)
      // SA surface lines in the example have more spacing
      sa.surfaceLine.forEach((coord) => {
        this.addLine(
          `${formatNumber(coord.x, DEFAULT_COORD_PRECISION).padStart(17)} ${formatNumber(coord.y, DEFAULT_COORD_PRECISION).padStart(23)}`,
        )
      })
    }
    this.addLine("Storage Area Type= 1 ") // Assuming type 1
    this.addLine("Storage Area Area=") // Usually blank
    this.addLine("Storage Area Min Elev=") // Usually blank
    if (sa.volumeElevationData.length > 0) {
      this.addLine(`Storage Area Vol Elev= ${sa.volumeElevationData.length} `)
      this.addLines(formatVolumeElevationToString(sa.volumeElevationData, 5, 3)) // Often 3 decimal places for volume
    }
    this.addLine("Storage Area Is2D=0")
    this.addLine("Storage Area Point Generation Data=,,,")
    this.addLine("Storage Area 2D Points= 0 ")
    this.addLine("Storage Area 2D PointsPerimeterTime=Dec/30/1899 00:00:00") // Default
    if (sa.manningsN !== null) {
      this.addLine(`Storage Area Mannings=${formatNumber(sa.manningsN, 2)}`)
    }
    this.addLine("2D Cell Volume Filter Tolerance=0.01")
    this.addLine("2D Face Profile Filter Tolerance=0.01")
    this.addLine("2D Face Area Elevation Profile Filter Tolerance=0.01")
    this.addLine("2D Face Area Elevation Conveyance Ratio=0.02")
    this.addLine("")
  }

  private generateConnection(conn: Connection): void {
    this.addLine(
      `Connection=${formatNumber(conn.id, 0)}             ,${conn.description || ""}`,
    )
    if (conn.line.length > 0) {
      this.addLine(`Connection Line=${conn.line.length}`)
      this.addLines(
        formatCoordinatesToString(conn.line, 2, DEFAULT_COORD_PRECISION),
      ) // Usually 2 pairs
    }
    this.addLine(`Connection Last Edited Time=Dec/30/1899 00:00:00`) // Default
    if (conn.upSA) this.addLine(`Connection Up SA=${conn.upSA}`)
    if (conn.dnSA) this.addLine(`Connection Dn SA=${conn.dnSA}`)
    this.addLine(`Conn Routing Type= 1 `) // Assuming weir
    this.addLine(`Conn Use RC Family=False`)
    this.addLine(`Conn OverFlow Method 2D=True`)
    this.addLine(`Conn Weir WD=${formatNumber(conn.weirWidth, 0)}`)
    this.addLine(`Conn Weir Coef=${formatNumber(conn.weirCoefficient, 0)}`)
    this.addLine(`Conn Weir Is Ogee= 0 `)
    this.addLine(`Conn Simple Spill Pos Coef=0.05`)
    this.addLine(`Conn Simple Spill Neg Coef=0.05`)
    if (conn.weirStationElevation.length > 0) {
      this.addLine(`Conn Weir SE= ${conn.weirStationElevation.length} `)
      // Weir SE is often just 2 points (start/end) on one line
      this.addLines(
        formatStaElevToString(
          conn.weirStationElevation,
          conn.weirStationElevation.length,
          DEFAULT_ELEV_PRECISION,
        ),
      )
    }
    this.addLine(`Conn HTab HWMax=960`) // Common default
    this.addLine("")
  }

  private generateGisInfo(): void {
    const gi = this.geometry.gisInfo
    if (gi.rasterPath)
      this.addLine(`Geom Raster=${gi.rasterPath},True,image,, 0 `) // Assuming defaults for other parts
    this.addLine("Use User Specified Reach Order=0") // Assuming
    if (this.geometry.reaches.length > 0) {
      const reachOrder = this.geometry.reaches
        .map((r) => `${r.riverName.padEnd(16)},${r.reachName.padEnd(16)}`)
        .join("")
      this.addLine(`User Specified Reach Order=${reachOrder}`)
    }
    if (gi.units) this.addLine(`GIS Units=${gi.units}`)
    if (gi.dtmType) this.addLine(`GIS DTM Type=${gi.dtmType}`)
    if (gi.dtmPath) this.addLine(`GIS DTM=${gi.dtmPath}`)
    if (gi.streamLayer) this.addLine(`GIS Stream Layer=${gi.streamLayer}`)
    if (gi.xsCutLineLayer)
      this.addLine(`GIS Cross Section Layer=${gi.xsCutLineLayer}`)
    if (gi.projection) this.addLine(`GIS Map Projection=${gi.projection}`)
    this.addLine("GIS Projection Zone=") // Often blank
    if (gi.datum) this.addLine(`GIS Datum=${gi.datum}`)
    this.addLine("GIS Vertical Datum=") // Often blank
    // GIS Data Extents - needs careful formatting if present
    this.addLine("")
    this.addLine("GIS Ratio Cuts To Invert=-1")
    this.addLine("GIS Limit At Bridges=0")
    this.addLine("Composite Channel Slope=5") // Common default
    this.addLine(
      "Write typescript browser code that will parse the provided file.  The file provided is HECRAS geometry file for a 2D model. The file will be uploaded by the user.",
    ) // This line from prompt, unusual for g-file
    this.addLine("")
    this.addLine(
      "I want the code quality to be high, modular. Use specialized classes for each geometry type found.",
    )
    this.addLine("")
    this.addLine("Follow DRY")
  }

  public generateFileContent(): string {
    this.lines = [] // Reset
    this.generateHeader()
    this.geometry.reaches.forEach((reach) => this.generateReach(reach))
    this.geometry.storageAreas.forEach((sa) => this.generateStorageArea(sa))
    this.geometry.connections.forEach((conn) => this.generateConnection(conn))
    this.generateGisInfo()
    // Add any other final sections if parsed (e.g., LCMann)
    this.addLine("LCMann Time=Dec/30/1899 00:00:00")
    this.addLine("LCMann Region Time=Dec/30/1899 00:00:00")
    this.addLine("LCMann Table=0")
    this.addLine("Chan Stop Cuts=-1 ")
    this.addLine("") // Final empty line often present
    this.addLine("")

    return this.lines.join("\n")
  }
}
