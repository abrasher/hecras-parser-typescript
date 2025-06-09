// models/connection.ts
import type { Coordinate, StationElevationPoint } from './common';

export class Connection {
    id: number;
    line: Coordinate[] = [];
    description: string | null = null;
    upSA: string | null = null;
    dnSA: string | null = null;
    weirWidth: number = 0;
    weirCoefficient: number = 0;
    weirStationElevation: StationElevationPoint[] = [];
    // Add other properties like routing type, culvert data etc.

    constructor(id: number) {
        this.id = id;
    }
}