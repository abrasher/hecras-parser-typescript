import type { Coordinate } from "./common"
import { CrossSection } from "./crossSection"
import { LateralStructure } from "./lateralStructure"

export class Reach {
  riverName: string
  reachName: string
  private _centerline: Coordinate[] = []
  coordinates: Coordinate[] = [] // Add coordinates property for compatibility

  // Add getter for centerline to maintain backwards compatibility
  get centerline(): Coordinate[] {
    return this.coordinates.length > 0 ? this.coordinates : this._centerline
  }

  set centerline(coords: Coordinate[]) {
    this._centerline = coords
    this.coordinates = coords
  }
  textPosition: Coordinate | null = null
  crossSections: CrossSection[] = []
  lateralStructures: LateralStructure[] = []

  constructor(riverName: string, reachName: string) {
    this.riverName = riverName
    this.reachName = reachName
  }
}
