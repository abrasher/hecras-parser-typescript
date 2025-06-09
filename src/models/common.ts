// models/common.ts
export interface Coordinate {
    x: number;
    y: number;
}

export interface StationElevationPoint {
    station: number;
    elevation: number;
}

export interface ManningSegment {
    station: number;
    nValue: number;
    isDummy?: boolean; // For the '0' in HEC-RAS files before station
}

export interface VolumeElevationPoint {
    elevation: number;
    volume: number; // Or area, depending on context
}

