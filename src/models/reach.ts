import type { Coordinate } from './common';
import { CrossSection } from './crossSection';
import { LateralStructure } from './lateralStructure';


export class Reach {
    riverName: string;
    reachName: string;
    centerline: Coordinate[] = [];
    textPosition: Coordinate | null = null;
    crossSections: CrossSection[] = [];
    lateralStructures: LateralStructure[] = [];

    constructor(riverName: string, reachName: string) {
        this.riverName = riverName;
        this.reachName = reachName;
    }
}