// HecRasGeometryParser.ts
import {
  parseCoordinates,
  parseStaElev,
  parseLineToNumbers,
  parseCommaSeparated,
  parseKeyValue,
  parseVolumeElevation,
} from "./utils"
import {
  HECRASGeometry,
  type ViewingRectangle,
  type GisInfo,
} from "./models/geometry"
import { Reach } from "./models/reach"
import { CrossSection } from "./models/crossSection"
import { LateralStructure } from "./models/lateralStructure"
import { StorageArea } from "./models/storageArea"
import { Connection } from "./models/connection"
import { IneffectiveFlowArea } from "./models/ineffectiveFlowArea"

export class HecRasGeometryParser {
  private lines: string[] = []
  private currentIndex: number = 0
  private geometry: HECRASGeometry

  constructor() {
    this.geometry = new HECRASGeometry()
  }

  private getCurrentLine(): string | null {
    return this.lines[this.currentIndex] ?? null
  }

  private advanceLine(count: number = 1): void {
    this.currentIndex += count
  }

  private parseHeader(): void {
    let line = this.getCurrentLine()
    while (line !== null) {
      if (line.startsWith("Geom Title=")) {
        this.geometry["Geom Title"] = parseKeyValue(line)?.value || null
      } else if (line.startsWith("Program Version=")) {
        this.geometry["Program Version"] = parseKeyValue(line)?.value || null
      } else if (line.startsWith("Viewing Rectangle=")) {
        const values = parseKeyValue(line)?.value.split(",").map(parseFloat)
        if (values && values.length === 4) {
          // Assign left, right, top, bottom as expected by the test
          this.geometry["Viewing Rectangle"] = {
            left: values[0],
            right: values[1],
            top: values[2],
            bottom: values[3],
          }
        }
      } else if (line.startsWith("River Reach=")) {
        break // End of header, start of reaches
      } else if (line.startsWith("Storage Area=")) {
        break // Could start with SAs
      }
      this.advanceLine()
      line = this.getCurrentLine()
    }
  }

  private parseReachData(reach: Reach): void {
    let line = this.getCurrentLine()
    if (line?.startsWith("Reach XY=")) {
      const numPoints = parseInt(parseKeyValue(line)?.value || "0")
      this.advanceLine()
      let pointsCollected = 0
      while (
        pointsCollected < numPoints &&
        this.currentIndex < this.lines.length
      ) {
        const coordLine = this.lines[this.currentIndex]
        if (
          !coordLine ||
          coordLine.trim() === "" ||
          this.isNewSection(coordLine)
        )
          break
        const newCoords = parseCoordinates(coordLine)
        reach.centerline.push(...newCoords)
        pointsCollected += newCoords.length
        this.advanceLine()
      }
    }
    line = this.getCurrentLine()
    if (line?.startsWith("Rch Text X Y=")) {
      const coordsStr = parseKeyValue(line)?.value
      if (coordsStr) {
        const [x, y] = coordsStr.split(",").map(parseFloat)
        if (!isNaN(x) && !isNaN(y)) {
          reach.textPosition = { x, y }
        }
      }
      this.advanceLine()
    }
  }

  private isNewSection(line: string): boolean {
    const keywords = [
      "River Reach=",
      "Type RM Length L Ch R =",
      "Storage Area=",
      "Connection=",
      "LCMann Time=",
      "Geom Raster=",
    ]
    return keywords.some((kw) => line.startsWith(kw)) || line.trim() === ""
  }

  private parseCrossSectionData(xs: CrossSection): void {
    let line = this.getCurrentLine()
    while (line !== null && !this.isNewSection(line)) {
      if (line.startsWith("XS GIS Cut Line=")) {
        const numPoints = parseInt(parseKeyValue(line)?.value || "0")
        this.advanceLine()
        let pointsCollected = 0
        while (
          pointsCollected < numPoints &&
          this.currentIndex < this.lines.length
        ) {
          const gisLine = this.lines[this.currentIndex]
          if (!gisLine || this.isNewSection(gisLine)) break
          const newCoords = parseCoordinates(gisLine)
          xs.gisCutLine.push(...newCoords)
          pointsCollected += newCoords.length
          this.advanceLine()
          if (pointsCollected >= numPoints) break
        }
      } else if (line.startsWith("Node Last Edited Time=")) {
        xs.lastEditedTime = parseKeyValue(line)?.value || null
        this.advanceLine()
      } else if (line.startsWith("#Sta/Elev=")) {
        const numPoints = parseInt(parseKeyValue(line)?.value || "0")
        this.advanceLine()
        let pointsCollected = 0
        while (
          pointsCollected < numPoints &&
          this.currentIndex < this.lines.length
        ) {
          const staElevLine = this.lines[this.currentIndex]
          if (
            !staElevLine ||
            this.isNewSection(staElevLine) ||
            /^[A-Za-z#]/.test(staElevLine.trimStart())
          )
            break
          const newPoints = parseStaElev(staElevLine)
          xs.staElevData.push(...newPoints)
          pointsCollected += newPoints.length
          this.advanceLine()
          if (pointsCollected >= numPoints) break
        }
      } else if (line.startsWith("#Mann=")) {
        const parts = parseCommaSeparated(parseKeyValue(line)?.value || "")
        const numSegments = parseInt(parts[0] || "0") // First number is count of segments
        this.advanceLine()
        for (
          let k = 0;
          k < numSegments && this.currentIndex < this.lines.length;

        ) {
          const manningLine = this.lines[this.currentIndex]
          if (
            !manningLine ||
            this.isNewSection(manningLine) ||
            /^[A-Za-z#]/.test(manningLine.trimStart())
          )
            break
          const values = parseLineToNumbers(manningLine)
          for (let j = 0; j < values.length; j += 3) {
            // 0 (dummy), station, nVal
            if (j + 2 < values.length) {
              xs.manningSegments.push({
                station: values[j + 1],
                nValue: values[j + 2],
                isDummy: values[j] === 0,
              })
              k++
            }
          }
          this.advanceLine()
        }
      } else if (line.startsWith("Bank Sta=")) {
        const [left, right] = (parseKeyValue(line)?.value || "")
          .split(",")
          .map(parseFloat)
        xs.bankStations = {
          left: isNaN(left) ? null : left,
          right: isNaN(right) ? null : right,
        }
        this.advanceLine()
      } else if (line.startsWith("Exp/Cntr=")) {
        const [exp, cntr] = (parseKeyValue(line)?.value || "")
          .split(",")
          .map(parseFloat)
        xs.expansionCoefficient = exp
        xs.contractionCoefficient = cntr
        this.advanceLine()
      } else if (line.startsWith("#XS Ineff=")) {
        const parts = parseKeyValue(line)!.value.split(",")
        const numIneff = parseInt(parts[0])
        // Ineff flow areas are on the next line
        this.advanceLine()
        for (
          let k = 0;
          k < numIneff && this.currentIndex < this.lines.length;
          k++
        ) {
          const ineffLine = this.lines[this.currentIndex]
          if (
            !ineffLine ||
            this.isNewSection(ineffLine) ||
            /^[A-Za-z#]/.test(ineffLine.trimStart())
          )
            break
          const ineff = IneffectiveFlowArea.fromString(ineffLine)
          if (ineff) xs.ineffectiveFlowAreas.push(ineff)
          this.advanceLine()
        }
      } else if (line.startsWith("Permanent Ineff=")) {
        const isPermanent =
          (parseKeyValue(line)?.value || "F").toUpperCase() === "T"
        // Apply to the last parsed ineffective flow area if any
        if (xs.ineffectiveFlowAreas.length > 0) {
          xs.ineffectiveFlowAreas[
            xs.ineffectiveFlowAreas.length - 1
          ].isPermanent = isPermanent
        }
        this.advanceLine()
      } else {
        this.advanceLine() // Skip unhandled lines within XS
      }
      line = this.getCurrentLine()
    }
  }

  private parseLateralStructureData(ls: LateralStructure): void {
    let line = this.getCurrentLine()
    while (line !== null && !this.isNewSection(line)) {
      if (line.startsWith("Lateral Weir WD=")) {
        ls.weirWidth = parseFloat(parseKeyValue(line)?.value || "0")
      } else if (line.startsWith("Lateral Weir Coef=")) {
        ls.weirCoefficient = parseFloat(parseKeyValue(line)?.value || "0")
      } else if (line.startsWith("Lateral Weir SE=")) {
        const numPoints = parseInt(parseKeyValue(line)?.value || "0")
        this.advanceLine()
        let pointsCollected = 0
        while (
          pointsCollected < numPoints &&
          this.currentIndex < this.lines.length
        ) {
          const seLine = this.lines[this.currentIndex]
          if (
            !seLine ||
            this.isNewSection(seLine) ||
            /^[A-Za-z#]/.test(seLine.trimStart())
          )
            break
          const newPoints = parseStaElev(seLine)
          ls.stationElevationData.push(...newPoints)
          pointsCollected += newPoints.length
          this.advanceLine()
          if (pointsCollected >= numPoints) break
        }
      } else if (line.startsWith("Lateral Weir HW RS Station=")) {
        const parts = parseKeyValue(line)?.value.split(",")
        if (parts && parts[0]) ls.associatedRiverStation = parts[0].trim()
      }
      // Add more Lateral Weir specific parsing here
      this.advanceLine()
      line = this.getCurrentLine()
    }
  }

  private parseStorageAreaData(sa: StorageArea): void {
    let line = this.getCurrentLine()
    while (line !== null && !this.isNewSection(line)) {
      if (line.startsWith("Storage Area Surface Line=")) {
        const numPoints = parseInt(parseKeyValue(line)?.value || "0")
        this.advanceLine()
        let pointsCollected = 0
        while (
          pointsCollected < numPoints &&
          this.currentIndex < this.lines.length
        ) {
          const surfLine = this.lines[this.currentIndex]
          if (
            !surfLine ||
            this.isNewSection(surfLine) ||
            /^[A-Za-z#]/.test(surfLine.trimStart())
          )
            break
          const newCoords = parseCoordinates(surfLine)
          sa.surfaceLine.push(...newCoords)
          pointsCollected += newCoords.length
          this.advanceLine()
          if (pointsCollected >= numPoints) break
        }
      } else if (line.startsWith("Storage Area Vol Elev=")) {
        const numPoints = parseInt(parseKeyValue(line)?.value || "0")
        this.advanceLine()
        let pointsCollected = 0
        while (
          pointsCollected < numPoints &&
          this.currentIndex < this.lines.length
        ) {
          const volElevLine = this.lines[this.currentIndex]
          if (
            !volElevLine ||
            this.isNewSection(volElevLine) ||
            /^[A-Za-z#]/.test(volElevLine.trimStart())
          )
            break
          const newPoints = parseVolumeElevation(volElevLine)
          sa.volumeElevationData.push(...newPoints)
          pointsCollected += newPoints.length
          this.advanceLine()
          if (pointsCollected >= numPoints) break
        }
      } else if (line.startsWith("Storage Area Mannings=")) {
        sa.manningsN = parseFloat(parseKeyValue(line)?.value || "0")
        this.advanceLine()
      }
      // Add more SA specific parsing here
      else {
        this.advanceLine()
      }
      line = this.getCurrentLine()
    }
  }

  private parseConnectionData(conn: Connection): void {
    let line = this.getCurrentLine()
    while (line !== null && !this.isNewSection(line)) {
      if (line.startsWith("Connection Line=")) {
        const numPoints = parseInt(parseKeyValue(line)?.value || "0")
        this.advanceLine()
        let pointsCollected = 0
        while (
          pointsCollected < numPoints &&
          this.currentIndex < this.lines.length
        ) {
          const connLine = this.lines[this.currentIndex]
          if (
            !connLine ||
            this.isNewSection(connLine) ||
            /^[A-Za-z#]/.test(connLine.trimStart())
          )
            break
          const newCoords = parseCoordinates(connLine)
          conn.line.push(...newCoords)
          pointsCollected += newCoords.length
          this.advanceLine()
          if (pointsCollected >= numPoints) break
        }
      } else if (line.startsWith("Connection Up SA=")) {
        conn.upSA = parseKeyValue(line)?.value || null
        this.advanceLine()
      } else if (line.startsWith("Connection Dn SA=")) {
        conn.dnSA = parseKeyValue(line)?.value || null
        this.advanceLine()
      } else if (line.startsWith("Conn Weir WD=")) {
        conn.weirWidth = parseFloat(parseKeyValue(line)?.value || "0")
        this.advanceLine()
      } else if (line.startsWith("Conn Weir Coef=")) {
        conn.weirCoefficient = parseFloat(parseKeyValue(line)?.value || "0")
        this.advanceLine()
      } else if (line.startsWith("Conn Weir SE=")) {
        const numPoints = parseInt(parseKeyValue(line)?.value || "0")
        this.advanceLine()
        let pointsCollected = 0
        while (
          pointsCollected < numPoints &&
          this.currentIndex < this.lines.length
        ) {
          const seLine = this.lines[this.currentIndex]
          if (
            !seLine ||
            this.isNewSection(seLine) ||
            /^[A-Za-z#]/.test(seLine.trimStart())
          )
            break
          const newPoints = parseStaElev(seLine)
          conn.weirStationElevation.push(...newPoints)
          pointsCollected += newPoints.length
          this.advanceLine()
          if (pointsCollected >= numPoints) break
        }
      }
      // Add more Connection specific parsing here
      else {
        this.advanceLine()
      }
      line = this.getCurrentLine()
    }
  }

  private parseGisInfo(): void {
    let line = this.getCurrentLine()
    while (line !== null) {
      const kv = parseKeyValue(line)
      if (kv) {
        switch (kv.key) {
          case "Geom Raster":
            this.geometry.gisInfo.rasterPath = kv.value.split(",")[0]
            break
          case "GIS Units":
            this.geometry.gisInfo.units = kv.value
            break
          case "GIS DTM Type":
            this.geometry.gisInfo.dtmType = kv.value
            break
          case "GIS DTM":
            this.geometry.gisInfo.dtmPath = kv.value
            break
          case "GIS Stream Layer":
            this.geometry.gisInfo.streamLayer = kv.value
            break
          case "GIS Cross Section Layer":
            this.geometry.gisInfo.xsCutLineLayer = kv.value
            break
          case "GIS Map Projection":
            this.geometry.gisInfo.projection = kv.value
            break
          case "GIS Datum":
            this.geometry.gisInfo.datum = kv.value
            break
          default: // Store any other GIS related key-value pairs
            if (kv.key.startsWith("GIS")) {
              this.geometry.gisInfo[kv.key] = kv.value
            }
            break
        }
      }
      this.advanceLine()
      line = this.getCurrentLine()
      // Stop if a non-GIS related line or empty line is encountered (simplistic end condition)
      if (
        line === null ||
        line.trim() === "" ||
        (!kv?.key.startsWith("GIS") && !kv?.key.startsWith("Geom Raster"))
      ) {
        break
      }
    }
  }

  public parse(fileContent: string): HECRASGeometry {
    this.lines = fileContent.split(/\r\n|\r|\n/)
    this.currentIndex = 0
    this.geometry = new HECRASGeometry() // Reset for new parse

    this.parseHeader()

    let currentReach: Reach | null = null

    while (this.currentIndex < this.lines.length) {
      let line = this.getCurrentLine()
      if (!line) {
        this.advanceLine()
        continue
      }
      line = line.trimStart() // Keyword might have leading spaces

      if (line.startsWith("River Reach=")) {
        const [riverName, reachName] = (parseKeyValue(line)?.value || "")
          .split(",")
          .map((s) => s.trim())
        currentReach = new Reach(riverName, reachName)
        this.geometry.reaches.push(currentReach)
        this.advanceLine()
        this.parseReachData(currentReach)
      } else if (line.startsWith("Type RM Length L Ch R =")) {
        const parts = parseCommaSeparated(parseKeyValue(line)?.value || "")
        const type = parseInt(parts[0])
        const rm = parseFloat(parts[1])

        if (type === 1 && currentReach) {
          // Cross Section
          const xs = new CrossSection(rm)
          if (parts.length > 2 && parts[2].trim() !== "")
            xs.lengthL = parseFloat(parts[2])
          if (parts.length > 3 && parts[3].trim() !== "")
            xs.lengthCh = parseFloat(parts[3])
          if (parts.length > 4 && parts[4].trim() !== "")
            xs.lengthR = parseFloat(parts[4])
          currentReach.crossSections.push(xs)
          this.advanceLine()
          this.parseCrossSectionData(xs)
        } else if (type === 6 && currentReach) {
          // Lateral Structure
          const ls = new LateralStructure(rm)
          currentReach.lateralStructures.push(ls)
          this.advanceLine()
          this.parseLateralStructureData(ls)
        } else {
          this.advanceLine() // Unknown type or no current reach
        }
      } else if (line.startsWith("Storage Area=")) {
        const parts = parseKeyValue(line)!.value.split(",")
        const id = parseInt(parts[0])
        const x = parseFloat(parts[1])
        const y = parseFloat(parts[2])
        const sa = new StorageArea(id, x, y)
        this.geometry.storageAreas.push(sa)
        this.advanceLine()
        this.parseStorageAreaData(sa)
      } else if (line.startsWith("Connection=")) {
        const parts = parseKeyValue(line)!.value.split(",")
        const id = parseInt(parts[0])
        const conn = new Connection(id)
        // Optional description could be here
        if (parts.length > 1 && parts[1].trim() !== "") {
          conn.description = parts[1].trim()
        }
        this.geometry.connections.push(conn)
        this.advanceLine()
        this.parseConnectionData(conn)
      } else if (line.startsWith("Geom Raster=")) {
        // GIS info often at the end
        this.parseGisInfo()
      } else {
        this.advanceLine() // Skip unhandled lines
      }
    }
    return this.geometry
  }
}
