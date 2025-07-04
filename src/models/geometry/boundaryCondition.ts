import type { Coordinate } from "./common"

export interface TextPosition {
  x: string
  y: string
}

export interface BoundaryCondition {
  name: string
  storageArea: string
  startPosition: Coordinate
  middlePosition: Coordinate
  endPosition: Coordinate
  arc: number
  arcCoordinates: Coordinate[]
  textPosition: TextPosition
}
