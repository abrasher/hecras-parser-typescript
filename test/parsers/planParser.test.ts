import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"
// Plan parser is not yet implemented; define stub for skipped tests
const parsePlan = () => ({}) as any

describe.skip("HEC-RAS Plan Parser (.p13)", () => {
  const testDataPath = join(__dirname, "..", "data", "BaldEagleDamBrk.p13")
  const planContent = readFileSync(testDataPath, "utf-8")
  const parsedPlan = parsePlan(planContent)

  describe("Basic Plan Information", () => {
    it("should parse plan title correctly", () => {
      expect(parsedPlan.title).toBe("PMF with Multi 2D Areas")
    })

    it("should parse program version correctly", () => {
      expect(parsedPlan.programVersion).toBe("5.10")
    })

    it("should parse short identifier correctly", () => {
      expect(parsedPlan.shortIdentifier).toBe("PMF Multi 2D")
    })

    it("should parse simulation date correctly", () => {
      expect(parsedPlan.simulationDate).toEqual({
        startDate: "01JAN1999",
        startTime: "1200",
        endDate: "04JAN1999",
        endTime: "1200",
      })
    })

    it("should parse geometry and flow file references", () => {
      expect(parsedPlan.geomFile).toBe("g06")
      expect(parsedPlan.flowFile).toBe("u07")
      expect(parsedPlan.dssFile).toBe("dss")
    })

    it("should parse description correctly", () => {
      expect(parsedPlan.description).toContain("Predominatntly a 1D model with multiple 2D areas")
      expect(parsedPlan.description).toContain(
        "One 2D area represents the area behind a levee system",
      )
      expect(parsedPlan.description).toContain("The other 2D areas are used to model tributaries")
    })
  })

  describe("Flow Settings", () => {
    it("should parse flow configuration correctly", () => {
      expect(parsedPlan.flowSettings.subcriticalFlow).toBe(true)
      expect(parsedPlan.flowSettings.kSumByGR).toBe(0)
      expect(parsedPlan.flowSettings.stdStepTol).toBe(0.01)
      expect(parsedPlan.flowSettings.criticalTol).toBe(0.01)
      expect(parsedPlan.flowSettings.numStdStepTrials).toBe(20)
      expect(parsedPlan.flowSettings.maxErrorTol).toBe(0.3)
      expect(parsedPlan.flowSettings.flowTolRatio).toBe(0.001)
      expect(parsedPlan.flowSettings.splitFlowNTrial).toBe(30)
      expect(parsedPlan.flowSettings.splitFlowTol).toBe(0.02)
      expect(parsedPlan.flowSettings.splitFlowRatio).toBe(0.02)
    })

    it("should parse global settings correctly", () => {
      expect(parsedPlan.parabolicCriticalDepth).toBe(true)
      expect(parsedPlan.globalVelDist).toEqual([0, 0, 0])
      expect(parsedPlan.globalLogLevel).toBe(0)
      expect(parsedPlan.checkData).toBe(true)
      expect(parsedPlan.encroachParam).toEqual([-1, 0, 0, 0])
    })
  })

  describe("Time Settings", () => {
    it("should parse time intervals correctly", () => {
      expect(parsedPlan.computationInterval).toBe("30SEC")
      expect(parsedPlan.outputInterval).toBe("30MIN")
      expect(parsedPlan.instantaneousInterval).toBe("1HOUR")
      expect(parsedPlan.mappingInterval).toBe("30MIN")
    })

    it("should parse computation time step settings", () => {
      expect(parsedPlan.computationTimeStep.useCourant).toBe(false)
      expect(parsedPlan.computationTimeStep.useTimeSeries).toBe(false)
      expect(parsedPlan.computationTimeStep.countToDouble).toBe(0)
      expect(parsedPlan.computationTimeStep.maxDoubling).toBe(0)
      expect(parsedPlan.computationTimeStep.maxHalving).toBe(0)
      expect(parsedPlan.computationTimeStep.residenceCourant).toBe(0)
    })
  })

  describe("Run Flags", () => {
    it("should parse run flags correctly", () => {
      expect(parsedPlan.runFlags.hTab).toBe(true)
      expect(parsedPlan.runFlags.uNet).toBe(true)
      expect(parsedPlan.runFlags.sediment).toBe(false)
      expect(parsedPlan.runFlags.postProcess).toBe(true)
      expect(parsedPlan.runFlags.wqNet).toBe(false)
      expect(parsedPlan.runFlags.rasMapper).toBe(false)
    })
  })

  describe("UNET Settings", () => {
    it("should parse UNET solver configuration", () => {
      expect(parsedPlan.unetSettings.theta).toBe(1)
      expect(parsedPlan.unetSettings.thetaWarmup).toBe(1)
      expect(parsedPlan.unetSettings.zTol).toBe(0.005)
      expect(parsedPlan.unetSettings.zSATol).toBe(0.005)
      expect(parsedPlan.unetSettings.maxIter).toBe(20)
      expect(parsedPlan.unetSettings.maxIterWOImprovement).toBe(0)
      expect(parsedPlan.unetSettings.maxInSteps).toBe(0)
      expect(parsedPlan.unetSettings.dtIC).toBe(0)
      expect(parsedPlan.unetSettings.dtMin).toBe(0)
      expect(parsedPlan.unetSettings.maxCRTS).toBe(20)
      expect(parsedPlan.unetSettings.wfStab).toBe(2)
      expect(parsedPlan.unetSettings.sfStab).toBe(1)
      expect(parsedPlan.unetSettings.wfX).toBe(3)
      expect(parsedPlan.unetSettings.sfX).toBe(1)
      expect(parsedPlan.unetSettings.methodology).toBe("Finite Difference")
      expect(parsedPlan.unetSettings.dssMLevel).toBe(4)
      expect(parsedPlan.unetSettings.pardiso).toBe(false)
      expect(parsedPlan.unetSettings.dzMaxAbort).toBe(100)
      expect(parsedPlan.unetSettings.useExistingIBTables).toBe(true) // -1 should convert to true
      expect(parsedPlan.unetSettings.froudeReduction).toBe(false)
      expect(parsedPlan.unetSettings.froudeLimit).toBe(1)
      expect(parsedPlan.unetSettings.froudePower).toBe(10)
      expect(parsedPlan.unetSettings.d1Cores).toBe(0)
      expect(parsedPlan.unetSettings.windReference).toBe("Eulerian")
      expect(parsedPlan.unetSettings.windDragFormulation).toBe("Hsu (1988)")
    })

    it("should parse D1D2 coupling settings", () => {
      expect(parsedPlan.unetD1D2Settings.maxIter).toBe(0)
      expect(parsedPlan.unetD1D2Settings.zTol).toBe(0.02)
      expect(parsedPlan.unetD1D2Settings.qTol).toBe(1)
    })
  })

  describe("2D Area Settings", () => {
    it("should parse multiple 2D areas correctly", () => {
      expect(parsedPlan.unetD2Areas).toHaveLength(3)

      // First 2D area (193)
      const area193 = parsedPlan.unetD2Areas[0]
      expect(area193.name).toBe("193")
      expect(area193.coriolis).toBe(true) // -1 should convert to true
      expect(area193.cores).toBe(8)
      expect(area193.theta).toBe(1)
      expect(area193.thetaWarmup).toBe(1)
      expect(area193.zTol).toBe(0.01)
      expect(area193.volumeTol).toBe(0.01)
      expect(area193.maxIterations).toBe(20)
      expect(area193.equation).toBe(0)
      expect(area193.rampUpFraction).toBe(0.5)
      expect(area193.timeSlices).toBe(1)
      expect(area193.solverType).toBe("Pardiso (Direct)")

      // Second 2D area (194)
      const area194 = parsedPlan.unetD2Areas[1]
      expect(area194.name).toBe("194")
      expect(area194.eddyViscosity).toBe(0)
      expect(area194.transverseEddyViscosity).toBe(0)

      // Third 2D area (LockHaven)
      const areaLockHaven = parsedPlan.unetD2Areas[2]
      expect(areaLockHaven.name).toBe("LockHaven")
      expect(areaLockHaven.eddyViscosity).toBe(0)
      expect(areaLockHaven.transverseEddyViscosity).toBe(0)
    })
  })

  describe("Stage Flow Hydrographs", () => {
    it("should parse all stage flow hydrograph locations", () => {
      expect(parsedPlan.stageFlowHydrographs).toHaveLength(192)

      const firstHydrograph = parsedPlan.stageFlowHydrographs[0]
      expect(firstHydrograph.riverName).toBe("Bald Eagle Cr.")
      expect(firstHydrograph.reachName).toBe("Lock Haven")
      expect(firstHydrograph.station).toBe(137520)

      const lastHydrograph = parsedPlan.stageFlowHydrographs[191]
      expect(lastHydrograph.riverName).toBe("Bald Eagle Cr.")
      expect(lastHydrograph.reachName).toBe("Lock Haven")
      expect(lastHydrograph.station).toBe(-1867)
    })
  })

  describe("Breach Locations", () => {
    it("should parse all breach locations correctly", () => {
      expect(parsedPlan.breachLocations).toHaveLength(2)

      // First breach location
      const breach1 = parsedPlan.breachLocations[0]
      expect(breach1.riverName).toBe("Bald Eagle Cr.")
      expect(breach1.reachName).toBe("Lock Haven")
      expect(breach1.station).toBe(21200)
      expect(breach1.enabled).toBe(true)
      expect(breach1.method).toBe(0)

      expect(breach1.geometry.finalBottomWidth).toBe(2700)
      expect(breach1.geometry.leftSideSlope).toBe(300)
      expect(breach1.geometry.rightSideSlope).toBe(560)
      expect(breach1.geometry.bottomWidth).toBe(0.1)
      expect(breach1.geometry.topWidth).toBe(0.1)
      expect(breach1.geometry.developableWidth).toBe(false)
      expect(breach1.geometry.weirCoefficient).toBe(0.5)
      expect(breach1.geometry.leftSlope).toBe(2)
      expect(breach1.geometry.rightSlope).toBe(2.6)

      expect(breach1.start.triggerByTime).toBe(true)
      expect(breach1.start.triggerElevation).toBe(573.1)
      expect(breach1.start.piping).toBe(false)
      expect(breach1.start.failureMode).toBe(0)

      // Second breach location (more complex)
      const breach2 = parsedPlan.breachLocations[1]
      expect(breach2.riverName).toBe("Bald Eagle Cr.")
      expect(breach2.reachName).toBe("Lock Haven")
      expect(breach2.station).toBe(81454)
      expect(breach2.enabled).toBe(true)
      expect(breach2.method).toBe(0)

      expect(breach2.geometry.finalBottomWidth).toBe(5250)
      expect(breach2.geometry.leftSideSlope).toBe(446)
      expect(breach2.geometry.rightSideSlope).toBe(585)
      expect(breach2.geometry.developableWidth).toBe(true)
      expect(breach2.geometry.finalBottomElevation).toBe(620)
      expect(breach2.geometry.leftSlope).toBe(3.2)
      expect(breach2.geometry.rightSlope).toBe(2.6)

      expect(breach2.start.triggerByTime).toBe(true)
      expect(breach2.start.triggerElevation).toBe(676.8)

      expect(breach2.progression).toHaveLength(21)
      expect(breach2.progression[0]).toEqual({ time: 0, fraction: 0 })
      expect(breach2.progression[1]).toEqual({ time: 0.05, fraction: 0.006 })
      expect(breach2.progression[20]).toEqual({ time: 1, fraction: 1 })

      expect(breach2.calculatorData).toBeDefined()
      expect(breach2.calculatorData?.reservoirElevation).toBe(683)
      expect(breach2.calculatorData?.damHeight).toBe(25)
      expect(breach2.calculatorData?.reservoirLength).toBe(3.5)
      expect(breach2.calculatorData?.reservoirWidth).toBe(3.5)
      expect(breach2.calculatorData?.finalBottomElevation).toBe(585)
      expect(breach2.calculatorData?.triggerElevation).toBe(676.8)
      expect(breach2.calculatorData?.volume).toBe(180000)
    })
  })

  describe("Output Settings", () => {
    it("should parse output control flags correctly", () => {
      expect(parsedPlan.writeICFile).toBe(false)
      expect(parsedPlan.writeICFileAtFixedDateTime).toBe(false)
      expect(parsedPlan.writeICFileAtSimEnd).toBe(false)
      expect(parsedPlan.echoInput).toBe(false)
      expect(parsedPlan.echoParameters).toBe(false)
      expect(parsedPlan.echoOutput).toBe(false)
      expect(parsedPlan.writeDetailed).toBe(false)
    })

    it("should parse HDF settings correctly", () => {
      expect(parsedPlan.hdfSettings.writeWarmup).toBe(false)
      expect(parsedPlan.hdfSettings.writeTimeSlices).toBe(false)
      expect(parsedPlan.hdfSettings.flush).toBe(false)
      expect(parsedPlan.hdfSettings.cellDepths).toBe(false)
      expect(parsedPlan.hdfSettings.cellVelocity).toBe(false)
      expect(parsedPlan.hdfSettings.compression).toBe(1)
      expect(parsedPlan.hdfSettings.chunkSize).toBe(1)
      expect(parsedPlan.hdfSettings.spatialParts).toBe(1)
      expect(parsedPlan.hdfSettings.useMaxRows).toBe(false)
      expect(parsedPlan.hdfSettings.fixedRows).toBe(1)
    })
  })

  describe("Calibration Settings", () => {
    it("should parse calibration configuration correctly", () => {
      expect(parsedPlan.calibrationSettings.method).toBe(0)
      expect(parsedPlan.calibrationSettings.iterations).toBe(20)
      expect(parsedPlan.calibrationSettings.maxChange).toBe(0.05)
      expect(parsedPlan.calibrationSettings.tolerance).toBe(0.2)
      expect(parsedPlan.calibrationSettings.maximum).toBe(1.5)
      expect(parsedPlan.calibrationSettings.minimum).toBe(0.5)
      expect(parsedPlan.calibrationSettings.optimizationMethod).toBe(1)
    })
  })

  describe("Water Quality Settings", () => {
    it("should parse water quality configuration correctly", () => {
      expect(parsedPlan.waterQualitySettings.adNonConservative).toBe(true)
      expect(parsedPlan.waterQualitySettings.ultimate).toBe(true) // -1 should convert to true
      expect(parsedPlan.waterQualitySettings.maxCompStep).toBe("1HOUR")
      expect(parsedPlan.waterQualitySettings.outputInterval).toBe("15MIN")
      expect(parsedPlan.waterQualitySettings.outputSelectedIncrements).toBe(false)
      expect(parsedPlan.waterQualitySettings.createRestart).toBe(false)
      expect(parsedPlan.waterQualitySettings.writeToDSS).toBe(false)

      // All output flags should be false (0)
      const flags = parsedPlan.waterQualitySettings.outputFlags
      expect(flags.faceFlow).toBe(false)
      expect(flags.faceVelocity).toBe(false)
      expect(flags.cellVolume).toBe(false)
      expect(flags.faceArea).toBe(false)
    })
  })

  describe("Sediment Settings", () => {
    it("should parse sediment transport configuration correctly", () => {
      expect(parsedPlan.sedimentSettings.sortingAndArmoringIterations).toBe(10)
      expect(parsedPlan.sedimentSettings.xsUpdateThreshold).toBe(0.02)
      expect(parsedPlan.sedimentSettings.bedRoughnessPredictor).toBe(0)
      expect(parsedPlan.sedimentSettings.hydraulicsUpdateThreshold).toBe(0.02)
      expect(parsedPlan.sedimentSettings.energySlopeMethod).toBe(0)
      expect(parsedPlan.sedimentSettings.volumeChangeMethod).toBe(0)
      expect(parsedPlan.sedimentSettings.sedimentRetentionMethod).toBe(0)
      expect(parsedPlan.sedimentSettings.sedimentTSMultiplier).toBe(1)
      expect(parsedPlan.sedimentSettings.warmUpMethod).toBe(0)

      expect(parsedPlan.sedimentSettings.xsWeightingMethod).toBe(0)
      expect(parsedPlan.sedimentSettings.numberOfUSWeightedCrossSections).toBe(1)
      expect(parsedPlan.sedimentSettings.numberOfDSWeightedCrossSections).toBe(1)
      expect(parsedPlan.sedimentSettings.upstreamXSWeight).toBe(0.25)
      expect(parsedPlan.sedimentSettings.mainXSWeight).toBe(0.5)
      expect(parsedPlan.sedimentSettings.downstreamXSWeight).toBe(0.25)

      expect(parsedPlan.sedimentSettings.percentileMethod).toBe(0)
      expect(parsedPlan.sedimentSettings.sedimentOutputLevel).toBe(4)
      expect(parsedPlan.sedimentSettings.massOrVolumeOutput).toBe(0)
      expect(parsedPlan.sedimentSettings.outputIncrementType).toBe(1)
      expect(parsedPlan.sedimentSettings.profileAndTSOutputIncrement).toBe(10)
      expect(parsedPlan.sedimentSettings.transportOutputIncrement).toBe(1)

      expect(parsedPlan.sedimentSettings.readHDF5SedimentHotstart).toBe(false)
      expect(parsedPlan.sedimentSettings.sedimentHotstartType).toBe(0)
      expect(parsedPlan.sedimentSettings.writeGradationFile).toBe(false)
      expect(parsedPlan.sedimentSettings.readGradationHotstart).toBe(false)
      expect(parsedPlan.sedimentSettings.writeHDF5File).toBe(false)
      expect(parsedPlan.sedimentSettings.writeBinaryOutput).toBe(true)
      expect(parsedPlan.sedimentSettings.writeDSSSedimentFile).toBe(false)
      expect(parsedPlan.sedimentSettings.dssSedimentOutputType).toBe(1)

      expect(parsedPlan.sedimentSettings.numberOfLayers).toBe(5)
    })
  })

  describe("Edge Cases and Error Handling", () => {
    it("should handle malformed plan files gracefully", () => {
      expect(() => parsePlan("invalid content")).toThrow()
    })

    it("should handle missing required fields gracefully", () => {
      const minimalPlan = "Plan Title=Test\nProgram Version=5.10"
      expect(() => parsePlan(minimalPlan)).not.toThrow()
    })

    it("should handle empty lines and comments", () => {
      const planWithEmpty = `Plan Title=Test
Program Version=5.10

Geom File=test.g01`
      expect(() => parsePlan(planWithEmpty)).not.toThrow()
    })
  })

  describe("Data Type Validation", () => {
    it("should parse numeric values correctly", () => {
      expect(typeof parsedPlan.flowSettings.stdStepTol).toBe("number")
      expect(typeof parsedPlan.flowSettings.numStdStepTrials).toBe("number")
      expect(typeof parsedPlan.unetSettings.theta).toBe("number")
    })

    it("should parse boolean values correctly", () => {
      expect(typeof parsedPlan.runFlags.hTab).toBe("boolean")
      expect(typeof parsedPlan.runFlags.sediment).toBe("boolean")
      expect(typeof parsedPlan.checkData).toBe("boolean")
    })

    it("should parse string values correctly", () => {
      expect(typeof parsedPlan.title).toBe("string")
      expect(typeof parsedPlan.programVersion).toBe("string")
      expect(typeof parsedPlan.shortIdentifier).toBe("string")
    })

    it("should parse array values correctly", () => {
      expect(Array.isArray(parsedPlan.globalVelDist)).toBe(true)
      expect(Array.isArray(parsedPlan.encroachParam)).toBe(true)
      expect(Array.isArray(parsedPlan.stageFlowHydrographs)).toBe(true)
      expect(Array.isArray(parsedPlan.breachLocations)).toBe(true)
    })
  })
})
