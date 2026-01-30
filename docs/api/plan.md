# Plan Files Guide

HEC-RAS plan files (.pXX) define simulation settings including time windows, solver configuration, output options, and advanced features like dam breach analysis.

## Plan Structure Overview

```typescript
interface Plan {
  // Metadata
  title: string
  version: string
  shortIdentifier: string
  description?: string

  // File references
  geomFile: string
  flowFile: string
  dssFile?: string

  // Time settings
  simulationDate: SimulationTimeWindow
  computationInterval: number // seconds
  outputInterval: number // seconds
  mappingInterval: number // seconds

  // Solver settings
  flowSettings: FlowSettings
  computationTimeStep: ComputationTimeStep
  unetSettings: UnetSettings
  unetD2Areas: UnetD2Settings[]
  unetD1D2Settings: UnetD1D2Settings

  // Run configuration
  runFlags: {
    hTab: boolean
    uNet: boolean
    sediment: boolean
    postProcess: boolean
    wqNet: boolean
    rasMapper: boolean
  }

  // Output settings
  stageFlowHydrographs: StageFlowHydrograph[]
  hdfSettings: HDFSettings

  // Advanced features
  breachLocations: BreachLocation[]
  calibrationSettings: CalibrationSettings
  waterQualitySettings: WaterQualitySettings
  sedimentSettings: SedimentSettings
}
```

## Simulation Time Window

The time window defines when the simulation starts and ends.

```typescript
const plan = parsePlan(content)

// Access time window
const timeWindow = plan.simulationTimeWindow
console.log(`Start: ${timeWindow.startDate} ${timeWindow.startTime}`)
console.log(`End: ${timeWindow.endDate} ${timeWindow.endTime}`)

// Date format: DDMMMYYYY (e.g., "01JAN2020")
// Time format: HHMM 24-hour (e.g., "1300" for 1:00 PM)
```

### Modifying Time Window

```typescript
plan.simulationTimeWindow = {
  startDate: "01JAN2020",
  startTime: "0000",
  endDate: "05JAN2020",
  endTime: "2400",
}
```

## Computation Intervals

Intervals control simulation time stepping and output frequency.

```typescript
// All intervals are in seconds
console.log(`Computation: ${plan.computationInterval}s`)
console.log(`Output: ${plan.outputInterval}s`)
console.log(`Mapping: ${plan.mappingInterval}s`)
console.log(`Instantaneous: ${plan.instantaneousInterval}s`)

// Modify intervals
plan.computationInterval = 60 // 1 minute
plan.outputInterval = 900 // 15 minutes
plan.mappingInterval = 3600 // 1 hour
```

## UNET Solver Settings

The UNET solver handles 1D unsteady flow calculations.

```typescript
const unet = plan.unetSettings

// Key parameters
console.log(`Theta: ${unet.theta}`) // Implicit weighting (0.6-1.0)
console.log(`Theta Warmup: ${unet.thetaWarmup}`)
console.log(`Max Iterations: ${unet.maxIter}`)
console.log(`Z Tolerance: ${unet.zTol}`) // Stage tolerance
console.log(`Q Tolerance: ${unet.qTol}`) // Flow tolerance (optional)

// Time step controls
console.log(`DT IC: ${unet.dtIC}`) // Initial condition time step
console.log(`DT Min: ${unet.dtMin}`) // Minimum time step

// Stability parameters
console.log(`WF Stab: ${unet.wfStab}`)
console.log(`SF Stab: ${unet.sfStab}`)

// Froude number limiting
console.log(`Froude Reduction: ${unet.froudeReduction}`)
console.log(`Froude Limit: ${unet.froudeLimit}`)
```

### Modifying Solver Settings

```typescript
// Increase iterations for complex models
plan.unetSettings.maxIter = 40
plan.unetSettings.maxIterWOImprovement = 10

// Tighten tolerances
plan.unetSettings.zTol = 0.005
plan.unetSettings.zSATol = 0.005

// Enable Froude limiting for stability
plan.unetSettings.froudeReduction = true
plan.unetSettings.froudeLimit = 0.8
```

## 2D Flow Area Settings

Each 2D area can have its own solver configuration.

```typescript
for (const area2D of plan.unetD2Areas) {
  console.log(`2D Area: ${area2D.name}`)
  console.log(`  Cores: ${area2D.cores}`)
  console.log(`  Theta: ${area2D.theta}`)
  console.log(`  Max Iterations: ${area2D.maxIterations}`)
  console.log(`  Z Tolerance: ${area2D.zTol}`)
  console.log(`  Volume Tolerance: ${area2D.volumeTol}`)
  console.log(`  Equation Set: ${area2D.equation}`)
  console.log(`  Solver Type: ${area2D.solverType}`)

  // Optional parameters
  if (area2D.eddyViscosity !== undefined) {
    console.log(`  Eddy Viscosity: ${area2D.eddyViscosity}`)
  }
  if (area2D.smagorinskyMixing !== undefined) {
    console.log(`  Smagorinsky: ${area2D.smagorinskyMixing}`)
  }
}
```

### Modifying 2D Settings

```typescript
// Find and modify a specific 2D area
const floodplain = plan.unetD2Areas.find((a) => a.name === "Floodplain")
if (floodplain) {
  floodplain.cores = 8
  floodplain.maxIterations = 30
  floodplain.equation = 2 // Full momentum
}
```

## 1D-2D Coupling Settings

Controls iteration between 1D and 2D domains.

```typescript
const coupling = plan.unetD1D2Settings

console.log(`Max Iterations: ${coupling.maxIter}`)
console.log(`Z Tolerance: ${coupling.zTol}`)
console.log(`Q Tolerance: ${coupling.qTol}`)
```

## Computation Time Step

Adaptive time stepping configuration.

```typescript
const timeStep = plan.computationTimeStep

console.log(`Use Courant: ${timeStep.useCourant}`)
console.log(`Use Time Series: ${timeStep.useTimeSeries}`)

if (timeStep.useCourant) {
  console.log(`Max Courant: ${timeStep.maxCourant}`)
  console.log(`Min Courant: ${timeStep.minCourant}`)
}

console.log(`Count to Double: ${timeStep.countToDouble}`)
console.log(`Max Doubling: ${timeStep.maxDoubling}`)
console.log(`Max Halving: ${timeStep.maxHalving}`)
```

## Flow Settings

Controls 1D flow computation behavior.

```typescript
const flow = plan.flowSettings

console.log(`Subcritical Flow: ${flow.subcriticalFlow}`)
console.log(`Standard Step Tolerance: ${flow.stdStepTol}`)
console.log(`Critical Tolerance: ${flow.criticalTol}`)
console.log(`Max Error Tolerance: ${flow.maxErrorTol}`)
console.log(`Num Standard Step Trials: ${flow.numStdStepTrials}`)
```

## Run Flags

Control which components run during simulation.

```typescript
const flags = plan.runFlags

console.log(`HTab (geometry tables): ${flags.hTab}`)
console.log(`UNet (unsteady flow): ${flags.uNet}`)
console.log(`Sediment transport: ${flags.sediment}`)
console.log(`Post-processing: ${flags.postProcess}`)
console.log(`Water quality: ${flags.wqNet}`)
console.log(`RAS Mapper: ${flags.rasMapper}`)
```

## Stage-Flow Hydrograph Locations

Define where to output detailed time series.

```typescript
for (const hydrograph of plan.stageFlowHydrographs) {
  console.log(`Location: ${hydrograph.riverName}/${hydrograph.reachName} @ ${hydrograph.station}`)
}

// Add a new output location
plan.stageFlowHydrographs.push({
  riverName: "Main River",
  reachName: "Upper Reach",
  station: 15000,
})
```

## HDF Output Settings

Control what data is written to HDF5 output files.

```typescript
const hdf = plan.hdfSettings

console.log(`Write Warmup: ${hdf.writeWarmup}`)
console.log(`Write Time Slices: ${hdf.writeTimeSlices}`)
console.log(`Compression: ${hdf.compression}`)

// 2D output options
console.log(`Cell Depths: ${hdf.cellDepths}`)
console.log(`Cell Velocity: ${hdf.cellVelocity}`)
console.log(`Face Flow: ${hdf.faceFlow}`)
console.log(`Face WSEL: ${hdf.faceWSEL}`)
```

## Breach Locations (Dam/Levee Breach)

Configure breach scenarios for dam or levee failure analysis.

```typescript
for (const breach of plan.breachLocations) {
  console.log(`Breach: ${breach.description}`)
  console.log(`  Location: ${breach.riverName}/${breach.reachName} @ ${breach.station}`)
  console.log(`  Enabled: ${breach.enabled}`)
  console.log(`  Method: ${breach.method}`)

  // Breach geometry
  const geom = breach.geometry
  console.log(`  Final Bottom Width: ${geom.finalBottomWidth}`)
  console.log(`  Left Slope: ${geom.leftSideSlope}`)
  console.log(`  Right Slope: ${geom.rightSideSlope}`)

  // Trigger conditions
  const start = breach.start
  console.log(`  Trigger by Time: ${start.triggerByTime}`)
  console.log(`  Trigger Elevation: ${start.triggerElevation}`)
  console.log(`  Piping: ${start.piping}`)

  // Progression curve
  console.log(`  Progression points: ${breach.progression.length}`)
}
```

## Calibration Settings

Automated calibration configuration.

```typescript
const cal = plan.calibrationSettings

console.log(`Method: ${cal.method}`)
console.log(`Iterations: ${cal.iterations}`)
console.log(`Max Change: ${cal.maxChange}`)
console.log(`Tolerance: ${cal.tolerance}`)
console.log(`Range: ${cal.minimum} - ${cal.maximum}`)

if (cal.window) {
  console.log(`Window: ${cal.window.join(", ")}`)
}
```

## Water Quality Settings

Water quality module configuration.

```typescript
const wq = plan.waterQualitySettings

console.log(`AD Non-Conservative: ${wq.adNonConservative}`)
console.log(`Ultimate: ${wq.ultimate}`)
console.log(`Max Comp Step: ${wq.maxCompStep}`)
console.log(`Output Interval: ${wq.outputInterval}`)

// Output flags
const flags = wq.outputFlags
console.log(`Face Flow: ${flags.faceFlow}`)
console.log(`Cell Volume: ${flags.cellVolume}`)
console.log(`Cell Mass: ${flags.cellMass}`)
```

## Sediment Settings

Sediment transport module configuration.

```typescript
const sed = plan.sedimentSettings

console.log(`Sorting Iterations: ${sed.sortingAndArmoringIterations}`)
console.log(`XS Update Threshold: ${sed.xsUpdateThreshold}`)
console.log(`Bed Roughness Predictor: ${sed.bedRoughnessPredictor}`)
console.log(`Energy Slope Method: ${sed.energySlopeMethod}`)
console.log(`Number of Layers: ${sed.numberOfLayers}`)
```

## Example: Batch Modify Simulation Settings

```typescript
import { parsePlan, serializePlan } from "hecras-parser"
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join } from "path"

const planFiles = readdirSync("./plans").filter((f) => f.match(/\.p\d+$/))

for (const file of planFiles) {
  const content = readFileSync(join("./plans", file), "utf-8")
  const plan = parsePlan(content)

  // Standardize solver settings across all plans
  plan.unetSettings.maxIter = 40
  plan.unetSettings.zTol = 0.005

  // Extend simulation by 1 day
  // (Would need date parsing logic for real use)

  // Save modified plan
  const output = serializePlan(plan)
  writeFileSync(join("./plans", file), output)

  console.log(`Updated ${file}`)
}
```

## Example: Create Sensitivity Analysis Plans

```typescript
import { parsePlan, serializePlan } from "hecras-parser"
import { readFileSync, writeFileSync } from "fs"

const basePlan = parsePlan(readFileSync("base.p01", "utf-8"))

// Create variations with different Manning's roughness multipliers
const multipliers = [0.8, 0.9, 1.0, 1.1, 1.2]

for (const mult of multipliers) {
  const plan = structuredClone(basePlan)
  plan.title = `Sensitivity - Manning x${mult}`
  plan.shortIdentifier = `SENS_N${mult.toFixed(1)}`

  const output = serializePlan(plan)
  writeFileSync(`sensitivity_n${mult.toFixed(1)}.p01`, output)
}
```

## See Also

- [Type Reference](./generated/types.md) - Complete type definitions
- [Geometry Files Guide](./geometry.md) - Working with model geometry
- [API Reference](./index.md) - Core functions
