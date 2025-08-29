export interface LandCover {
  lastEdited: string
  lastEditedRegion: string
  table: LandCoverTable
  regions: LandCoverRegion[]
}

export interface LandCoverRegion {
  name: string
  table: LandCoverTable
  polygon: [x: number, y: number][]
}

export type LandCoverTable = [name: string, nValue: number][]
