import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"
import { parsePlan } from "../../src/parsers/plan/planParser"
import { serializePlan } from "../../src/serializers/geometry/planSerializer"

describe("HEC-RAS Plan Serializer (.p13)", () => {
  const testDataPath = join(__dirname, "..", "data", "BaldEagleDamBrk.p13")
  const originalContent = readFileSync(testDataPath, "utf-8")
  const originalPlan = parsePlan(originalContent)

  describe("Basic Serialization", () => {
    it("should serialize plan data back to string format", () => {
      const serialized = serializePlan(originalPlan)

      expect(typeof serialized).toBe("string")
      expect(serialized.length).toBeGreaterThan(0)
      expect(serialized).toContain("Plan Title=PMF with Multi 2D Areas")
      expect(serialized).toContain("Program Version=5.10")
    })

    it("should include all required sections", () => {
      const serialized = serializePlan(originalPlan)

      expect(serialized).toContain("Plan Title=")
      expect(serialized).toContain("Simulation Date=")
      expect(serialized).toContain("Geom File=")
      expect(serialized).toContain("Flow File=")
      expect(serialized).toContain("Computation Interval=")
      expect(serialized).toContain("UNET Theta=")
      expect(serialized).toContain("Stage Flow Hydrograph=")
      expect(serialized).toContain("Breach Loc=")
    })
  })

  describe("Round-trip Testing", () => {
    it("should maintain data integrity through parse -> serialize -> parse cycle", () => {
      // Original: file -> parsed plan
      const originalParsed = parsePlan(originalContent)

      // Serialize the parsed plan back to string
      const serialized = serializePlan(originalParsed)

      // Parse the serialized content again
      const reparsed = parsePlan(serialized)

      // Compare critical fields
      expect(reparsed.title).toBe(originalParsed.title)
      expect(reparsed.programVersion).toBe(originalParsed.programVersion)
      expect(reparsed.shortIdentifier).toBe(originalParsed.shortIdentifier)
      expect(reparsed.geomFile).toBe(originalParsed.geomFile)
      expect(reparsed.flowFile).toBe(originalParsed.flowFile)
      expect(reparsed.dssFile).toBe(originalParsed.dssFile)
      expect(reparsed.description).toBe(originalParsed.description)
    })

    it("should preserve simulation date correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.simulationDate).toEqual(originalPlan.simulationDate)
    })

    it("should preserve flow settings correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.flowSettings.subcriticalFlow).toBe(originalPlan.flowSettings.subcriticalFlow)
      expect(reparsed.flowSettings.stdStepTol).toBe(originalPlan.flowSettings.stdStepTol)
      expect(reparsed.flowSettings.criticalTol).toBe(originalPlan.flowSettings.criticalTol)
      expect(reparsed.flowSettings.numStdStepTrials).toBe(
        originalPlan.flowSettings.numStdStepTrials,
      )
    })

    it("should preserve time settings correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.computationInterval).toBe(originalPlan.computationInterval)
      expect(reparsed.outputInterval).toBe(originalPlan.outputInterval)
      expect(reparsed.instantaneousInterval).toBe(originalPlan.instantaneousInterval)
      expect(reparsed.mappingInterval).toBe(originalPlan.mappingInterval)
    })

    it("should preserve UNET settings correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.unetSettings.theta).toBe(originalPlan.unetSettings.theta)
      expect(reparsed.unetSettings.thetaWarmup).toBe(originalPlan.unetSettings.thetaWarmup)
      expect(reparsed.unetSettings.zTol).toBe(originalPlan.unetSettings.zTol)
      expect(reparsed.unetSettings.maxIter).toBe(originalPlan.unetSettings.maxIter)
      expect(reparsed.unetSettings.methodology).toBe(originalPlan.unetSettings.methodology)
    })

    it("should preserve 2D area settings correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.unetD2Areas).toHaveLength(originalPlan.unetD2Areas.length)

      for (let i = 0; i < originalPlan.unetD2Areas.length; i++) {
        const originalArea = originalPlan.unetD2Areas[i]
        const reparsedArea = reparsed.unetD2Areas[i]

        expect(reparsedArea.name).toBe(originalArea.name)
        expect(reparsedArea.coriolis).toBe(originalArea.coriolis)
        expect(reparsedArea.cores).toBe(originalArea.cores)
        expect(reparsedArea.theta).toBe(originalArea.theta)
        expect(reparsedArea.zTol).toBe(originalArea.zTol)
        expect(reparsedArea.solverType).toBe(originalArea.solverType)
      }
    })

    it("should preserve stage flow hydrographs correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.stageFlowHydrographs).toHaveLength(originalPlan.stageFlowHydrographs.length)

      for (let i = 0; i < originalPlan.stageFlowHydrographs.length; i++) {
        const original = originalPlan.stageFlowHydrographs[i]
        const reparsed_hydrograph = reparsed.stageFlowHydrographs[i]

        expect(reparsed_hydrograph.riverName).toBe(original.riverName)
        expect(reparsed_hydrograph.reachName).toBe(original.reachName)
        expect(reparsed_hydrograph.station).toBe(original.station)
      }
    })

    it("should preserve breach locations correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.breachLocations).toHaveLength(originalPlan.breachLocations.length)

      for (let i = 0; i < originalPlan.breachLocations.length; i++) {
        const originalBreach = originalPlan.breachLocations[i]
        const reparsedBreach = reparsed.breachLocations[i]

        expect(reparsedBreach.riverName).toBe(originalBreach.riverName)
        expect(reparsedBreach.reachName).toBe(originalBreach.reachName)
        expect(reparsedBreach.station).toBe(originalBreach.station)
        expect(reparsedBreach.enabled).toBe(originalBreach.enabled)
        expect(reparsedBreach.method).toBe(originalBreach.method)

        // Check geometry
        expect(reparsedBreach.geometry.finalBottomWidth).toBe(
          originalBreach.geometry.finalBottomWidth,
        )
        expect(reparsedBreach.geometry.developableWidth).toBe(
          originalBreach.geometry.developableWidth,
        )
        expect(reparsedBreach.geometry.weirCoefficient).toBe(
          originalBreach.geometry.weirCoefficient,
        )

        // Check start conditions
        expect(reparsedBreach.start.triggerByTime).toBe(originalBreach.start.triggerByTime)
        expect(reparsedBreach.start.triggerElevation).toBe(originalBreach.start.triggerElevation)
        expect(reparsedBreach.start.piping).toBe(originalBreach.start.piping)

        // Check progression data
        expect(reparsedBreach.progression).toHaveLength(originalBreach.progression.length)
        for (let j = 0; j < originalBreach.progression.length; j++) {
          expect(reparsedBreach.progression[j].time).toBeCloseTo(
            originalBreach.progression[j].time,
            6,
          )
          expect(reparsedBreach.progression[j].fraction).toBeCloseTo(
            originalBreach.progression[j].fraction,
            6,
          )
        }
      }
    })

    it("should preserve run flags correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.runFlags.hTab).toBe(originalPlan.runFlags.hTab)
      expect(reparsed.runFlags.uNet).toBe(originalPlan.runFlags.uNet)
      expect(reparsed.runFlags.sediment).toBe(originalPlan.runFlags.sediment)
      expect(reparsed.runFlags.postProcess).toBe(originalPlan.runFlags.postProcess)
      expect(reparsed.runFlags.wqNet).toBe(originalPlan.runFlags.wqNet)
      expect(reparsed.runFlags.rasMapper).toBe(originalPlan.runFlags.rasMapper)
    })

    it("should preserve calibration settings correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.calibrationSettings.method).toBe(originalPlan.calibrationSettings.method)
      expect(reparsed.calibrationSettings.iterations).toBe(
        originalPlan.calibrationSettings.iterations,
      )
      expect(reparsed.calibrationSettings.maxChange).toBe(
        originalPlan.calibrationSettings.maxChange,
      )
      expect(reparsed.calibrationSettings.tolerance).toBe(
        originalPlan.calibrationSettings.tolerance,
      )
      expect(reparsed.calibrationSettings.optimizationMethod).toBe(
        originalPlan.calibrationSettings.optimizationMethod,
      )
    })

    it("should preserve water quality settings correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.waterQualitySettings.adNonConservative).toBe(
        originalPlan.waterQualitySettings.adNonConservative,
      )
      expect(reparsed.waterQualitySettings.ultimate).toBe(
        originalPlan.waterQualitySettings.ultimate,
      )
      expect(reparsed.waterQualitySettings.maxCompStep).toBe(
        originalPlan.waterQualitySettings.maxCompStep,
      )
      expect(reparsed.waterQualitySettings.outputInterval).toBe(
        originalPlan.waterQualitySettings.outputInterval,
      )

      // Check output flags
      const originalFlags = originalPlan.waterQualitySettings.outputFlags
      const reparsedFlags = reparsed.waterQualitySettings.outputFlags

      expect(reparsedFlags.faceFlow).toBe(originalFlags.faceFlow)
      expect(reparsedFlags.faceVelocity).toBe(originalFlags.faceVelocity)
      expect(reparsedFlags.cellVolume).toBe(originalFlags.cellVolume)
    })

    it("should preserve sediment settings correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.sedimentSettings.sortingAndArmoringIterations).toBe(
        originalPlan.sedimentSettings.sortingAndArmoringIterations,
      )
      expect(reparsed.sedimentSettings.xsUpdateThreshold).toBe(
        originalPlan.sedimentSettings.xsUpdateThreshold,
      )
      expect(reparsed.sedimentSettings.transportOutputIncrement).toBe(
        originalPlan.sedimentSettings.transportOutputIncrement,
      )
      expect(reparsed.sedimentSettings.numberOfLayers).toBe(
        originalPlan.sedimentSettings.numberOfLayers,
      )
    })
  })

  describe("Edge Cases", () => {
    it("should handle plans with minimal data", () => {
      const minimalPlan = parsePlan(
        "Plan Title=Test Plan\nProgram Version=5.10\nGeom File=test.g01\nFlow File=test.f01",
      )
      const serialized = serializePlan(minimalPlan)
      const reparsed = parsePlan(serialized)

      expect(reparsed.title).toBe("Test Plan")
      expect(reparsed.programVersion).toBe("5.10")
      expect(reparsed.geomFile).toBe("test.g01")
      expect(reparsed.flowFile).toBe("test.f01")
    })

    it("should preserve empty and null values correctly", () => {
      const serialized = serializePlan(originalPlan)
      const reparsed = parsePlan(serialized)

      // Test that optional fields are preserved correctly
      if (originalPlan.unetSettings.qTol === undefined) {
        expect(reparsed.unetSettings.qTol).toBeUndefined()
      }

      if (originalPlan.waterQualitySettings.restartSimtime === undefined) {
        expect(reparsed.waterQualitySettings.restartSimtime).toBeUndefined()
      }
    })

    it("should handle boolean conversions correctly", () => {
      const serialized = serializePlan(originalPlan)

      // Check boolean representations in serialized format
      expect(serialized).toContain("CheckData=True")
      expect(serialized).toContain("Echo Input=False")
      expect(serialized).toContain("Run HTab= 1")
      expect(serialized).toContain("Run Sediment= 0")
    })
  })
})
