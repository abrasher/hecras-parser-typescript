import { describe, it, expect } from "vitest"
import { serializeBridge, serializeBridgeConnection } from "../geometry/bridgeSerializer"
import type { BridgeConnection, BridgeCrossSection } from "../../models/geometry/bridge"

describe("BridgeSerializer", () => {
  describe("GIVEN a bridge with deck parameters", () => {
    it("WHEN serialized THEN formats deck section correctly", () => {
      const bridge: BridgeConnection = {
        bridge: {
          momentumEquationAddFriction: -1,
          momentumEquationAddWeight: 0,
          pressureFlowCriteria: 0,
          classBDefaults: 0,
          param5: 0,
          contractionCoefficient: 0.8,
          expansionCoefficient: 1.2,
        },
        pressureWeir: {
          value1: 1.0,
          value2: null,
          value3: 2.0,
          value4: null,
          value5: 3.0,
        },
        deckParameters: {
          deckDistance: 10.0,
          width: 50.0,
          weirCoefficient: 0.5,
          skew: 0.0,
          numberOfUpstreamStations: 2,
          numberOfDownstreamStations: 2,
          minLowCoordinate: null,
          maxHighCoordinate: null,
          maxSubmerge: 1.0,
          isOgee: 0,
          upstream: [
            { station: 100, highChord: 200, lowChord: 150 },
            { station: 200, highChord: 210, lowChord: 160 },
          ],
          downstream: [
            { station: 300, highChord: 220, lowChord: 170 },
            { station: 400, highChord: 230, lowChord: 180 },
          ],
        },
        bridgeCoefficients: {
          coef1: -1,
          coef2: 0,
          coef3: 0,
          coef4: null,
          coef5: null,
          coef6: null,
          coef7: 0.8,
          coef8: 0,
          coef9: 1.2,
          coef10: 0,
          coef11: null,
        },
        bridgeSkew: 0,
        insideCrossSections: [],
        externalCrossSections: [],
        upstreamIneffectiveFlowArea: {
          leftStation: 50,
          leftElevation: 100,
          rightStation: 150,
          rightElevation: 110,
        },
        downstreamIneffectiveFlowArea: {
          leftStation: 60,
          leftElevation: 105,
          rightStation: 160,
          rightElevation: 115,
        },
      }

      const result = serializeBridgeConnection(bridge)

      expect(result[0]).toBe("Conn BR: Bridge=-1,0,0,0,0,0.8,1.2")
      expect(result[1]).toBe("Conn BR: Pressure-Weir=1,,2,,3")
      expect(result[2]).toBe("Conn BR: Deck Dist Width WeirC Skew NumUp NumDn")
      expect(result[3]).toBe("10,50,0.5,0,2,2,,,1,0")
      expect(result[4]).toBe("     100     200") // upstream stations
      expect(result[5]).toBe("     200     210") // upstream high chords
      expect(result[6]).toBe("     150     160") // upstream low chords
      expect(result[7]).toBe("     300     400") // downstream stations
      expect(result[8]).toBe("     220     230") // downstream high chords
      expect(result[9]).toBe("     170     180") // downstream low chords
    })
  })

  describe("GIVEN a bridge with cross-sections", () => {
    it("WHEN serialized THEN formats cross-section data", () => {
      const crossSection: BridgeCrossSection = {
        id: 1,
        points: [
          { station: 100, elevation: 200 },
          { station: 150, elevation: 210 },
          { station: 200, elevation: 220 },
        ],
        bankStations: {
          sectionId: 1,
          leftBank: 110,
          rightBank: 190,
        },
        manningCoefficients: [
          { station: 100, nValue: 0.035 },
          { station: 200, nValue: 0.04 },
        ],
      }

      const bridge: BridgeConnection = {
        bridge: {
          momentumEquationAddFriction: -1,
          momentumEquationAddWeight: 0,
          pressureFlowCriteria: 0,
          classBDefaults: 0,
          param5: 0,
          contractionCoefficient: 0.8,
          expansionCoefficient: 1.2,
        },
        pressureWeir: {
          value1: 1.0,
          value2: null,
          value3: 2.0,
          value4: null,
          value5: 3.0,
        },
        deckParameters: {
          deckDistance: 10.0,
          width: 50.0,
          weirCoefficient: 0.5,
          skew: 0.0,
          numberOfUpstreamStations: 0,
          numberOfDownstreamStations: 0,
          minLowCoordinate: null,
          maxHighCoordinate: null,
          maxSubmerge: 1.0,
          isOgee: 0,
          upstream: [],
          downstream: [],
        },
        bridgeCoefficients: {
          coef1: -1,
          coef2: 0,
          coef3: 0,
          coef4: null,
          coef5: null,
          coef6: null,
          coef7: 0.8,
          coef8: 0,
          coef9: 1.2,
          coef10: 0,
          coef11: null,
        },
        bridgeSkew: 0,
        insideCrossSections: [crossSection],
        externalCrossSections: [],
        upstreamIneffectiveFlowArea: {
          leftStation: 50,
          leftElevation: 100,
          rightStation: 150,
          rightElevation: 110,
        },
        downstreamIneffectiveFlowArea: {
          leftStation: 60,
          leftElevation: 105,
          rightStation: 160,
          rightElevation: 115,
        },
      }

      const result = serializeBridgeConnection(bridge)

      const crossSectionStartIndex = result.findIndex((line) => line.startsWith("Conn BR: BR SE="))
      expect(result[crossSectionStartIndex]).toBe("Conn BR: BR SE=1,3")
      expect(result[crossSectionStartIndex + 1]).toBe("     100     200     150     210     200     220")
      expect(result[crossSectionStartIndex + 2]).toBe("Conn BR: BR Bank Sta=1,110,190")
      expect(result[crossSectionStartIndex + 3]).toBe("Conn BR: BR Manning=")
      expect(result[crossSectionStartIndex + 4]).toBe("     100   0.035     200    0.04")
    })
  })

  describe("GIVEN a bridge with pier data", () => {
    it("WHEN serialized THEN formats pier coordinates", () => {
      const bridge: BridgeConnection = {
        bridge: {
          momentumEquationAddFriction: -1,
          momentumEquationAddWeight: 0,
          pressureFlowCriteria: 0,
          classBDefaults: 0,
          param5: 0,
          contractionCoefficient: 0.8,
          expansionCoefficient: 1.2,
        },
        pressureWeir: {
          value1: 1.0,
          value2: 2.0,
          value3: 3.0,
          value4: 4.0,
          value5: 5.0,
        },
        deckParameters: {
          deckDistance: 10.0,
          width: 50.0,
          weirCoefficient: 0.5,
          skew: 0.0,
          numberOfUpstreamStations: 0,
          numberOfDownstreamStations: 0,
          minLowCoordinate: null,
          maxHighCoordinate: null,
          maxSubmerge: 1.0,
          isOgee: 0,
          upstream: [],
          downstream: [],
        },
        bridgeCoefficients: {
          coef1: -1,
          coef2: 0,
          coef3: 0,
          coef4: 1,
          coef5: 2,
          coef6: null,
          coef7: 0.8,
          coef8: 0,
          coef9: 1.2,
          coef10: 0,
          coef11: 3,
        },
        bridgeSkew: 45,
        insideCrossSections: [],
        externalCrossSections: [],
        upstreamIneffectiveFlowArea: {
          leftStation: 50,
          leftElevation: 100,
          rightStation: 150,
          rightElevation: 110,
        },
        downstreamIneffectiveFlowArea: {
          leftStation: 60,
          leftElevation: 105,
          rightStation: 160,
          rightElevation: 115,
        },
      }

      const result = serializeBridgeConnection(bridge)

      expect(result[0]).toBe("Conn BR: Bridge=-1,0,0,0,0,0.8,1.2")
      expect(result[1]).toBe("Conn BR: Pressure-Weir=1,2,3,4,5")
      expect(result.find((line) => line.startsWith("Conn BR: BR Coef="))).toBe(
        "Conn BR: BR Coef=-1,0,0,1,2,0.8,0,1.2,0,3",
      )
      expect(result.find((line) => line.startsWith("Conn BR: BR Skew="))).toBe("Conn BR: BR Skew=45")
    })
  })

  describe("GIVEN a bridge with approach sections", () => {
    it("WHEN serialized THEN formats approach data", () => {
      const externalCrossSection: BridgeCrossSection = {
        id: 2,
        points: [
          { station: 50, elevation: 180 },
          { station: 100, elevation: 190 },
        ],
        bankStations: {
          sectionId: 2,
          leftBank: 60,
          rightBank: 90,
        },
        manningCoefficients: [{ station: 50, nValue: 0.03 }],
      }

      const bridge: BridgeConnection = {
        bridge: {
          momentumEquationAddFriction: -1,
          momentumEquationAddWeight: 0,
          pressureFlowCriteria: 0,
          classBDefaults: 0,
          param5: 0,
          contractionCoefficient: 0.8,
          expansionCoefficient: 1.2,
        },
        pressureWeir: {
          value1: 1.0,
          value2: null,
          value3: 2.0,
          value4: null,
          value5: 3.0,
        },
        deckParameters: {
          deckDistance: 10.0,
          width: 50.0,
          weirCoefficient: 0.5,
          skew: 0.0,
          numberOfUpstreamStations: 0,
          numberOfDownstreamStations: 0,
          minLowCoordinate: null,
          maxHighCoordinate: null,
          maxSubmerge: 1.0,
          isOgee: 0,
          upstream: [],
          downstream: [],
        },
        bridgeCoefficients: {
          coef1: -1,
          coef2: 0,
          coef3: 0,
          coef4: null,
          coef5: null,
          coef6: null,
          coef7: 0.8,
          coef8: 0,
          coef9: 1.2,
          coef10: 0,
          coef11: null,
        },
        bridgeSkew: 0,
        insideCrossSections: [],
        externalCrossSections: [externalCrossSection],
        upstreamIneffectiveFlowArea: {
          leftStation: 50,
          leftElevation: 100,
          rightStation: 150,
          rightElevation: 110,
        },
        downstreamIneffectiveFlowArea: {
          leftStation: 60,
          leftElevation: 105,
          rightStation: 160,
          rightElevation: 115,
        },
      }

      const result = serializeBridgeConnection(bridge)

      const crossSectionStartIndex = result.findIndex((line) => line.startsWith("Conn BR: XS SE="))
      expect(result[crossSectionStartIndex]).toBe("Conn BR: XS SE=2,2")
      expect(result[crossSectionStartIndex + 1]).toBe("      50     180     100     190")
      expect(result[crossSectionStartIndex + 2]).toBe("Conn BR: BR Bank Sta=2,60,90")
      expect(result[crossSectionStartIndex + 3]).toBe("Conn BR: BR Manning=")
      expect(result[crossSectionStartIndex + 4]).toBe("      50    0.03")
    })
  })

  describe("GIVEN a bridge with null fields", () => {
    it("WHEN serialized THEN outputs blank spacing", () => {
      const bridge: BridgeConnection = {
        bridge: {
          momentumEquationAddFriction: -1,
          momentumEquationAddWeight: 0,
          pressureFlowCriteria: 0,
          classBDefaults: 0,
          param5: 0,
          contractionCoefficient: 0.8,
          expansionCoefficient: 1.2,
        },
        pressureWeir: {
          value1: 1.0,
          value2: null, // null field
          value3: 2.0,
          value4: null, // null field
          value5: 3.0,
        },
        deckParameters: {
          deckDistance: 10.0,
          width: 50.0,
          weirCoefficient: 0.5,
          skew: 0.0,
          numberOfUpstreamStations: 1,
          numberOfDownstreamStations: 1,
          minLowCoordinate: null, // null field
          maxHighCoordinate: null, // null field
          maxSubmerge: 1.0,
          isOgee: 0,
          upstream: [
            { station: 100, highChord: 200, lowChord: null }, // null low chord
          ],
          downstream: [
            { station: 200, highChord: 210, lowChord: null }, // null low chord
          ],
        },
        bridgeCoefficients: {
          coef1: -1,
          coef2: 0,
          coef3: 0,
          coef4: null, // null field
          coef5: null, // null field
          coef6: null, // null field
          coef7: 0.8,
          coef8: 0,
          coef9: 1.2,
          coef10: 0,
          coef11: null, // null field
        },
        bridgeSkew: 0,
        insideCrossSections: [],
        externalCrossSections: [],
        upstreamIneffectiveFlowArea: {
          leftStation: 50,
          leftElevation: 100,
          rightStation: 150,
          rightElevation: 110,
        },
        downstreamIneffectiveFlowArea: {
          leftStation: 60,
          leftElevation: 105,
          rightStation: 160,
          rightElevation: 115,
        },
      }

      const result = serializeBridgeConnection(bridge)

      expect(result[1]).toBe("Conn BR: Pressure-Weir=1,,2,,3") // null values as empty strings
      expect(result[3]).toBe("10,50,0.5,0,1,1,,,1,0") // null coordinates as empty strings
      expect(result[6]).toBe("        ") // upstream null low chord as blank spacing (8 chars)
      expect(result[9]).toBe("        ") // downstream null low chord as blank spacing (8 chars)
      expect(result.find((line) => line.startsWith("Conn BR: BR Coef="))).toBe("Conn BR: BR Coef=-1,0,0,,,0.8,0,1.2,0,") // null coefficients as empty strings
    })
  })

  describe("GIVEN a complete bridge", () => {
    it("WHEN serialized THEN produces valid bridge section", () => {
      const bridge: BridgeConnection = {
        bridge: {
          momentumEquationAddFriction: -1,
          momentumEquationAddWeight: 0,
          pressureFlowCriteria: 0,
          classBDefaults: 0,
          param5: 0,
          contractionCoefficient: 0.8,
          expansionCoefficient: 1.2,
        },
        pressureWeir: {
          value1: 1.0,
          value2: null,
          value3: 2.0,
          value4: null,
          value5: 3.0,
        },
        deckParameters: {
          deckDistance: 10.0,
          width: 50.0,
          weirCoefficient: 0.5,
          skew: 0.0,
          numberOfUpstreamStations: 0,
          numberOfDownstreamStations: 0,
          minLowCoordinate: null,
          maxHighCoordinate: null,
          maxSubmerge: 1.0,
          isOgee: 0,
          upstream: [],
          downstream: [],
        },
        bridgeCoefficients: {
          coef1: -1,
          coef2: 0,
          coef3: 0,
          coef4: null,
          coef5: null,
          coef6: null,
          coef7: 0.8,
          coef8: 0,
          coef9: 1.2,
          coef10: 0,
          coef11: null,
        },
        bridgeSkew: 0,
        insideCrossSections: [],
        externalCrossSections: [],
        upstreamIneffectiveFlowArea: {
          leftStation: 50,
          leftElevation: 100,
          rightStation: 150,
          rightElevation: 110,
        },
        downstreamIneffectiveFlowArea: {
          leftStation: 60,
          leftElevation: 105,
          rightStation: 160,
          rightElevation: 115,
        },
      }

      const result = serializeBridge(bridge)
      const lines = result.split("\n")

      expect(lines[0]).toBe("Conn BR: Bridge=-1,0,0,0,0,0.8,1.2")
      expect(lines[1]).toBe("Conn BR: Pressure-Weir=1,,2,,3")
      expect(lines[2]).toBe("Conn BR: Deck Dist Width WeirC Skew NumUp NumDn")
      expect(lines[3]).toBe("10,50,0.5,0,0,0,,,1,0")
      expect(lines.find((line) => line.startsWith("Conn BR: BR Coef="))).toBe("Conn BR: BR Coef=-1,0,0,,,0.8,0,1.2,0,")
      expect(lines.find((line) => line.startsWith("Conn BR: BR Skew="))).toBe("Conn BR: BR Skew=0")
      expect(lines.find((line) => line.startsWith("Conn BR: USXS Ineff="))).toBe("Conn BR: USXS Ineff=50,100,150,110")
      expect(lines.find((line) => line.startsWith("Conn BR: DSXS Ineff="))).toBe("Conn BR: DSXS Ineff=60,105,160,115")
    })
  })
})
