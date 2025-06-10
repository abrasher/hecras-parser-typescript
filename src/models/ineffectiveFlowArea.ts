// models/ineffectiveFlowArea.ts

export class IneffectiveFlowArea {
  station: number
  elevation: number
  isPermanent: boolean = false // For Permanent Ineff= F/T

  constructor(
    station: number,
    elevation: number,
    isPermanent: boolean = false, // For Permanent Ineff= F/T
  ) {
    this.station = station
    this.elevation = elevation
    this.isPermanent = isPermanent
  }

  static fromString(
    line: string,
    isPermanent: boolean = false,
  ): IneffectiveFlowArea | null {
    const parts = line.trim().split(/\s+/).map(parseFloat)
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return new IneffectiveFlowArea(parts[0], parts[1], isPermanent)
    }
    return null
  }
}
