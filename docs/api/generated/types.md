# hecras-parser

hecras-parser - TypeScript library for parsing and serializing HEC-RAS files

## Remarks

This library provides functions to parse and serialize HEC-RAS geometry (.gXX) and plan (.pXX) files.
It uses a schema-first architecture that ensures round-trip fidelity: parsing a file and serializing
it back produces identical output, preserving formatting, spacing, and blank values exactly.

## Example

```typescript
import { parseGeometry, serializeGeometry } from 'hecras-parser'
import { readFileSync, writeFileSync } from 'fs'

// Read and parse a geometry file
const content = readFileSync('model.g01', 'utf-8')
const geometry = parseGeometry(content)

// Access parsed data
console.log(geometry.title)
console.log(geometry.storageAreas?.length)

// Serialize back to string (with Windows line endings for HEC-RAS compatibility)
const output = serializeGeometry(geometry, { lineEndings: '\r\n' })
writeFileSync('model-modified.g01', output)
```

## Interfaces

### BoundaryCondition

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="criticalboundaryflow"></a> `criticalBoundaryFlow?` | `string` | - |
| <a id="dssfile"></a> `dssFile?` | `string` | - |
| <a id="dsspath"></a> `dssPath?` | `string` | - |
| <a id="fixedstartdatetime"></a> `fixedStartDateTime?` | [`DateTime`](#datetime) | - |
| <a id="flowhydrograph"></a> `flowHydrograph?` | `number`[] | - |
| <a id="flowhydrographqmin"></a> `flowHydrographQMin?` | `number` | - |
| <a id="flowhydrographqmult"></a> `flowHydrographQMult?` | `number` | - |
| <a id="flowhydrographslope"></a> `flowHydrographSlope?` | `number` | - |
| <a id="frictionslope"></a> `frictionSlope?` | `number`[] | - |
| <a id="gates"></a> `gates?` | [`Gate`](#gate)[] | - |
| <a id="interval"></a> `interval?` | `number` | - |
| <a id="iscriticalboundary"></a> `isCriticalBoundary?` | `boolean` | - |
| <a id="lateralinflowhydrograph"></a> `lateralInflowHydrograph?` | `number`[] | - |
| <a id="param1"></a> `param1` | `string` | Fixed Length of 8 |
| <a id="param2"></a> `param2` | `string` | Fixed Length of 16 |
| <a id="param3"></a> `param3` | `string` | Fixed Length of 16 |
| <a id="param4"></a> `param4` | `string` | Fixed Length of 16 |
| <a id="param5"></a> `param5` | `string` | Fixed Length of 32 |
| <a id="param6"></a> `param6` | `string` | Fixed Length of 32 |
| <a id="reach"></a> `reach` | `string` | Fixed Length of 16 |
| <a id="river"></a> `river` | `string` | Fixed Length of 16 |
| <a id="stagehydrographtwcheck"></a> `stageHydrographTWCheck?` | `boolean` | - |
| <a id="station"></a> `station` | `number` | - |
| <a id="uniformlateralinflowhydrograph"></a> `uniformLateralInflowHydrograph?` | `number`[] | - |
| <a id="usedss"></a> `useDSS?` | `boolean` | - |
| <a id="usefixedstarttime"></a> `useFixedStartTime?` | `boolean` | - |

***

### BreachCalculatorData

Breach calculator data

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="damheight"></a> `damHeight` | `number` |
| <a id="finalbottomelevation"></a> `finalBottomElevation` | `number` |
| <a id="headcutmigration"></a> `headcutMigration` | `number` |
| <a id="plasticityindex"></a> `plasticityIndex` | `number` |
| <a id="reservoirelevation"></a> `reservoirElevation` | `number` |
| <a id="reservoirlength"></a> `reservoirLength` | `number` |
| <a id="reservoirwidth"></a> `reservoirWidth` | `number` |
| <a id="soiltype"></a> `soilType` | `number` |
| <a id="triggerelevation"></a> `triggerElevation` | `number` |
| <a id="vegetationdensity"></a> `vegetationDensity` | `number` |
| <a id="volume"></a> `volume` | `number` |

***

### BreachGeometry

Breach geometry configuration

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="bottomwidth"></a> `bottomWidth` | `number` |
| <a id="developablewidth"></a> `developableWidth` | `boolean` |
| <a id="finalbottomelevation-1"></a> `finalBottomElevation?` | `number` |
| <a id="finalbottomwidth"></a> `finalBottomWidth` | `number` |
| <a id="leftsideslope"></a> `leftSideSlope` | `number` |
| <a id="leftslope"></a> `leftSlope` | `number` |
| <a id="rightsideslope"></a> `rightSideSlope` | `number` |
| <a id="rightslope"></a> `rightSlope` | `number` |
| <a id="topwidth"></a> `topWidth` | `number` |
| <a id="weircoefficient"></a> `weirCoefficient` | `number` |

***

### BreachLocation

Dam/Levee breach configuration

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="calculatordata"></a> `calculatorData?` | [`BreachCalculatorData`](#breachcalculatordata) |
| <a id="description"></a> `description` | `string` |
| <a id="dlbreachsettings"></a> `dlBreachSettings` | [`DLBreachSettings`](#dlbreachsettings-1) |
| <a id="enabled"></a> `enabled` | `boolean` |
| <a id="geometry"></a> `geometry` | [`BreachGeometry`](#breachgeometry) |
| <a id="masswastingoptions"></a> `massWastingOptions` | `number` |
| <a id="method"></a> `method` | `number` |
| <a id="physicaldowncutting"></a> `physicalDowncutting` | [`PhysicalBreachParams`](#physicalbreachparams)[] |
| <a id="physicalwidening"></a> `physicalWidening` | [`PhysicalBreachParams`](#physicalbreachparams)[] |
| <a id="progression"></a> `progression` | [`BreachProgressionPoint`](#breachprogressionpoint)[] |
| <a id="reachname"></a> `reachName` | `string` |
| <a id="rivername"></a> `riverName` | `string` |
| <a id="start"></a> `start` | [`BreachStart`](#breachstart) |
| <a id="startingnotchdepth"></a> `startingNotchDepth?` | `number` |
| <a id="station-1"></a> `station` | `number` |
| <a id="userdefinedgrowthratio"></a> `userDefinedGrowthRatio` | `number` |
| <a id="useuserdefinedgrowthratio"></a> `useUserDefinedGrowthRatio` | `boolean` |

***

### BreachProgressionPoint

Breach progression data point

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="fraction"></a> `fraction` | `number` |
| <a id="time"></a> `time` | `number` |

***

### BreachStart

Breach starting conditions

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="failuremode"></a> `failureMode` | `number` |
| <a id="piping"></a> `piping` | `boolean` |
| <a id="pipingconditions"></a> `pipingConditions?` | `string`[] |
| <a id="triggerbytime"></a> `triggerByTime` | `boolean` |
| <a id="triggerconditions"></a> `triggerConditions?` | `string`[] |
| <a id="triggerelevation-1"></a> `triggerElevation` | `number` |

***

### CalibrationSettings

Calibration settings

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="iterations"></a> `iterations` | `number` |
| <a id="maxchange"></a> `maxChange` | `number` |
| <a id="maximum"></a> `maximum` | `number` |
| <a id="method-1"></a> `method` | `number` |
| <a id="minimum"></a> `minimum` | `number` |
| <a id="optimizationmethod"></a> `optimizationMethod` | `number` |
| <a id="tolerance"></a> `tolerance` | `number` |
| <a id="window"></a> `window?` | \[`string`, `string`, `string`, `string`\] |

***

### ComputationTimeStep

Computation time step configuration

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="counttodouble"></a> `countToDouble` | `number` |
| <a id="maxcourant"></a> `maxCourant?` | `number` |
| <a id="maxdoubling"></a> `maxDoubling` | `number` |
| <a id="maxhalving"></a> `maxHalving` | `number` |
| <a id="mincourant"></a> `minCourant?` | `number` |
| <a id="residencecourant"></a> `residenceCourant` | `number` |
| <a id="usecourant"></a> `useCourant` | `boolean` |
| <a id="usetimeseries"></a> `useTimeSeries` | `boolean` |

***

### DLBreachSettings

DL Breach (Dam/Levee Breach) settings

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="breachdirection"></a> `breachDirection` | `number` |
| <a id="coresoiltype"></a> `coreSoilType` | `number` |
| <a id="coveroption"></a> `coverOption` | `number` |
| <a id="methods"></a> `methods` | \[`number`, `number`\] |
| <a id="soiltype-1"></a> `soilType` | `number` |

***

### FlowSettings

Flow tolerances and iteration settings

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="criticaltol"></a> `criticalTol` | `number` |
| <a id="flowtolratio"></a> `flowTolRatio` | `number` |
| <a id="ksumbygr"></a> `kSumByGR` | `number` |
| <a id="maxerrortol"></a> `maxErrorTol` | `number` |
| <a id="numstdsteptrials"></a> `numStdStepTrials` | `number` |
| <a id="splitflowntrial"></a> `splitFlowNTrial` | `number` |
| <a id="splitflowratio"></a> `splitFlowRatio` | `number` |
| <a id="splitflowtol"></a> `splitFlowTol` | `number` |
| <a id="stdsteptol"></a> `stdStepTol` | `number` |
| <a id="subcriticalflow"></a> `subcriticalFlow` | `boolean` |

***

### Gate

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="dsspath-1"></a> `dssPath?` | `string` |
| <a id="fixedstartdatetime-1"></a> `fixedStartDateTime?` | `string` |
| <a id="name"></a> `name` | `string` |
| <a id="openings"></a> `openings` | `number`[] |
| <a id="timeinterval"></a> `timeInterval?` | `string` |
| <a id="usedss-1"></a> `useDSS?` | `boolean` |
| <a id="usefixedstarttime-1"></a> `useFixedStartTime?` | `boolean` |

***

### HDFSettings

HDF output settings

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="celldepths"></a> `cellDepths` | `boolean` |
| <a id="cellnetinflow"></a> `cellNetInflow` | `boolean` |
| <a id="cellvelocity"></a> `cellVelocity` | `boolean` |
| <a id="chunksize"></a> `chunkSize` | `number` |
| <a id="compression"></a> `compression` | `number` |
| <a id="eddyviscosity"></a> `eddyViscosity` | `boolean` |
| <a id="faceflow"></a> `faceFlow` | `boolean` |
| <a id="facenodevelocities"></a> `faceNodeVelocities` | `boolean` |
| <a id="faceshearstress"></a> `faceShearStress` | `boolean` |
| <a id="facetangentialvelocity"></a> `faceTangentialVelocity` | `boolean` |
| <a id="facewsel"></a> `faceWSEL` | `boolean` |
| <a id="fixedrows"></a> `fixedRows` | `number` |
| <a id="flush"></a> `flush` | `boolean` |
| <a id="spatialparts"></a> `spatialParts` | `number` |
| <a id="usemaxrows"></a> `useMaxRows` | `boolean` |
| <a id="writetimeslices"></a> `writeTimeSlices` | `boolean` |
| <a id="writewarmup"></a> `writeWarmup` | `boolean` |

***

### HECRASPlan

Main HEC-RAS Plan configuration

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="breachlocations"></a> `breachLocations` | [`BreachLocation`](#breachlocation)[] | - |
| <a id="calibrationsettings-1"></a> `calibrationSettings` | [`CalibrationSettings`](#calibrationsettings) | - |
| <a id="checkdata"></a> `checkData` | `boolean` | - |
| <a id="computationinterval"></a> `computationInterval` | `number` | Computation interval in seconds |
| <a id="computationtimestep-1"></a> `computationTimeStep` | [`ComputationTimeStep`](#computationtimestep) | - |
| <a id="description-1"></a> `description?` | `string` | - |
| <a id="dssfile-1"></a> `dssFile?` | `string` | - |
| <a id="echoinput"></a> `echoInput` | `boolean` | - |
| <a id="echooutput"></a> `echoOutput` | `boolean` | - |
| <a id="echoparameters"></a> `echoParameters` | `boolean` | - |
| <a id="encroachparam"></a> `encroachParam` | \[`number`, `number`, `number`, `number`\] | - |
| <a id="flowfile"></a> `flowFile` | `string` | - |
| <a id="flowsettings-1"></a> `flowSettings` | [`FlowSettings`](#flowsettings) | - |
| <a id="frictionslopemethod"></a> `frictionSlopeMethod` | `number` | - |
| <a id="geomfile"></a> `geomFile` | `string` | - |
| <a id="globalloglevel"></a> `globalLogLevel` | `number` | - |
| <a id="globalveldist"></a> `globalVelDist` | \[`number`, `number`, `number`\] | - |
| <a id="hdfsettings-1"></a> `hdfSettings` | [`HDFSettings`](#hdfsettings) | - |
| <a id="ictime"></a> `icTime?` | \[`string`, `string`, `string`\] | - |
| <a id="instantaneousinterval"></a> `instantaneousInterval` | `number` | Instantaneous interval in seconds |
| <a id="logoutputlevel"></a> `logOutputLevel` | `number` | - |
| <a id="mappinginterval"></a> `mappingInterval` | `number` | Mapping interval in seconds |
| <a id="outputinterval"></a> `outputInterval` | `number` | Output interval in seconds |
| <a id="paraboliccriticaldepth"></a> `parabolicCriticalDepth` | `boolean` | - |
| <a id="runflags"></a> `runFlags` | \{ `hTab`: `boolean`; `postProcess`: `boolean`; `rasMapper`: `boolean`; `sediment`: `boolean`; `uNet`: `boolean`; `wqNet`: `boolean`; \} | - |
| `runFlags.hTab` | `boolean` | - |
| `runFlags.postProcess` | `boolean` | - |
| `runFlags.rasMapper` | `boolean` | - |
| `runFlags.sediment` | `boolean` | - |
| `runFlags.uNet` | `boolean` | - |
| `runFlags.wqNet` | `boolean` | - |
| <a id="sedimentsettings"></a> `sedimentSettings` | [`SedimentSettings`](#sedimentsettings-1) | - |
| <a id="shortidentifier"></a> `shortIdentifier` | `string` | Short identifier Max 64 characters |
| <a id="simulationdate"></a> `simulationDate` | [`SimulationTimeWindow`](#simulationtimewindow) | - |
| <a id="stageflowhydrographs"></a> `stageFlowHydrographs` | [`StageFlowHydrograph`](#stageflowhydrograph)[] | - |
| <a id="title"></a> `title` | `string` | Title of the plan Max 40 characters |
| <a id="unetd1d2settings"></a> `unetD1D2Settings` | [`UnetD1D2Settings`](#unetd1d2settings-1) | - |
| <a id="unetd2areas"></a> `unetD2Areas` | [`UnetD2Settings`](#unetd2settings)[] | - |
| <a id="unetsettings"></a> `unetSettings` | [`UnetSettings`](#unetsettings-1) | - |
| <a id="unsteadybridgesfrictionslopemethod"></a> `unsteadyBridgesFrictionSlopeMethod` | `number` | - |
| <a id="unsteadyfrictionslopemethod"></a> `unsteadyFrictionSlopeMethod` | `number` | - |
| <a id="version"></a> `version` | `string` | - |
| <a id="waterqualitysettings"></a> `waterQualitySettings` | [`WaterQualitySettings`](#waterqualitysettings-1) | - |
| <a id="writedetailed"></a> `writeDetailed` | `boolean` | - |
| <a id="writeicfile"></a> `writeICFile` | `boolean` | - |
| <a id="writeicfileatfixeddatetime"></a> `writeICFileAtFixedDateTime` | `boolean` | - |
| <a id="writeicfileatsimend"></a> `writeICFileAtSimEnd` | `boolean` | - |
| <a id="writeicfilereoccurrence"></a> `writeICFileReoccurrence?` | `string` | - |

***

### InitialFlowLocation

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="flow"></a> `flow` | `number` |
| <a id="reach-1"></a> `reach` | `string` |
| <a id="river-1"></a> `river` | `string` |
| <a id="station-2"></a> `station` | `number` |

***

### InitialRRRElevation

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="elevation"></a> `elevation` | `number` |
| <a id="reach-2"></a> `reach` | `string` |
| <a id="river-2"></a> `river` | `string` |
| <a id="station-3"></a> `station` | `number` |

***

### InitialStorageElevation

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="elevation-1"></a> `elevation` | `number` | - |
| <a id="fixedduringwarmup"></a> `fixedDuringWarmup` | `boolean` | - |
| <a id="name-1"></a> `name` | `string` | Name of SA, IC Point or 2D Area |

***

### ManningSegment

Manning's roughness coefficient segment for a cross section.

#### Remarks

Defines the roughness (n-value) that applies from this station to the next segment.
Manning's n values typically range from 0.01 (smooth concrete) to 0.15+ (heavy brush).

#### Example

```typescript
const segment: ManningSegment = {
  station: 0,
  nValue: 0.035,  // Typical for natural channels
  unknownParameter: 0
}
```

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="nvalue"></a> `nValue` | `number` | Manning's n roughness coefficient |
| <a id="station-4"></a> `station` | `number` | Station where this roughness segment begins |
| <a id="unknownparameter"></a> `unknownParameter` | `number` | Additional parameter stored in HEC-RAS (purpose may vary by context) |

***

### MetPointRasterParameters

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="cellsize"></a> `cellSize` | `number` |
| <a id="cols"></a> `cols` | `number` |
| <a id="left"></a> `left` | `number` |
| <a id="right"></a> `right` | `number` |
| <a id="rows"></a> `rows` | `number` |

***

### PhysicalBreachParams

Physical breach parameters (simplified method)

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="multiplier"></a> `multiplier` | `number` |
| <a id="time-1"></a> `time` | `number` |

***

### SedimentSettings

Sediment transport settings

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="advectionscheme"></a> `advectionScheme` | `number` |
| <a id="bedroughnesspredictor"></a> `bedRoughnessPredictor` | `number` |
| <a id="convergencemaximumabsolute"></a> `convergenceMaximumAbsolute` | `number` |
| <a id="convergencermse"></a> `convergenceRMSE` | `number` |
| <a id="downstreamboundaryweight"></a> `downstreamBoundaryWeight` | `number` |
| <a id="downstreamxsweight"></a> `downstreamXSWeight` | `number` |
| <a id="dsssedimentoutputtype"></a> `dssSedimentOutputType` | `number` |
| <a id="energyslopemethod"></a> `energySlopeMethod` | `number` |
| <a id="gradationfilename"></a> `gradationFileName?` | `string` |
| <a id="hydraulicsupdatethreshold"></a> `hydraulicsUpdateThreshold` | `number` |
| <a id="implicitweightingfactor"></a> `implicitWeightingFactor` | `number` |
| <a id="initiallayerthickness"></a> `initialLayerThickness` | `number` |
| <a id="mainxsweight"></a> `mainXSWeight` | `number` |
| <a id="massorvolumeoutput"></a> `massOrVolumeOutput` | `number` |
| <a id="matrixsolver"></a> `matrixSolver` | `number` |
| <a id="maxlayerthickness"></a> `maxLayerThickness` | `number` |
| <a id="maxsubgridlengthscale"></a> `maxSubgridLengthScale` | `number` |
| <a id="maxsubgridregions"></a> `maxSubgridRegions` | `number` |
| <a id="minlayerthickness"></a> `minLayerThickness` | `number` |
| <a id="numberofdsweightedcrosssections"></a> `numberOfDSWeightedCrossSections` | `number` |
| <a id="numberofdsxsweightedwithusboundary"></a> `numberOfDSXSWeightedWithUSBoundary` | `number` |
| <a id="numberoflayers"></a> `numberOfLayers` | `number` |
| <a id="numberofusweightedcrosssections"></a> `numberOfUSWeightedCrossSections` | `number` |
| <a id="numberofusxsweightedwithdsboundary"></a> `numberOfUSXSWeightedWithDSBoundary` | `number` |
| <a id="outputincrementtype"></a> `outputIncrementType` | `number` |
| <a id="percentilemethod"></a> `percentileMethod` | `number` |
| <a id="profileandtsoutputincrement"></a> `profileAndTSOutputIncrement` | `number` |
| <a id="readgradationhotstart"></a> `readGradationHotstart` | `boolean` |
| <a id="readhdf5sedimenthotstart"></a> `readHDF5SedimentHotstart` | `boolean` |
| <a id="sedimenthotstartdate"></a> `sedimentHotstartDate?` | `string` |
| <a id="sedimenthotstartfile"></a> `sedimentHotstartFile?` | `string` |
| <a id="sedimenthotstarttime"></a> `sedimentHotstartTime?` | `string` |
| <a id="sedimenthotstarttype"></a> `sedimentHotstartType` | `number` |
| <a id="sedimentoutputlevel"></a> `sedimentOutputLevel` | `number` |
| <a id="sedimentretentionmethod"></a> `sedimentRetentionMethod` | `number` |
| <a id="sedimenttsmultiplier"></a> `sedimentTSMultiplier` | `number` |
| <a id="sortingandarmoringiterations"></a> `sortingAndArmoringIterations` | `number` |
| <a id="specificgageflag"></a> `specificGageFlag` | `number` |
| <a id="subcelldepositionmethods"></a> `subcellDepositionMethods` | `number` |
| <a id="subcellerosionmethods"></a> `subcellErosionMethods` | `number` |
| <a id="svcurve"></a> `svCurve` | `number` |
| <a id="transportoutputincrement"></a> `transportOutputIncrement` | `number` |
| <a id="upstreamboundaryweight"></a> `upstreamBoundaryWeight` | `number` |
| <a id="upstreamxsweight"></a> `upstreamXSWeight` | `number` |
| <a id="volumechangemethod"></a> `volumeChangeMethod` | `number` |
| <a id="warmupduration"></a> `warmUpDuration?` | `string` |
| <a id="warmupmethod"></a> `warmUpMethod` | `number` |
| <a id="weightofxssassociatedwithdsboundary"></a> `weightOfXSsAssociatedWithDSBoundary` | `number` |
| <a id="weightofxssassociatedwithusboundary"></a> `weightOfXSsAssociatedWithUSBoundary` | `number` |
| <a id="writebinaryoutput"></a> `writeBinaryOutput` | `boolean` |
| <a id="writedsssedimentfile"></a> `writeDSSSedimentFile` | `boolean` |
| <a id="writegradationfile"></a> `writeGradationFile` | `boolean` |
| <a id="writehdf5file"></a> `writeHDF5File` | `boolean` |
| <a id="xsoutputflag"></a> `xsOutputFlag` | `number` |
| <a id="xsoutputincrement"></a> `xsOutputIncrement` | `number` |
| <a id="xsupdatethreshold"></a> `xsUpdateThreshold` | `number` |
| <a id="xsweightingmethod"></a> `xsWeightingMethod` | `number` |

***

### SerializeOptions

Options for serializing HEC-RAS data back to string format.

#### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="lineendings"></a> `lineEndings?` | [`LineEndings`](#lineendings-1) | `"\r\n"` (Windows line endings) | Line ending style for the output. **Remarks** HEC-RAS is a Windows application and expects Windows-style line endings (`\r\n`). Using Unix-style line endings (`\n`) may cause compatibility issues. |

***

### SimulationTimeWindow

Simulation date/time information

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="enddate"></a> `endDate` | `string` | Format is DDMMMYYYY (e.g., 01JAN2020) |
| <a id="endtime"></a> `endTime` | `string` | Format is HHMM (e.g., 1300 for 1:00 PM) |
| <a id="startdate"></a> `startDate` | `string` | Format is DDMMMYYYY (e.g., 01JAN2020) |
| <a id="starttime"></a> `startTime` | `string` | Format is HHMM (e.g., 1300 for 1:00 PM) |

***

### StageFlowHydrograph

Stage flow hydrograph location

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="reachname-1"></a> `reachName` | `string` |
| <a id="rivername-1"></a> `riverName` | `string` |
| <a id="station-5"></a> `station` | `number` |

***

### StationElevationPoint

A point on a cross section defined by station (distance along the section) and elevation.

#### Remarks

Station values increase from left to right when looking downstream.
Elevations are typically in feet or meters depending on the model units.

#### Example

```typescript
const point: StationElevationPoint = { station: 100.0, elevation: 525.5 }
```

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="elevation-2"></a> `elevation` | `number` | Vertical elevation at this station |
| <a id="station-6"></a> `station` | `number` | Distance along the cross section from the left bank (when looking downstream) |

***

### UnetD1D2Settings

D1D2 coupling settings

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="maxiter"></a> `maxIter` | `number` |
| <a id="minqtol"></a> `minQTol?` | `number` |
| <a id="qtol"></a> `qTol` | `number` |
| <a id="ztol"></a> `zTol` | `number` |

***

### UnetD2Settings

2D area-specific settings

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="bcvolumecheck"></a> `bcVolumeCheck` | `boolean` |
| <a id="cores"></a> `cores` | `number` |
| <a id="coriolis"></a> `coriolis` | `boolean` |
| <a id="eddyviscosity-1"></a> `eddyViscosity?` | `number` |
| <a id="equation"></a> `equation` | `number` |
| <a id="latitude"></a> `latitude?` | `number` |
| <a id="maxiterations"></a> `maxIterations` | `number` |
| <a id="name-2"></a> `name` | `string` |
| <a id="rampupfraction"></a> `rampUpFraction` | `number` |
| <a id="smagorinskymixing"></a> `smagorinskyMixing?` | `number` |
| <a id="solvertype"></a> `solverType` | `string` |
| <a id="theta"></a> `theta` | `number` |
| <a id="thetawarmup"></a> `thetaWarmup` | `number` |
| <a id="timeslices"></a> `timeSlices` | `number` |
| <a id="totalictime"></a> `totalICTime?` | `number` |
| <a id="transverseeddyviscosity"></a> `transverseEddyViscosity?` | `number` |
| <a id="volumetol"></a> `volumeTol` | `number` |
| <a id="ztol-1"></a> `zTol` | `number` |

***

### UnetSettings

UNET solver configuration

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="d1cores"></a> `d1Cores` | `number` |
| <a id="dssmlevel"></a> `dssMLevel` | `number` |
| <a id="dtic"></a> `dtIC` | `number` |
| <a id="dtmin"></a> `dtMin` | `number` |
| <a id="dzmaxabort"></a> `dzMaxAbort` | `number` |
| <a id="froudelimit"></a> `froudeLimit` | `number` |
| <a id="froudepower"></a> `froudePower` | `number` |
| <a id="froudereduction"></a> `froudeReduction` | `boolean` |
| <a id="maxcrts"></a> `maxCRTS` | `number` |
| <a id="maxinsteps"></a> `maxInSteps` | `number` |
| <a id="maxiter-1"></a> `maxIter` | `number` |
| <a id="maxiterwoimprovement"></a> `maxIterWOImprovement` | `number` |
| <a id="methodology"></a> `methodology` | `string` |
| <a id="pardiso"></a> `pardiso` | `boolean` |
| <a id="qtol-1"></a> `qTol?` | `number` |
| <a id="sfstab"></a> `sfStab` | `number` |
| <a id="sfx"></a> `sfX` | `number` |
| <a id="theta-1"></a> `theta` | `number` |
| <a id="thetawarmup-1"></a> `thetaWarmup` | `number` |
| <a id="useexistingibtables"></a> `useExistingIBTables` | `boolean` |
| <a id="wfstab"></a> `wfStab` | `number` |
| <a id="wfx"></a> `wfX` | `number` |
| <a id="winddragformulation"></a> `windDragFormulation` | `string` |
| <a id="windreference"></a> `windReference` | `string` |
| <a id="zsatol"></a> `zSATol` | `number` |
| <a id="ztol-2"></a> `zTol` | `number` |

***

### UnparsedLine

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="content"></a> `content` | `string` |
| <a id="index"></a> `index` | `number` |

***

### UnsteadyFlow

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="boundaries"></a> `boundaries` | [`BoundaryCondition`](#boundarycondition)[] |
| <a id="flowtitle"></a> `flowTitle?` | `string` |
| <a id="globalflowhydrograph"></a> `globalFlowHydrograph?` | `number`[] |
| <a id="initialflowlocations"></a> `initialFlowLocations` | [`InitialFlowLocation`](#initialflowlocation)[] |
| <a id="initialrrrelevations"></a> `initialRRRElevations` | [`InitialRRRElevation`](#initialrrrelevation)[] |
| <a id="initialstorageelevations"></a> `initialStorageElevations` | [`InitialStorageElevation`](#initialstorageelevation)[] |
| <a id="lava"></a> `lava?` | `Record`\<`string`, `string`\> |
| <a id="metbc"></a> `metBC` | `string`[] |
| <a id="metpointrasterparameters-1"></a> `metPointRasterParameters?` | [`MetPointRasterParameters`](#metpointrasterparameters) |
| <a id="programversion"></a> `programVersion?` | `string` |
| <a id="restartfile"></a> `restartFile?` | `string` |
| <a id="unparsedlines"></a> `unparsedLines?` | [`UnparsedLine`](#unparsedline)[] |
| <a id="userestart"></a> `useRestart?` | `boolean` |

***

### UpstreamDownstreamPair

Upstream and downstream station pair for ineffective flow areas or blocked obstructions.

#### Remarks

Defines a range along a cross section. Null values indicate the parameter is not set.

#### Example

```typescript
const range: UpstreamDownstreamPair = {
  upstreamStation: 50,
  downstreamStation: 150
}
```

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="downstreamstation"></a> `downstreamStation` | `number` \| `null` | Ending station of the range (null if not defined) |
| <a id="upstreamstation"></a> `upstreamStation` | `number` \| `null` | Starting station of the range (null if not defined) |

***

### VolumeElevationPoint

A point on a storage area's elevation-volume curve.

#### Remarks

Storage areas use these curves to define how volume (or area) changes with water surface elevation.
The curve is typically monotonically increasing.

#### Example

```typescript
const point: VolumeElevationPoint = {
  elevation: 100.0,
  volume: 50000  // acre-feet or cubic meters depending on units
}
```

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="elevation-3"></a> `elevation` | `number` | Water surface elevation |
| <a id="volume-1"></a> `volume` | `number` | Storage volume (or area) at this elevation |

***

### WaterQualitySettings

Water Quality settings

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="adnonconservative"></a> `adNonConservative` | `boolean` |
| <a id="createrestart"></a> `createRestart` | `boolean` |
| <a id="fixedrestart"></a> `fixedRestart` | `boolean` |
| <a id="maxcompstep"></a> `maxCompStep` | `string` |
| <a id="outputflags"></a> `outputFlags` | \{ `cellContinuity`: `boolean`; `cellMass`: `boolean`; `cellSourceSinkTemp`: `boolean`; `cellSurfaceArea`: `boolean`; `cellVolume`: `boolean`; `cumulativeCellContinuity`: `boolean`; `faceAdvMass`: `boolean`; `faceArea`: `boolean`; `faceConc`: `boolean`; `faceCourant`: `boolean`; `faceDconcDx`: `boolean`; `faceDispersion`: `boolean`; `faceDispMass`: `boolean`; `faceFlow`: `boolean`; `facePeclet`: `boolean`; `faceVelocity`: `boolean`; `nsmDerivedPathways`: `boolean`; `nsmPathways`: `boolean`; \} |
| `outputFlags.cellContinuity` | `boolean` |
| `outputFlags.cellMass` | `boolean` |
| `outputFlags.cellSourceSinkTemp` | `boolean` |
| `outputFlags.cellSurfaceArea` | `boolean` |
| `outputFlags.cellVolume` | `boolean` |
| `outputFlags.cumulativeCellContinuity` | `boolean` |
| `outputFlags.faceAdvMass` | `boolean` |
| `outputFlags.faceArea` | `boolean` |
| `outputFlags.faceConc` | `boolean` |
| `outputFlags.faceCourant` | `boolean` |
| `outputFlags.faceDconcDx` | `boolean` |
| `outputFlags.faceDispersion` | `boolean` |
| `outputFlags.faceDispMass` | `boolean` |
| `outputFlags.faceFlow` | `boolean` |
| `outputFlags.facePeclet` | `boolean` |
| `outputFlags.faceVelocity` | `boolean` |
| `outputFlags.nsmDerivedPathways` | `boolean` |
| `outputFlags.nsmPathways` | `boolean` |
| <a id="outputinterval-1"></a> `outputInterval` | `string` |
| <a id="outputselectedincrements"></a> `outputSelectedIncrements` | `boolean` |
| <a id="restartdate"></a> `restartDate?` | `string` |
| <a id="restarthour"></a> `restartHour?` | `string` |
| <a id="restartsimtime"></a> `restartSimtime?` | `string` |
| <a id="systemsummary"></a> `systemSummary` | `boolean` |
| <a id="ultimate"></a> `ultimate` | `boolean` |
| <a id="writetodss"></a> `writeToDSS` | `boolean` |

## Type Aliases

### Coordinate

```ts
type Coordinate = [number, number];
```

A coordinate pair representing a point in 2D space.

#### Remarks

Used for geographic coordinates, polygon vertices, and other spatial data.
In HEC-RAS files, coordinates are typically stored as 16-character fixed-width values.

#### Example

```typescript
const point: Coordinate = [123456.789, 987654.321]
const [x, y] = point
```

***

### DateTime

```ts
type DateTime = {
  date: string;
  time: string;
};
```

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="date"></a> `date` | `string` | DDMMMYYYY |
| <a id="time-2"></a> `time` | `string` | HHMM 24 hour |

***

### Geometry

```ts
type Geometry = Infer<typeof geometrySchema>;
```

Parsed HEC-RAS geometry file data structure.

#### Remarks

Contains rivers, reaches, cross sections, storage areas, junctions, boundary conditions,
and other geometric elements. The exact shape is inferred from the geometry schema.

#### See

 - [parseGeometry](#parsegeometry) to parse a geometry file into this type
 - [serializeGeometry](#serializegeometry) to serialize this type back to a string

***

### Infer

```ts
type Infer<Def> = InferWithDepth<Def, SchemaDepthLimit>;
```

#### Type Parameters

| Type Parameter |
| ------ |
| `Def` *extends* `SchemaDef` |

***

### LineEndings

```ts
type LineEndings = "\r\n" | "\n";
```

Line ending style for serialized output.

#### Remarks

HEC-RAS typically expects Windows-style line endings (`\r\n`).
Unix-style (`\n`) is supported but may cause issues with some HEC-RAS versions.

***

### Plan

```ts
type Plan = Infer<typeof planSchema>;
```

Parsed HEC-RAS plan file data structure.

#### Remarks

Contains simulation settings, solver configuration, time windows, and other plan parameters.
The exact shape is inferred from the plan schema.

#### See

 - [parsePlan](#parseplan) to parse a plan file into this type
 - [serializePlan](#serializeplan) to serialize this type back to a string

***

### StationElevation

```ts
type StationElevation = [number, number];
```

A station-elevation pair as a tuple.

#### Remarks

Compact representation of a point on a cross section.
Equivalent to [StationElevationPoint](#stationelevationpoint) but as an array.

#### Example

```typescript
const point: StationElevation = [100.0, 525.5]
const [station, elevation] = point
```

***

### UpstreamDownstreamValue

```ts
type UpstreamDownstreamValue = [number, number, number];
```

Tuple representing upstream station, downstream station, and elevation.

#### Remarks

Used for features that span a station range at a specific elevation,
such as ineffective flow areas that activate above a certain water level.

#### Example

```typescript
const value: UpstreamDownstreamValue = [50, 150, 525.0]
const [upStn, downStn, elev] = value
```

***

### XY

```ts
type XY = [number, number];
```

A 2D coordinate as a tuple (alias for [Coordinate](#coordinate)).

#### Remarks

Used interchangeably with Coordinate throughout the codebase.

#### Example

```typescript
const point: XY = [123456.789, 987654.321]
```

## Variables

### geometrySchema

```ts
const geometrySchema: readonly [MultiFieldItem<Record<"geomTitle", Part<string>>, false>, MultiFieldItem<Record<"programVersion", Part<string>>, false>, TupleFieldItem<"viewingRectangle", readonly [Part<number>, Part<number>, Part<number>, Part<number>], false>, BlankLineItem, TextBlockFieldItem<"description", true>, RepeatItem<"junctions", readonly [MultiFieldItem<Record<"name", Part<string>>, false>, MultiFieldItem<{
  addFriction: Part<boolean>;
  addWeight: Part<boolean>;
  description: Part<string>;
  steadyFlowComputationMode: Part<boolean>;
  unsteadyComputationMode: Part<boolean>;
}, false>, MultiFieldItem<{
  positionX: Part<number>;
  positionY: Part<number>;
  textPositionX: Part<number>;
  textPositionY: Part<number>;
}, false>, RepeatItem<"upstreamConnections", readonly [MultiFieldItem<{
  reach: Part<string>;
  river: Part<string>;
}, false>]>, MultiFieldItem<{
  downstreamReach: Part<string>;
  downstreamRiver: Part<string>;
}, false>, RepeatItem<"lengthAndAngles", readonly [MultiFieldItem<{
  angle: Part<number | null>;
  length: Part<number | null>;
}, false>]>, BlankLineItem]>, RepeatItem<"rivers", readonly [MultiFieldItem<{
  reachName: Part<string>;
  riverName: Part<string>;
}, false>, TupleArrayFieldItem<"coordinates", 2, false, false>, TupleFieldItem<"textPosition", readonly [Part<number>, Part<number>], true>, MultiFieldItem<Record<"reversedText", Part<boolean>>, false>, MultiFieldItem<Record<"downstreamStorageArea", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"upstreamStorageArea", Part<string | undefined> & {
  isOptional: true;
}>, false>, BlankLineItem, ContextualItem<"riverStationEntries", Simplify<object & {
  description?: string;
} & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & {
  gisCutLine?: [..., ...][];
} & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & {
  stationElevation: [... | ..., ... | ...][];
} & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & {
  mannings: [... | ..., ... | ..., ... | ...][];
} & Simplify<Partial<Simplify<... & ...>>> & Simplify<Partial<Simplify<... & ...>>> & {
  ineffectiveFlowAreas?: [..., ..., ...][];
} & {
  permanentIneffective?: boolean[];
} & Simplify<Partial<Simplify<... & ...>>> & {
  obstructions?: [..., ..., ...][];
} & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & {
  ratingCurve: [... | ..., ... | ...][];
} & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Partial<Simplify<... & ...>>> & Simplify<Partial<Simplify<... & ...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Partial<Simplify<... & ...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & {
  deck?: {
     deckDistance: number;
     downstream: ...[];
     downstreamEmbankmentSideSlope: ... | ...;
     isOgee: number;
     maxHighCoordinate: ... | ...;
     maxSubmerge: number;
     minLowCoordinate: ... | ...;
     numberOfDownstreamStations: number;
     numberOfUpstreamStations: number;
     skew: number;
     spillwayApproachHeight: ... | ...;
     spillwayDesignHead: ... | ...;
     upstream: ...[];
     upstreamEmbankmentSideSlope: ... | ...;
     weirCoefficient: number;
     width: number;
  };
} & Simplify<Partial<Simplify<... & ...>>> & Simplify<Partial<Simplify<... & ...>>> & {
  culverts: Simplify<... & ... & ... & ... & ... & ...>[];
} & {
  multipleBarrelCulverts: Simplify<... & ... & ... & ... & ... & ...>[];
} & {
  upstreamInternalStationElevations?: [..., ...][];
} & {
  upstreamInternalMannings?: [..., ...][];
} & {
  upstreamBanks?: [... | ..., ... | ...];
} & {
  downstreamInternalStationElevations?: [..., ...][];
} & {
  downstreamInternalMannings?: [..., ...][];
} & {
  downstreamBanks?: [... | ..., ... | ...];
} & Simplify<Partial<Simplify<... & ...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & {
  deck?: {
     deckDistance: number;
     downstream: ...[];
     downstreamEmbankmentSideSlope: ... | ...;
     isOgee: number;
     maxHighCoordinate: ... | ...;
     maxSubmerge: number;
     minLowCoordinate: ... | ...;
     numberOfDownstreamStations: number;
     numberOfUpstreamStations: number;
     skew: number;
     spillwayApproachHeight: ... | ...;
     spillwayDesignHead: ... | ...;
     upstream: ...[];
     upstreamEmbankmentSideSlope: ... | ...;
     weirCoefficient: number;
     width: number;
  };
} & {
  piers: Simplify<... & ... & ...>[];
} & Simplify<Partial<Simplify<... & ...>>> & Simplify<Partial<Simplify<... & ...>>> & Simplify<Partial<Simplify<... & ...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & {
  stageElevationPairs: [... | ..., ... | ...][];
} & {
  weirParameters?: {
     additionalParam1: number;
     additionalParam2: number;
     additionalParam3: ... | ...;
     designHead: ... | ...;
     distance: number;
     isOgee: boolean;
     maxSubmergence: number;
     minimumElevation: ... | ...;
     skew: number;
     spillHeight: ... | ...;
     weirCoefficient: number;
     weirWidth: number;
  };
} & {
  gates: Simplify<... & ... & ... & ...>[];
} & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>> & {
  headwaterConnections: Simplify<Simplify<...>>[];
} & {
  tailwaterConnections: Simplify<Simplify<...>>[];
} & {
  gate?: {
     designHead: ... | ...;
     expH: ... | ...;
     expO: ... | ...;
     expT: ... | ...;
     gateName: string;
     gateOpenings: ...[];
     gatePositions: ...[];
     gCoef: ... | ...;
     height: ... | ...;
     invert: ... | ...;
     isOgee: boolean;
     spillwayHeight: ... | ...;
     type: ... | ...;
     unknown1: ... | ...;
     unknown2: ... | ...;
     unknown3: boolean;
     unknown4: ... | ...;
     unknown5: ... | ...;
     unknown6: ... | ...;
     unknown7: ... | ...;
     unknown8: ... | ...;
     unknown9: boolean;
     wCoef: ... | ...;
     width: ... | ...;
  };
} & Simplify<Simplify<RequiredFields<...> & OptionalFields<...>>>>[]>]>, RepeatItem<"storageAreas", readonly [MultiFieldItem<{
  centroidX: Part<number | null>;
  centroidY: Part<number | null>;
  id: Part<string>;
}, false>, ContextualItem<"surfaceLine", [number, number][]>, MultiFieldItem<Record<"type", Part<number>>, false>, MultiFieldItem<Record<"area", Part<string>>, false>, MultiFieldItem<Record<"minElevation", Part<number | null>>, false>, TupleArrayFieldItem<"volumeElevation", 2, true, true>, MultiFieldItem<Record<"is2D", Part<boolean>>, false>, MultiFieldItem<Record<"pointGenerationData", Part<string>>, false>, TupleArrayFieldItem<"points2D", 2, false, false>, MultiFieldItem<Record<"pointsPerimeterTime", Part<string>>, false>, MultiFieldItem<Record<"mannings", Part<number | null>>, false>, MultiFieldItem<Record<"cellVolumeFilterTolerance", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"cellMinimumAreaFraction", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"faceProfileFilterTolerance", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"faceAreaElevationProfileFilterTolerance", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"faceAreaElevationConveyanceRatio", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"faceMinLengthRatio", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"faceAreaLaminarDepth", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"multipleFaceMannN", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"compositeLC", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"locked", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, BlankLineItem]>, RepeatItem<"breakLines", readonly [MultiFieldItem<Record<"name", Part<string>>, false>, MultiFieldItem<Record<"cellSizeMin", Part<number | null>>, false>, MultiFieldItem<Record<"cellSizeMax", Part<number | null>>, false>, MultiFieldItem<Record<"nearRepeats", Part<number>>, false>, MultiFieldItem<Record<"protectionRadius", Part<number>>, false>, TupleArrayFieldItem<"polylinePoints", 2, false, false>]>, RepeatItem<"connections", readonly [MultiFieldItem<{
  centroidX: Part<number | null>;
  centroidY: Part<number | null>;
  name: Part<string>;
}, false>, MultiFieldItem<Record<"description", Part<string | undefined> & {
  isOptional: true;
}>, false>, TupleArrayFieldItem<"connectionLine", 2, false, false>, TupleArrayFieldItem<"centerlineProfile", 2, true, true>, MultiFieldItem<Record<"lastEditedTime", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"cellSizeMin", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"cellSizeMax", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"nearRepeats", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"protectionRadius", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"upstreamStorageArea", Part<string>>, false>, MultiFieldItem<Record<"downstreamStorageArea", Part<string>>, false>, MultiFieldItem<Record<"routingType", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"useRCFamily", Part<boolean | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"overflowMethod2D", Part<boolean | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"weirWD", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"weirCoefficient", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"weirIsOgee", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"weirDesignEG", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"weirDesignHT", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"simpleSpillPosCoef", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"simpleSpillNegCoef", Part<number | undefined> & {
  isOptional: true;
}>, false>, TupleArrayFieldItem<"weirSE", 2, true, true>, RepeatItem<"culverts", readonly [MultiFieldItem<{
  chart: Part<number>;
  culvertGroupName: Part<string>;
  downstreamInvert: Part<number>;
  entranceLoss: Part<number>;
  exitLoss: Part<number>;
  length: Part<number>;
  nTop: Part<number>;
  numberOfBarrels: CountedArrayLengthPart;
  rise: Part<number>;
  scale: Part<number>;
  shape: Part<number>;
  span: Part<number>;
  unknownFlag: Part<boolean>;
  unknownParameter: Part<number | null>;
  upstreamInvert: Part<number>;
}, false>, CountedArrayFieldItem<"barrelStations", 2, true, false>, RepeatItem<"barrels", readonly [MultiFieldItem<{
  index: Part<number>;
  name: Part<string>;
  numberOfCoordinates: CountedArrayLengthPart;
}, false>, CountedArrayFieldItem<"coordinates", 2, false, false>]>, MultiFieldItem<Record<"nBottom", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"nBottomDepth", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"depthBlocked", Part<number | undefined> & {
  isOptional: true;
}>, false>]>, MultiFieldItem<Record<"hTabHWMax", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hTabTWMax", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hTabMaxFlow", Part<number | undefined> & {
  isOptional: true;
}>, false>, BlankLineItem, MultiFieldItem<{
  numberOfPoints: CountedArrayLengthPart;
  param1: Part<boolean>;
  param2: Part<number | null>;
  param3: Part<number | null>;
}, false>, CountedArrayFieldItem<"outletRatingCurve", 2, true, true>, IncludeItem<readonly [ContextualItem<"gate", {
  designHead: number | null;
  expH: number;
  expO: number;
  expT: number;
  gateCoefficient: number | null;
  height: number;
  invert: number;
  isOgee: number;
  name: string;
  numberOfOpenings: number;
  openings: GateOpeningSchema[];
  openingStations: number[];
  param15: number;
  param16: number;
  param17: number;
  param18: number | null;
  param19: number | null;
  param20: number;
  param21: number;
  param22: number;
  param23: number;
  spillHeight: number | null;
  type: number;
  weirCoefficient: number;
  width: number;
}>]>, SectionItem<"bridge", readonly [MultiFieldItem<{
  classBDefaults: Part<boolean>;
  contractionCoefficient: Part<number | null>;
  expansionCoefficient: Part<number | null>;
  momentumEquationAddFriction: Part<boolean>;
  momentumEquationAddWeight: Part<boolean>;
  param5: Part<boolean>;
  pressureFlowCriteria: Part<boolean>;
}, false>, MultiFieldItem<{
  weirValue1: Part<number | null>;
  weirValue2: Part<number | null>;
  weirValue3: Part<number | null>;
  weirValue4: Part<number | null>;
  weirValue5: Part<number | null>;
}, true>, ContextualItem<"deck", {
  deckDistance: number;
  downstream: [number | null, number | null, number | null][];
  downstreamEmbankmentSideSlope: number | null;
  isOgee: number;
  maxHighCoordinate: number | null;
  maxSubmerge: number;
  minLowCoordinate: number | null;
  numberOfDownstreamStations: number;
  numberOfUpstreamStations: number;
  skew: number;
  spillwayApproachHeight: number | null;
  spillwayDesignHead: number | null;
  upstream: [number | null, number | null, number | null][];
  upstreamEmbankmentSideSlope: number | null;
  weirCoefficient: number;
  width: number;
}>, ContextualItem<"upstreamInside", {
  id: number;
  leftBank: number | null;
  manningCoefficients: [number, number][];
  rightBank: number | null;
  stationElevation: [number, number][];
}>, ContextualItem<"downstreamInside", {
  id: number;
  leftBank: number | null;
  manningCoefficients: [number, number][];
  rightBank: number | null;
  stationElevation: [number, number][];
}>, RepeatItem<"piers", readonly [MultiFieldItem<{
  applyFloatingDebris: Part<number>;
  centerlineStationDownstream: Part<number>;
  centerlineStationUpstream: Part<number>;
  debrisHeight: Part<... | ...>;
  debrisWidth: Part<... | ...>;
  downstreamPointCount: Part<number>;
  skew: {
     internal?: ... | ... | ...;
     internalKey?: ... | ...;
     isOptional?: ... | ... | ...;
     nullOnBlank?: ... | ... | ...;
     derive?: string;
     parse: string;
     serialize: string;
     storeInternal?: void;
  };
  unusedDownstream: Part<number>;
  unusedUpstream: Part<number>;
  upstreamPointCount: Part<number>;
}, false>, ContextualItem<"upstream", {
  elevation: number;
  width: number;
}[]>, ContextualItem<"downstream", {
  elevation: number;
  width: number;
}[]>]>, MultiFieldItem<{
  bridgeCoefficient1: Part<string>;
  bridgeCoefficient10: Part<number | null>;
  bridgeCoefficient2: Part<string>;
  bridgeCoefficient3: Part<string>;
  bridgeCoefficient4: Part<number | null>;
  bridgeCoefficient5: Part<number | null>;
  bridgeCoefficient6: Part<number | null>;
  bridgeCoefficient7: Part<boolean>;
  bridgeCoefficient8: Part<number | null>;
  bridgeCoefficient9: Part<boolean>;
}, true>, MultiFieldItem<Record<"skew", Part<number | undefined> & {
  isOptional: true;
}>, false>, ContextualItem<"upstreamExternal", {
  id: number;
  leftBank: number | null;
  manningCoefficients: [number, number][];
  rightBank: number | null;
  stationElevation: [number, number][];
}>, ContextualItem<"downstreamExternal", {
  id: number;
  leftBank: number | null;
  manningCoefficients: [number, number][];
  rightBank: number | null;
  stationElevation: [number, number][];
}>, TupleFieldItem<"upstreamIneffectiveFlowArea", readonly [Part<number>, Part<number>, Part<number>, Part<number>], false>, TupleFieldItem<"downstreamIneffectiveFlowArea", readonly [Part<number>, Part<number>, Part<number>, Part<number>], false>]>]>, RepeatItem<"boundaryConditions", readonly [MultiFieldItem<Record<"name", Part<string>>, false>, MultiFieldItem<Record<"storageArea", Part<string>>, false>, TupleFieldItem<"startPosition", readonly [Part<number>, Part<number>], false>, TupleFieldItem<"middlePosition", readonly [Part<number>, Part<number>], false>, TupleFieldItem<"endPosition", readonly [Part<number>, Part<number>], false>, TupleArrayFieldItem<"arcCoordinates", 2, false, false>, TupleFieldItem<"textPosition", readonly [Part<number>, Part<number>], false>]>, RepeatItem<"icPoints", readonly [MultiFieldItem<Record<"name", Part<string>>, false>, MultiFieldItem<{
  x: Part<number>;
  y: Part<number>;
}, false>]>, RepeatItem<"streamNodes", readonly [MultiFieldItem<{
  description: Part<string>;
  index1: Part<number>;
  index2: Part<number>;
  reach: Part<string>;
  river: Part<string>;
}, false>, BlankLineItem]>, SectionItem<"landCover", readonly [MultiFieldItem<Record<"lastEdited", Part<string>>, false>, MultiFieldItem<Record<"lastEditedRegion", Part<string | undefined> & {
  isOptional: true;
}>, false>, ContextualItem<"table", [string, number][]>, RepeatItem<"regions", readonly [MultiFieldItem<Record<"name", Part<string>>, false>, ContextualItem<"table", [string, number][]>, TupleArrayFieldItem<"polygon", 2, false, false>]>]>, MultiFieldItem<Record<"channelStopCuts", Part<boolean>>, false>, BlankLinesItem, MultiFieldItem<{
  geomRasterCellSize: Part<number | null>;
  geomRasterClipToGeometry: Part<boolean>;
  geomRasterEnabled: Part<boolean>;
  geomRasterPath: Part<string>;
  geomRasterType: Part<string>;
}, true>, MultiFieldItem<Record<"useUserSpecifiedReachOrder", Part<boolean | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<{
  userSpecifiedReachOrderReach: Part<string>;
  userSpecifiedReachOrderRiver: Part<string>;
}, true>, MultiFieldItem<Record<"gisUnits", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"gisDtmType", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"gisDtmPath", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"gisStreamLayer", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"gisCrossSectionLayer", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"gisMapProjection", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"gisProjectionZone", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"gisDatum", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"gisVerticalDatum", Part<string | undefined> & {
  isOptional: true;
}>, false>, TupleFieldItem<"gisDataExtents", readonly [Part<number>, Part<number>, Part<number>, Part<number>], true>, ConditionalBlankLineItem, MultiFieldItem<Record<"gisRatioCutsToInvert", Part<boolean | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"gisLimitAtBridges", Part<boolean | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"compositeChannelSlope", Part<number | undefined> & {
  isOptional: true;
}>, false>, BlankLineItem];
```

***

### planSchema

```ts
const planSchema: readonly [MultiFieldItem<Record<"planTitle", Part<string>>, false>, MultiFieldItem<Record<"programVersion", Part<string>>, false>, MultiFieldItem<Record<"shortIdentifier", Part<string>>, false>, MultiFieldItem<{
  endDate: Part<string>;
  endTime: Part<string>;
  startDate: Part<string>;
  startTime: Part<string>;
}, false>, MultiFieldItem<Record<"geometryFile", Part<string>>, false>, MultiFieldItem<Record<"flowFile", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"sedimentFile", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"waterQualityFile", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"flowRegime", Part<string>>, false>, MultiFieldItem<Record<"kSumByGR", Part<boolean>>, false>, MultiFieldItem<Record<"stdStepTol", Part<number>>, false>, MultiFieldItem<Record<"criticalTol", Part<number>>, false>, MultiFieldItem<Record<"numOfStdStepTrials", Part<number>>, false>, MultiFieldItem<Record<"maxErrorTol", Part<number>>, false>, MultiFieldItem<Record<"flowTolRatio", Part<number>>, false>, MultiFieldItem<Record<"splitFlowNTrial", Part<number>>, false>, MultiFieldItem<Record<"splitFlowTol", Part<number>>, false>, MultiFieldItem<Record<"splitFlowRatio", Part<number>>, false>, MultiFieldItem<Record<"logOutputLevel", Part<number>>, false>, MultiFieldItem<Record<"frictionSlopeMethod", Part<number>>, false>, MultiFieldItem<Record<"unsteadyFrictionSlopeMethod", Part<number>>, false>, MultiFieldItem<Record<"unsteadyBridgesFrictionSlopeMethod", Part<number>>, false>, ContextualItem<"calcCriticalAtEveryXS", boolean>, ContextualItem<"parabolicCriticalDepth", boolean>, TupleFieldItem<"globalVelDist", readonly [Part<number>, Part<number>, Part<number>], false>, MultiFieldItem<Record<"globalLogLevel", Part<number>>, false>, MultiFieldItem<Record<"checkData", Part<boolean>>, false>, TupleFieldItem<"encroachParam", readonly [Part<boolean>, Part<number>, Part<number>, Part<number>], false>, MultiFieldItem<Record<"encroachRiver", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"encroachReach", Part<string | undefined> & {
  isOptional: true;
}>, false>, ContextualItem<"encroachNodes", {
  node: string;
  values: [number, number, number];
}[]>, MultiFieldItem<Record<"unsteadyEncroachBasePlanFile", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unsteadyEncroachMaximumIterations", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unsteadyEncroachMaximumRise", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unsteadyEncroachMinimumBankOffset", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unsteadyEncroachRiver", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unsteadyEncroachReach", Part<string | undefined> & {
  isOptional: true;
}>, false>, RepeatItem<"unsteadyEncroachRS", readonly [MultiFieldItem<Record<"data", Part<string>>, false>]>, MultiFieldItem<Record<"flowRatioTarget", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"flowRatioTolerance", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"flowRatioInitialRatio", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"flowRatioMinRatio", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"flowRatioMaxRatio", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"flowRatioMaxIterations", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"flowRatioReference", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, TextBlockFieldItem<"description", true>, MultiFieldItem<Record<"computationInterval", Part<number>>, false>, MultiFieldItem<Record<"outputInterval", Part<number>>, false>, MultiFieldItem<Record<"instantaneousInterval", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"mappingInterval", Part<number | undefined> & {
  isOptional: true;
}>, false>, ContextualItem<"computationTimeStepUseCourant", number>, MultiFieldItem<Record<"computationTimeStepUseTimeSeries", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"computationTimeStepMaxCourant", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"computationTimeStepMinCourant", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"computationTimeStepCountToDouble", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"computationTimeStepMaxDoubling", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"computationTimeStepMaxHalving", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"computationTimeStepResidenceCourant", Part<number | undefined> & {
  isOptional: true;
}>, false>, RepeatItem<"computationTimeStepSchedule", readonly [MultiFieldItem<{
  datetime: Part<string>;
  value: Part<number>;
}, false>]>, MultiFieldItem<Record<"runHTab", Part<number>>, false>, MultiFieldItem<Record<"runUNet", Part<number>>, false>, MultiFieldItem<Record<"runSediment", Part<number>>, false>, MultiFieldItem<Record<"runPostProcess", Part<number>>, false>, MultiFieldItem<Record<"runWQNet", Part<number>>, false>, MultiFieldItem<Record<"runRASMapper", Part<number>>, false>, MultiFieldItem<Record<"unetTheta", Part<number>>, false>, MultiFieldItem<Record<"unetThetaWarmup", Part<number>>, false>, MultiFieldItem<Record<"unetZTol", Part<number>>, false>, MultiFieldItem<Record<"unetZSATol", Part<number>>, false>, MultiFieldItem<Record<"unetQTol", Part<number | null>>, false>, MultiFieldItem<Record<"unetMxIter", Part<number>>, false>, MultiFieldItem<Record<"unetMaxIterWOImprovement", Part<number>>, false>, MultiFieldItem<Record<"unetMaxInSteps", Part<number>>, false>, MultiFieldItem<Record<"unetDtIC", Part<number>>, false>, MultiFieldItem<Record<"unetDtMin", Part<number>>, false>, MultiFieldItem<Record<"unetMaxCRTS", Part<number>>, false>, MultiFieldItem<Record<"unetWFStab", Part<number>>, false>, MultiFieldItem<Record<"unetSFStab", Part<number>>, false>, MultiFieldItem<Record<"unetWFX", Part<number>>, false>, MultiFieldItem<Record<"unetSFX", Part<number>>, false>, MultiFieldItem<Record<"unetGravity", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unet1DMethodology", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetDSSMLevel", Part<number>>, false>, MultiFieldItem<Record<"unetPardiso", Part<number>>, false>, MultiFieldItem<Record<"unetDZMaxAbort", Part<number>>, false>, MultiFieldItem<Record<"unetUseExistingIBTables", Part<number>>, false>, MultiFieldItem<Record<"unetFroudeReduction", Part<boolean>>, false>, MultiFieldItem<Record<"unetFroudeLimit", Part<number>>, false>, MultiFieldItem<Record<"unetFroudePower", Part<number>>, false>, TupleFieldItem<"unetTimeSlicing", readonly [Part<number>, Part<number>, Part<number>], true>, MultiFieldItem<Record<"unetJunctionLosses", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetD1Cores", Part<number>>, false>, MultiFieldItem<Record<"unetWindReference", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetWindDragFormulation", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetD2Coriolis", Part<number>>, false>, MultiFieldItem<Record<"unetD2Cores", Part<number>>, false>, MultiFieldItem<Record<"unetD2Theta", Part<number>>, false>, MultiFieldItem<Record<"unetD2ThetaWarmup", Part<number>>, false>, MultiFieldItem<Record<"unetD2ZTol", Part<number>>, false>, MultiFieldItem<Record<"unetD2VolumeTol", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetD2MaxIterations", Part<number>>, false>, MultiFieldItem<Record<"unetD2AdvancedConvergence", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetD2WSMaxTol", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetD2WSRMSTol", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetD2WSStallTol", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetD2Equation", Part<number>>, false>, MultiFieldItem<Record<"unetD2TotalICTime", Part<number | null>>, false>, MultiFieldItem<Record<"unetD2RampUpFraction", Part<number>>, false>, MultiFieldItem<Record<"unetD2TimeSlices", Part<number>>, false>, MultiFieldItem<Record<"unetD2TurbulenceFormulation", Part<string>>, false>, MultiFieldItem<Record<"unetD2EddyViscosity", Part<number | null>>, false>, MultiFieldItem<Record<"unetD2TransverseEddyViscosity", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetD2SmagorinskyMixing", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetD2BCVolumeCheck", Part<number>>, false>, MultiFieldItem<Record<"unetD2Latitude", Part<number | null>>, false>, MultiFieldItem<Record<"unetD2Cores2", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetD2SolverType", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"unetD2MinimumIterations", Part<number>>, false>, MultiFieldItem<Record<"unetD2MaximumIterations", Part<number>>, false>, MultiFieldItem<Record<"unetD2RestartNumber", Part<number>>, false>, MultiFieldItem<Record<"unetD2RelaxationCoeff", Part<number>>, false>, MultiFieldItem<Record<"unetD2SORPreconditionIterations", Part<number>>, false>, MultiFieldItem<Record<"unetD2ILUTMaximumFill", Part<number>>, false>, MultiFieldItem<Record<"unetD2ILUTTolerance", Part<number>>, false>, MultiFieldItem<Record<"unetD2ConvergenceTolerance", Part<number | null>>, false>, RepeatItem<"unetD2FlowAreas", readonly [MultiFieldItem<Record<"name", Part<string>>, false>, MultiFieldItem<Record<"theta", Part<number>>, false>, MultiFieldItem<Record<"thetaWarmup", Part<number>>, false>, MultiFieldItem<Record<"zTol", Part<number>>, false>, MultiFieldItem<Record<"volumeTol", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"maxIterations", Part<number>>, false>, MultiFieldItem<Record<"advancedConvergence", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wsMaxTol", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wsRMSTol", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wsStallTol", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"equation", Part<number>>, false>, MultiFieldItem<Record<"totalICTime", Part<number | null>>, false>, MultiFieldItem<Record<"rampUpFraction", Part<number>>, false>, MultiFieldItem<Record<"timeSlices", Part<number>>, false>, MultiFieldItem<Record<"turbulenceFormulation", Part<string>>, false>, MultiFieldItem<Record<"eddyViscosity", Part<number | null>>, false>, MultiFieldItem<Record<"transverseEddyViscosity", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"smagorinskyMixing", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"bcVolumeCheck", Part<number>>, false>, MultiFieldItem<Record<"latitude", Part<number | null>>, false>, MultiFieldItem<Record<"cores", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"solverType", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"minimumIterations", Part<number>>, false>, MultiFieldItem<Record<"maximumIterations", Part<number>>, false>, MultiFieldItem<Record<"restartNumber", Part<number>>, false>, MultiFieldItem<Record<"relaxationCoeff", Part<number>>, false>, MultiFieldItem<Record<"sorPreconditionIterations", Part<number>>, false>, MultiFieldItem<Record<"ilutMaximumFill", Part<number>>, false>, MultiFieldItem<Record<"ilutTolerance", Part<number>>, false>, MultiFieldItem<Record<"convergenceTolerance", Part<number | null>>, false>]>, MultiFieldItem<Record<"psTheta", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"psWSTol", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"psVolumeTol", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"psMaxIterations", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"psEquation", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"psAdvanceTimeStep", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"psTargetCourant", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"psTimeSlices", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"psIterateWith2D", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"psProjectInitialWSEFromDS", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"psRampUpInitialWSEFromUS", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"psCores", Part<number | undefined> & {
  isOptional: true;
}>, false>, RepeatItem<"psAreas", readonly [MultiFieldItem<Record<"name", Part<string>>, false>, MultiFieldItem<Record<"theta", Part<number>>, false>, MultiFieldItem<Record<"wsTol", Part<number>>, false>, MultiFieldItem<Record<"volumeTol", Part<number>>, false>, MultiFieldItem<Record<"maxIterations", Part<number>>, false>, MultiFieldItem<Record<"equation", Part<number>>, false>, MultiFieldItem<Record<"advanceTimeStep", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"targetCourant", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"timeSlices", Part<number>>, false>, MultiFieldItem<Record<"iterateWith2D", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"projectInitialWSEFromDS", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"rampUpInitialWSEFromUS", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"cores", Part<number | undefined> & {
  isOptional: true;
}>, false>]>, MultiFieldItem<Record<"unetD1D2MaxIter", Part<number>>, false>, MultiFieldItem<Record<"unetD1D2ZTol", Part<number>>, false>, MultiFieldItem<Record<"unetD1D2QTol", Part<number>>, false>, MultiFieldItem<Record<"unetD1D2MinQTol", Part<number | null>>, false>, MultiFieldItem<Record<"dssFile", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"writeICFile", Part<number>>, false>, MultiFieldItem<Record<"writeICFileAtFixedDateTime", Part<number>>, false>, MultiFieldItem<{
  icTime1: Part<string>;
  icTime2: Part<string>;
  icTime3: Part<string>;
}, false>, MultiFieldItem<Record<"writeICFileReoccurance", Part<number | null>>, false>, MultiFieldItem<Record<"writeICFileAtSimEnd", Part<number>>, false>, MultiFieldItem<Record<"echoInput", Part<boolean>>, false>, MultiFieldItem<Record<"echoParameters", Part<boolean>>, false>, MultiFieldItem<Record<"echoOutput", Part<boolean>>, false>, MultiFieldItem<Record<"writeDetailed", Part<number>>, false>, MultiFieldItem<Record<"hdfWriteWarmup", Part<number>>, false>, MultiFieldItem<Record<"hdfWriteTimeSlices", Part<number>>, false>, MultiFieldItem<Record<"hdfFlush", Part<number>>, false>, RepeatItem<"hdfAdditionalOutputVariables", readonly [MultiFieldItem<Record<"variable", Part<string>>, false>]>, MultiFieldItem<Record<"hdfCellDepths", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hdfCellVelocity", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hdfCellNetInflow", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hdfEddyViscosity", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hdfFaceFlow", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hdfFaceWSEL", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hdfFaceTangentialVelocity", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hdfFaceShearStress", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hdfFaceNodeVelocities", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hdfCompression", Part<number>>, false>, MultiFieldItem<Record<"hdfChunkSize", Part<number>>, false>, MultiFieldItem<Record<"hdfSpatialParts", Part<number>>, false>, MultiFieldItem<Record<"hdfUseMaxRows", Part<number>>, false>, MultiFieldItem<Record<"hdfFixedRows", Part<number>>, false>, RepeatItem<"stageFlowHydrographs", readonly [MultiFieldItem<{
  reach: Part<string>;
  river: Part<string>;
  stage: Part<string>;
}, false>]>, RepeatItem<"breaches", readonly [MultiFieldItem<{
  breachLoc1: Part<string>;
  breachLoc2: Part<string>;
  breachLoc3: Part<string>;
  breachLoc4: Part<string>;
  breachLoc5: Part<string>;
}, false>, MultiFieldItem<Record<"breachMethod", Part<number>>, false>, MultiFieldItem<{
  breachGeom1: Part<number>;
  breachGeom10: Part<number>;
  breachGeom2: Part<number>;
  breachGeom3: Part<number>;
  breachGeom4: Part<number>;
  breachGeom5: Part<number>;
  breachGeom6: Part<string>;
  breachGeom7: Part<number>;
  breachGeom8: Part<number>;
  breachGeom9: Part<number>;
}, false>, MultiFieldItem<{
  breachStart1: Part<string>;
  breachStart2: Part<number | null>;
  breachStart3: Part<string>;
  breachStart4: Part<string>;
  breachStart5: Part<string>;
  breachStart6: Part<string>;
  breachStart7: Part<string>;
  breachStart8: Part<number | null>;
}, false>, TupleArrayFieldItem<"breachProgression", 2, true, false>, TupleArrayFieldItem<"simplifiedPhysicalBreachDowncutting", 2, true, false>, TupleArrayFieldItem<"simplifiedPhysicalBreachWidening", 2, true, false>, MultiFieldItem<Record<"startingNotchDepth", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"initialPipingDiameter", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"massWastingOptions", Part<number>>, false>, MultiFieldItem<Record<"massWastingWidth", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"massWastingDuration", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"massWastingFinalBottomElevation", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"breachUseUserDefinedGrowthRatio", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"breachUserDefinedGrowthRatio", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"breachCalculatorData", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<{
  dlBreachMethod1: Part<number>;
  dlBreachMethod2: Part<number>;
}, true>, MultiFieldItem<Record<"dlBreachSoilType", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"dlBreachSoilProperties", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"dlBreachCoreSoilType", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"dlBreachCoverOption", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"dlBreachCoverSoilProperties", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"dlBreachBreachDirection", Part<number | undefined> & {
  isOptional: true;
}>, false>]>, MultiFieldItem<Record<"calibrationMethod", Part<number>>, false>, MultiFieldItem<Record<"calibrationIterations", Part<number>>, false>, MultiFieldItem<Record<"calibrationMaxChange", Part<number>>, false>, MultiFieldItem<Record<"calibrationTolerance", Part<number>>, false>, MultiFieldItem<Record<"calibrationMaximum", Part<number>>, false>, MultiFieldItem<Record<"calibrationMinimum", Part<number>>, false>, MultiFieldItem<Record<"calibrationOptimizationMethod", Part<number>>, false>, MultiFieldItem<{
  calibrationWindow1: Part<string>;
  calibrationWindow2: Part<string>;
  calibrationWindow3: Part<string>;
  calibrationWindow4: Part<string>;
}, false>, MultiFieldItem<Record<"wqADNonConservative", Part<string>>, false>, MultiFieldItem<Record<"wqULTIMATE", Part<number>>, false>, MultiFieldItem<Record<"wqMaxCompStep", Part<string>>, false>, MultiFieldItem<Record<"wqOutputInterval", Part<number>>, false>, MultiFieldItem<Record<"wqOutputSelectedIncrements", Part<number>>, false>, MultiFieldItem<Record<"wqOutputFaceFlow", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputFaceVelocity", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputFaceArea", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputFaceDispersion", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputCellVolume", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputCellSurfaceArea", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputCellContinuity", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputCumulativeCellContinuity", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputFaceConc", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputFaceDconcDx", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputFaceCourant", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputFacePeclet", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputFaceAdvMass", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputFaceDispMass", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputCellMass", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputCellSourceSinkTemp", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputNsmPathways", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputNsmDerivedPathways", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqOutputMaxMinRange", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqDailyMaxMinMean", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqDailyRange", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqDailyTime", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqCreateRestart", Part<number>>, false>, MultiFieldItem<Record<"wqFixedRestart", Part<number>>, false>, MultiFieldItem<Record<"wqRestartSimtime", Part<number | null>>, false>, MultiFieldItem<Record<"wqRestartDate", Part<number | null>>, false>, MultiFieldItem<Record<"wqRestartHour", Part<number | null>>, false>, MultiFieldItem<Record<"wqSystemSummary", Part<number>>, false>, MultiFieldItem<Record<"wqWriteToDSS", Part<number>>, false>, MultiFieldItem<Record<"wqProfile", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqStartDate", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqStartTime", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqEndDate", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqEndTime", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqUseFixedTemperature", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"wqFixedTemperature", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"sortingAndArmoringIterations", Part<number>>, false>, MultiFieldItem<Record<"xsUpdateThreshold", Part<number>>, false>, MultiFieldItem<Record<"bedRoughnessPredictor", Part<number>>, false>, MultiFieldItem<Record<"processesAffectedByPredictor", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"hydraulicsUpdateThreshold", Part<number>>, false>, MultiFieldItem<Record<"energySlopeMethod", Part<number>>, false>, MultiFieldItem<Record<"volumeChangeMethod", Part<number>>, false>, MultiFieldItem<Record<"sedimentRetentionMethod", Part<number>>, false>, MultiFieldItem<Record<"sedimentTSMultiplier", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"warmUpMethod", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"warmUpDuration", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"warmUpDurationConcentration", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"warmUpDurationGradation", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"warmUpDurationBathymetry", Part<number | null | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"xsWeightingMethod", Part<number>>, false>, MultiFieldItem<Record<"numberOfUSWeightedCrossSections", Part<number>>, false>, MultiFieldItem<Record<"numberOfDSWeightedCrossSections", Part<number>>, false>, MultiFieldItem<Record<"upstreamXSWeight", Part<number>>, false>, MultiFieldItem<Record<"mainXSWeight", Part<number>>, false>, MultiFieldItem<Record<"downstreamXSWeight", Part<number>>, false>, MultiFieldItem<Record<"numberOfDSXSsWeightedWithUSBoundary", Part<number>>, false>, MultiFieldItem<Record<"upstreamBoundaryWeight", Part<number>>, false>, MultiFieldItem<Record<"weightOfXSsAssociatedWithUSBoundary", Part<number>>, false>, MultiFieldItem<Record<"numberOfUSXSsWeightedWithDSBoundary", Part<number>>, false>, MultiFieldItem<Record<"downstreamBoundaryWeight", Part<number>>, false>, MultiFieldItem<Record<"weightOfXSsAssociatedWithDSBoundary", Part<number>>, false>, MultiFieldItem<Record<"percentileMethod", Part<number>>, false>, MultiFieldItem<Record<"sedimentOutputLevel", Part<number>>, false>, RepeatItem<"sedimentOutputVariables", readonly [MultiFieldItem<Record<"variable", Part<string>>, false>]>, MultiFieldItem<Record<"massOrVolumeOutput", Part<number>>, false>, MultiFieldItem<Record<"outputIncrementType", Part<number>>, false>, MultiFieldItem<Record<"profileAndTSOutputIncrement", Part<number>>, false>, MultiFieldItem<Record<"transportOutputIncrement", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"xsOutputFlag", Part<number>>, false>, MultiFieldItem<Record<"xsOutputIncrement", Part<number>>, false>, MultiFieldItem<Record<"readHDF5SedimentHotstart", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"sedimentHotstartType", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"sedimentHotstartFile", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"sedimentHotstartDate", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"sedimentHotstartTime", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"writeGradationFile", Part<number>>, false>, MultiFieldItem<Record<"readGradationHotstart", Part<number>>, false>, MultiFieldItem<Record<"gradationFileName", Part<string>>, false>, MultiFieldItem<Record<"writeHDF5File", Part<number>>, false>, MultiFieldItem<Record<"writeBinaryOutput", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"writeDSSSedimentFile", Part<number>>, false>, MultiFieldItem<Record<"dssSedimentOutputType", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"dssLocation", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"summaryReach", Part<string | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"svCurve", Part<number>>, false>, MultiFieldItem<Record<"specificGageFlag", Part<number>>, false>, MultiFieldItem<Record<"subcellErosionMethods", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"subcellDepositionMethods", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"advectionScheme", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"matrixSolver", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"implicitWeightingFactor", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"maximumOuterLoopConvergenceIterations", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"convergenceMaximumAbsolute", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"convergenceRMSE", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"grainFractionsMaxAbsError", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"maxSubgridRegions", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"maxSubgridLengthScale", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"initialLayerThickness", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"minLayerThickness", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"maxLayerThickness", Part<number | undefined> & {
  isOptional: true;
}>, false>, MultiFieldItem<Record<"numberOfLayers", Part<number | undefined> & {
  isOptional: true;
}>, false>, RepeatItem<"dredgeEvents", readonly [MultiFieldItem<Record<"year", Part<string>>, false>, MultiFieldItem<Record<"dredgeEventMethod", Part<number>>, false>, MultiFieldItem<Record<"dredgeTrigger", Part<number>>, false>, MultiFieldItem<Record<"dredgeEventDate", Part<string>>, false>, MultiFieldItem<Record<"dredgeEventEndDate", Part<string>>, false>, MultiFieldItem<Record<"dredgeFateFlag", Part<number>>, false>, MultiFieldItem<Record<"dredgeFatePercentage", Part<number | null>>, false>, MultiFieldItem<Record<"dredgeFateThreshold", Part<number>>, false>, MultiFieldItem<Record<"dredgeFateLocation", Part<string>>, false>, ContextualItem<"dredgeReaches", {
  reach: string;
  river: string;
  stations: {
     rs: string;
     value1: string;
     value2: string;
     value3: string;
  }[];
}[]>]>, RepeatItem<"extraComputationCommands", readonly [MultiFieldItem<Record<"command", Part<string>>, false>]>, BlankLineItem];
```

## Functions

### parseGeometry()

```ts
function parseGeometry(content: string): Geometry;
```

Parses a HEC-RAS geometry file (.gXX) into a structured object.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `content` | `string` | The raw text content of the geometry file |

#### Returns

[`Geometry`](#geometry-1)

The parsed geometry data structure

#### Remarks

Geometry files contain the physical model definition including:
- Rivers and reaches with cross sections
- Storage areas with elevation-volume curves
- 2D flow areas
- Junctions connecting rivers
- Boundary conditions
- Land cover and Manning's roughness
- Hydraulic structures (bridges, weirs, culverts)

The parser normalizes line endings internally, so both Windows (`\r\n`)
and Unix (`\n`) line endings are accepted.

#### Examples

```typescript
import { parseGeometry } from 'hecras-parser'
import { readFileSync } from 'fs'

const content = readFileSync('model.g01', 'utf-8')
const geometry = parseGeometry(content)

// Access geometry title
console.log(geometry.title)

// Iterate over storage areas
for (const sa of geometry.storageAreas ?? []) {
  console.log(sa.name, sa.is2D)
}

// Access river reaches
for (const river of geometry.rivers ?? []) {
  console.log(river.name)
  for (const reach of river.reaches ?? []) {
    console.log(`  ${reach.name}: ${reach.stations?.length} stations`)
  }
}
```

```typescript
// Extract cross section data
import { parseGeometry } from 'hecras-parser'

const geometry = parseGeometry(content)

const river = geometry.rivers?.[0]
const reach = river?.reaches?.[0]
const crossSection = reach?.stations?.[0]

if (crossSection?.type === 1) { // Cross section type
  console.log('Station/Elevation pairs:', crossSection.stationElevation)
  console.log('Manning values:', crossSection.manning)
}
```

***

### parsePlan()

```ts
function parsePlan(content: string): Plan;
```

Parses a HEC-RAS plan file (.pXX) into a structured object.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `content` | `string` | The raw text content of the plan file |

#### Returns

[`Plan`](#plan)

The parsed plan data structure

#### Remarks

Plan files contain simulation settings such as:
- Simulation time windows (start/end dates and times)
- Computation time step configuration
- Solver settings (UNET, 2D settings)
- Flow tolerances and iteration limits
- Output options

The parser normalizes line endings internally, so both Windows (`\r\n`)
and Unix (`\n`) line endings are accepted.

#### Examples

```typescript
import { parsePlan } from 'hecras-parser'
import { readFileSync } from 'fs'

const content = readFileSync('simulation.p01', 'utf-8')
const plan = parsePlan(content)

// Access simulation time window
console.log(plan.simulationTimeWindow?.startDate) // e.g., "01JAN2020"
console.log(plan.simulationTimeWindow?.startTime) // e.g., "0000"

// Access solver settings
console.log(plan.unetSettings?.theta)
console.log(plan.unetSettings?.maxIter)
```

```typescript
// Round-trip: parse and serialize back
import { parsePlan, serializePlan } from 'hecras-parser'

const original = readFileSync('model.p01', 'utf-8')
const plan = parsePlan(original)
const serialized = serializePlan(plan)

// serialized will match original (with \r\n line endings)
```

***

### parseWithSchema()

```ts
function parseWithSchema<Def>(
   schema: Def, 
   lines: string[], 
   startIndex: number, 
options: ParseOptions): ParseResult<Simplify<UnionToIntersection<InferItemWithDepth<Def[number], 7>>>>;
```

#### Type Parameters

| Type Parameter |
| ------ |
| `Def` *extends* `SchemaDef` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | `Def` |
| `lines` | `string`[] |
| `startIndex` | `number` |
| `options` | `ParseOptions` |

#### Returns

`ParseResult`\<`Simplify`\<`UnionToIntersection`\<`InferItemWithDepth`\<`Def`\[`number`\], `7`\>\>\>\>

***

### serializeGeometry()

```ts
function serializeGeometry(geometry: Geometry, options?: SerializeOptions): string;
```

Serializes a geometry data structure back to HEC-RAS geometry file format.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `geometry` | [`Geometry`](#geometry-1) | The geometry data structure to serialize |
| `options?` | [`SerializeOptions`](#serializeoptions) | Serialization options (line endings, etc.) |

#### Returns

`string`

The serialized geometry file content as a string

#### Remarks

The serializer preserves exact formatting for round-trip fidelity:
- Coordinate numbers are formatted to 16-character fixed width
- Station/elevation values use 8-character fixed width
- Blank values are preserved where they appeared in the original
- Section ordering matches HEC-RAS expectations

#### Examples

```typescript
import { parseGeometry, serializeGeometry } from 'hecras-parser'

const geometry = parseGeometry(originalContent)

// Modify a storage area
const sa = geometry.storageAreas?.find(s => s.name === 'Reservoir')
if (sa) {
  sa.is2D = true
}

// Serialize back
const output = serializeGeometry(geometry)
writeFileSync('modified.g01', output)
```

```typescript
// Verify round-trip fidelity
import { parseGeometry, serializeGeometry } from 'hecras-parser'

const original = readFileSync('model.g01', 'utf-8')
const geometry = parseGeometry(original)
const serialized = serializeGeometry(geometry)

// For fully-supported sections, serialized matches original
// (with \r\n line endings)
```

***

### serializePlan()

```ts
function serializePlan(plan: Plan, options?: SerializeOptions): string;
```

Serializes a plan data structure back to HEC-RAS plan file format.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `plan` | [`Plan`](#plan) | The plan data structure to serialize |
| `options?` | [`SerializeOptions`](#serializeoptions) | Serialization options (line endings, etc.) |

#### Returns

`string`

The serialized plan file content as a string

#### Remarks

The serializer preserves the exact formatting expected by HEC-RAS, including:
- Field widths and padding
- Blank values where appropriate
- Section ordering

#### Example

```typescript
import { parsePlan, serializePlan } from 'hecras-parser'

const plan = parsePlan(originalContent)

// Modify settings
if (plan.unetSettings) {
  plan.unetSettings.maxIter = 40
}

// Serialize with Windows line endings (default)
const output = serializePlan(plan)
writeFileSync('modified.p01', output)

// Or with Unix line endings
const unixOutput = serializePlan(plan, { lineEndings: '\n' })
```

***

### serializeWithSchema()

```ts
function serializeWithSchema<Def>(schema: Def, data: Infer<Def>): string[];
```

#### Type Parameters

| Type Parameter |
| ------ |
| `Def` *extends* `SchemaDef` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | `Def` |
| `data` | [`Infer`](#infer)\<`Def`\> |

#### Returns

`string`[]
