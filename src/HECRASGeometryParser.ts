// HecRasGeometryParser.ts
import { parseCommaSeparated, parseKeyValue } from "./utils"
import { HECRASGeometry } from "./models/geometry"
import { Reach } from "./models/reach"
import { CrossSection } from "./models/crossSection"
import { LateralStructure } from "./models/lateralStructure"
import { StorageArea } from "./models/storageArea"
import { Connection } from "./models/connection"
import {
  parseHeader,
  parseReachData,
  parseCrossSectionData,
  parseLateralStructureData,
  parseStorageAreaData,
  parseConnectionData,
  parseGisInfo,
} from "./parsers"

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
    this.currentIndex = parseHeader(
      this.lines,
      this.currentIndex,
      this.geometry,
    )
  }

  private parseReachData(reach: Reach): void {
    this.currentIndex = parseReachData(
      this.lines,
      this.currentIndex,
      reach,
      this.isNewSection.bind(this),
    )
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
    this.currentIndex = parseCrossSectionData(
      this.lines,
      this.currentIndex,
      xs,
      this.isNewSection.bind(this),
    )
  }

  private parseLateralStructureData(ls: LateralStructure): void {
    this.currentIndex = parseLateralStructureData(
      this.lines,
      this.currentIndex,
      ls,
      this.isNewSection.bind(this),
    )
  }

  private parseStorageAreaData(sa: StorageArea): void {
    this.currentIndex = parseStorageAreaData(
      this.lines,
      this.currentIndex,
      sa,
      this.isNewSection.bind(this),
    )
  }

  private parseConnectionData(conn: Connection): void {
    this.currentIndex = parseConnectionData(
      this.lines,
      this.currentIndex,
      conn,
      this.isNewSection.bind(this),
    )
  }

  private parseGisInfo(): void {
    this.currentIndex = parseGisInfo(
      this.lines,
      this.currentIndex,
      this.geometry,
    )
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
        const id = parts[0].trim() // Keep as string and trim whitespace
        const x = parseFloat(parts[1])
        const y = parseFloat(parts[2])
        const sa = new StorageArea(id, x, y)
        this.geometry.storageAreas.push(sa)
        this.advanceLine()
        this.parseStorageAreaData(sa)
      } else if (line.startsWith("Connection=")) {
        console.log("Found Connection line:", line)
        const parts = parseKeyValue(line)!.value.split(",")
        // The first part is the connection ID (could be string or number)
        const id = parts[0].trim()
        console.log("Connection ID:", id)
        const conn = new Connection(id)
        // The remaining parts are coordinates or flags, not description
        // Description comes from a separate "Connection Desc=" line
        this.geometry.connections.push(conn)
        console.log(
          "Added connection, total connections:",
          this.geometry.connections.length,
        )
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
