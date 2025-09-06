# HEC-RAS Plan File Field Mappings (BaldEagleDamBrk.p13)

```
Plan Title=PMF with Multi 2D Areas
```

Plan Title -> parseKeyValue()

```
Program Version=5.10
```

Program Version -> parseKeyValue()

```
Short Identifier=PMF Multi 2D
```

Short Identifier -> parseKeyValue()

```
Simulation Date=01JAN1999,1200,04JAN1999,1200
```

Simulation Date -> parseValueAsCSV()

```
Geom File=g06
```

Geom File -> parseKeyValue()

```
Flow File=u07
```

Flow File -> parseKeyValue()

```
Subcritical Flow
```

Subcritical Flow -> LEAVE AS TODO

Effects flowRegime property
It's values can be either Subcritical Flow, Supercritical Flow or Mixed Flow

```
K Sum by GR= 0
```

K Sum by GR -> parseBooleanLine()

```
Std Step Tol= 0.01
```

Std Step Tol -> parseKeyValue(), parseMaybeFloat()

```
Critical Tol= 0.01
```

Critical Tol -> parseKeyValue(), parseMaybeFloat()

```
Num of Std Step Trials= 20
```

Num of Std Step Trials -> parseKeyValue(), parseMaybeInt()

```
Max Error Tol= 0.3
```

Max Error Tol -> parseKeyValue(), parseMaybeFloat()

```
Flow Tol Ratio= 0.001
```

Flow Tol Ratio -> parseKeyValue(), parseMaybeFloat()

```
Split Flow NTrial= 30
```

Split Flow NTrial -> parseKeyValue(), parseMaybeInt()

```
Split Flow Tol= 0.02
```

Split Flow Tol -> parseKeyValue(), parseMaybeFloat()

```
Split Flow Ratio= 0.02
```

Split Flow Ratio -> parseKeyValue(), parseMaybeFloat()

```
Log Output Level= 0
```

Log Output Level -> parseKeyValue(), parseMaybeInt()

```
Friction Slope Method= 1
```

Friction Slope Method -> parseKeyValue(), parseMaybeInt()

```
Unsteady Friction Slope Method= 2
```

Unsteady Friction Slope Method -> parseKeyValue(), parseMaybeInt()

```
Unsteady Bridges Friction Slope Method= 1
```

Unsteady Bridges Friction Slope Method -> parseKeyValue(), parseMaybeInt()

```
Parabolic Critical Depth
```

Parabolic Critical Depth -> This line indicates criticalDepthComputationMethod and is either Parabolic Critical Depth or Secant Critical Depth

```
Global Vel Dist= 0 , 0 , 0
```

Global Vel Dist -> parseValueAsCSV()

```
Global Log Level= 0
```

Global Log Level -> parseKeyValue(), parseMaybeInt()

```
CheckData=True
```

CheckData -> parseKeyValue()

```
Encroach Param=-1 ,0,0, 0
```

Encroach Param -> parseValueAsCSV()

```
BEGIN DESCRIPTION:
Predominatntly a 1D model with multiple 2D areas.  One 2D area represents the area behind a levee system.  The other 2D areas are used to model tributaries.
END DESCRIPTION:
```

BEGIN DESCRIPTION: -> Implement same logic as in parse Geometry headers

```
Computation Interval=30SEC
```

Computation Interval -> parseDurationLine()

```
Output Interval=30MIN
```

Output Interval -> parseDurationLine()

```
Instantaneous Interval=1HOUR
```

Instantaneous Interval -> parseDurationLine()

```
Mapping Interval=30MIN
```

Mapping Interval -> parseDurationLine()

```
Computation Time Step Use Courant=        0
```

Computation Time Step Use Courant -> parseKeyValue(), parseMaybeInt()

```
Computation Time Step Use Time Series=    0
```

Computation Time Step Use Time Series -> parseKeyValue(), parseMaybeInt()

```
Computation Time Step Max Courant=
```

Computation Time Step Max Courant -> parseKeyValue(), parseMaybeFloat()

```
Computation Time Step Min Courant=
```

Computation Time Step Min Courant -> parseKeyValue(), parseMaybeFloat()

```
Computation Time Step Count To Double=0
```

Computation Time Step Count To Double -> parseKeyValue(), parseMaybeInt()

```
Computation Time Step Max Doubling=0
```

Computation Time Step Max Doubling -> parseKeyValue(), parseMaybeInt()

```
Computation Time Step Max Halving=0
```

Computation Time Step Max Halving -> parseKeyValue(), parseMaybeInt()

```
Computation Time Step Residence Courant=0
```

Computation Time Step Residence Courant -> parseKeyValue(), parseMaybeInt()

```
Run HTab= 1
```

Run HTab -> parseKeyValue(), parseMaybeInt()

```
Run UNet= 1
```

Run UNet -> parseKeyValue(), parseMaybeInt()

```
Run Sediment= 0
```

Run Sediment -> parseKeyValue(), parseMaybeInt()

```
Run PostProcess= 1
```

Run PostProcess -> parseKeyValue(), parseMaybeInt()

```
Run WQNet= 0
```

Run WQNet -> parseKeyValue(), parseMaybeInt()

```
Run RASMapper= 0
```

Run RASMapper -> parseKeyValue(), parseMaybeInt()

```
UNET Theta= 1
```

UNET Theta -> parseKeyValue(), parseMaybeInt()

```
UNET Theta Warmup= 1
```

UNET Theta Warmup -> parseKeyValue(), parseMaybeInt()

```
UNET ZTol= 0.005
```

UNET ZTol -> parseKeyValue(), parseMaybeFloat()

```
UNET ZSATol= 0.005
```

UNET ZSATol -> parseKeyValue(), parseMaybeFloat()

```
UNET QTol=
```

UNET QTol -> parseKeyValue(), parseMaybeFloat()

```
UNET MxIter= 20
```

UNET MxIter -> parseKeyValue(), parseMaybeInt()

```
UNET Max Iter WO Improvement= 0
```

UNET Max Iter WO Improvement -> parseKeyValue(), parseMaybeInt()

```
UNET MaxInSteps= 0
```

UNET MaxInSteps -> parseKeyValue(), parseMaybeInt()

```
UNET DtIC= 0
```

UNET DtIC -> parseKeyValue(), parseMaybeInt()

```
UNET DtMin= 0
```

UNET DtMin -> parseKeyValue(), parseMaybeInt()

```
UNET MaxCRTS= 20
```

UNET MaxCRTS -> parseKeyValue(), parseMaybeInt()

```
UNET WFStab= 2
```

UNET WFStab -> parseKeyValue(), parseMaybeInt()

```
UNET SFStab= 1
```

UNET SFStab -> parseKeyValue(), parseMaybeInt()

```
UNET WFX= 3
```

UNET WFX -> parseKeyValue(), parseMaybeInt()

```
UNET SFX= 1
```

UNET SFX -> parseKeyValue(), parseMaybeInt()

```
UNET 1D Methodology=Finite Difference
```

UNET 1D Methodology -> parseKeyValue()

```
UNET DSS MLevel= 4
```

UNET DSS MLevel -> parseKeyValue(), parseMaybeInt()

```
UNET Pardiso=0
```

UNET Pardiso -> parseKeyValue(), parseMaybeInt()

```
UNET DZMax Abort= 100
```

UNET DZMax Abort -> parseKeyValue(), parseMaybeInt()

```
UNET Use Existing IB Tables=-1
```

UNET Use Existing IB Tables -> parseKeyValue(), parseMaybeInt()

```
UNET Froude Reduction=False
```

UNET Froude Reduction -> parseKeyValue()

```
UNET Froude Limit= 1
```

UNET Froude Limit -> parseKeyValue(), parseMaybeInt()

```
UNET Froude Power= 10
```

UNET Froude Power -> parseKeyValue(), parseMaybeInt()

```
UNET D1 Cores= 0
```

UNET D1 Cores -> parseKeyValue(), parseMaybeInt()

```
UNET WindReference=Eulerian
```

UNET WindReference -> parseKeyValue()

```
UNET WindDragFormulation=Hsu (1988)
```

UNET WindDragFormulation -> parseKeyValue()

```
UNET D2 Coriolis=-1
```

UNET D2 Coriolis -> parseKeyValue(), parseMaybeInt()

```
UNET D2 Cores= 8
```

UNET D2 Cores -> parseKeyValue(), parseMaybeInt()

```
UNET D2 Theta= 1
```

UNET D2 Theta -> parseKeyValue(), parseMaybeInt()

```
UNET D2 Theta Warmup= 1
```

UNET D2 Theta Warmup -> parseKeyValue(), parseMaybeInt()

```
UNET D2 Z Tol= 0.01
```

UNET D2 Z Tol -> parseKeyValue(), parseMaybeFloat()

```
UNET D2 Volume Tol= 0.01
```

UNET D2 Volume Tol -> parseKeyValue(), parseMaybeFloat()

```
UNET D2 Max Iterations= 20
```

UNET D2 Max Iterations -> parseKeyValue(), parseMaybeInt()

```
UNET D2 Equation= 0
```

UNET D2 Equation -> parseKeyValue(), parseMaybeInt()

```
UNET D2 TotalICTime=
```

UNET D2 TotalICTime -> NEEDS REVIEW (unknown units/format)

```
UNET D2 RampUpFraction=0.5
```

UNET D2 RampUpFraction -> parseKeyValue(), parseMaybeFloat()

```
UNET D2 TimeSlices= 1
```

UNET D2 TimeSlices -> parseKeyValue(), parseMaybeInt()

```
UNET D2 Eddy Viscosity=
```

UNET D2 Eddy Viscosity -> parseKeyValue(), parseMaybeFloat()

```
UNET D2 Transverse Eddy Viscosity=
```

UNET D2 Transverse Eddy Viscosity -> parseKeyValue(), parseMaybeFloat()

```
UNET D2 Smagorinsky Mixing=
```

UNET D2 Smagorinsky Mixing -> NEEDS REVIEW (missing units/type)

```
UNET D2 BCVolumeCheck=0
```

UNET D2 BCVolumeCheck -> parseKeyValue(), parseMaybeInt()

```
UNET D2 Latitude=
```

UNET D2 Latitude -> parseKeyValue(), parseMaybeFloat()

```
UNET D2 SolverType=Pardiso (Direct)
```

UNET D2 SolverType -> parseKeyValue()

```
UNET D2 Name=193
```

UNET D2 Name -> parseKeyValue(), parseMaybeInt()

```
UNET D1D2 MaxIter= 0
```

UNET D1D2 MaxIter -> parseKeyValue(), parseMaybeInt()

```
UNET D1D2 ZTol=0.02
```

UNET D1D2 ZTol -> parseKeyValue(), parseMaybeFloat()

```
UNET D1D2 QTol=1
```

UNET D1D2 QTol -> parseKeyValue(), parseMaybeInt()

```
UNET D1D2 MinQTol=
```

UNET D1D2 MinQTol -> parseKeyValue(), parseMaybeFloat()

```
DSS File=dss
```

DSS File -> parseKeyValue()

```
Write IC File= 0
```

Write IC File -> parseKeyValue(), parseMaybeInt()

```
Write IC File at Fixed DateTime=0
```

Write IC File at Fixed DateTime -> parseKeyValue(), parseMaybeInt()

```
IC Time=,,
```

IC Time -> parseValueAsCSV()

```
Write IC File Reoccurance=
```

Write IC File Reoccurance -> NEEDS REVIEW (unspecified format)

```
Write IC File at Sim End=0
```

Write IC File at Sim End -> parseKeyValue(), parseMaybeInt()

```
Echo Input=False
```

Echo Input -> parseKeyValue()

```
Echo Parameters=False
```

Echo Parameters -> parseKeyValue()

```
Echo Output=False
```

Echo Output -> parseKeyValue()

```
Write Detailed= 0
```

Write Detailed -> parseKeyValue(), parseMaybeInt()

```
HDF Write Warmup=0
```

HDF Write Warmup -> parseKeyValue(), parseMaybeInt()

```
HDF Write Time Slices=0
```

HDF Write Time Slices -> parseKeyValue(), parseMaybeInt()

```
HDF Flush=0
```

HDF Flush -> parseKeyValue(), parseMaybeInt()

```
HDF Cell Depths=0
```

HDF Cell Depths -> parseKeyValue(), parseMaybeInt()

```
HDF Cell Velocity=0
```

HDF Cell Velocity -> parseKeyValue(), parseMaybeInt()

```
HDF Cell Net Inflow=0
```

HDF Cell Net Inflow -> parseKeyValue(), parseMaybeInt()

```
HDF Eddy Viscosity=0
```

HDF Eddy Viscosity -> parseKeyValue(), parseMaybeInt()

```
HDF Face Flow=0
```

HDF Face Flow -> parseKeyValue(), parseMaybeInt()

```
HDF Face WSEL=0
```

HDF Face WSEL -> parseKeyValue(), parseMaybeInt()

```
HDF Face Tangential Velocity=0
```

HDF Face Tangential Velocity -> parseKeyValue(), parseMaybeInt()

```
HDF Face Shear Stress=0
```

HDF Face Shear Stress -> parseKeyValue(), parseMaybeInt()

```
HDF Face Node Velocities=0
```

HDF Face Node Velocities -> parseKeyValue(), parseMaybeInt()

```
HDF Compression= 1
```

HDF Compression -> parseKeyValue(), parseMaybeInt()

```
HDF Chunk Size= 1
```

HDF Chunk Size -> parseKeyValue(), parseMaybeInt()

```
HDF Spatial Parts= 1
```

HDF Spatial Parts -> parseKeyValue(), parseMaybeInt()

```
HDF Use Max Rows=0
```

HDF Use Max Rows -> parseKeyValue(), parseMaybeInt()

```
HDF Fixed Rows= 1
```

HDF Fixed Rows -> parseKeyValue(), parseMaybeInt()

```
Stage Flow Hydrograph=Bald Eagle Cr.  ,Lock Haven      ,137520
```

Stage Flow Hydrograph -> parseValueAsCSV()

```
Breach Loc=Bald Eagle Cr.  ,Lock Haven      ,21200   ,True,
```

Breach Loc -> parseValueAsCSV()

```
Breach Method= 0
```

Breach Method -> parseKeyValue(), parseMaybeInt()

```
Breach Geom=2700,300,560,0.1,0.1,False,0.5,,2,2.6
```

Breach Geom -> parseValueAsCSV()

```
Breach Start=True,573.1,,,False,,,0
```

Breach Start -> parseValueAsCSV()

```
Breach Progression= 2
       0       0       1       1
```

Breach Progression -> parseKeyValue(), parseMaybeInt(), parseMultilineArray(width=8,numOfEntries=2\*count), arrayToNumberPairs(chunkSize=2)

```
       0       0       1       1
```

0 0 1 1 -> parseKeyValue(), parseMaybeFloat()

```
Simplified Physical Breach Downcutting= 9
       0       0       1      10       2      20       3      30       4      40
       5      50       6      60      10     100      20     500
```

Simplified Physical Breach Downcutting -> parseKeyValue(), parseMaybeInt(), parseMultilineArray(width=8,numOfEntries=2\*count), arrayToNumberPairs(chunkSize=2)

```
       0       0       1      10       2      20       3      30       4      40
```

0 0 1 10 2 20 3 30 4 40 -> parseKeyValue(), parseMaybeFloat()

```
       5      50       6      60      10     100      20     500
```

5 50 6 60 10 100 20 500 -> parseKeyValue(), parseMaybeFloat()

```
Simplified Physical Breach Widening= 9
       0       0       1      10       2      20       3      30       4      40
       5      50       6      60      10     100      20     500
```

Simplified Physical Breach Widening -> parseKeyValue(), parseMaybeInt(), parseMultilineArray(width=8,numOfEntries=2\*count), arrayToNumberPairs(chunkSize=2)

```
Starting Notch Depth= 2
```

Starting Notch Depth -> parseKeyValue(), parseMaybeInt()

```
Mass Wasting Options= 0
```

Mass Wasting Options -> parseKeyValue(), parseMaybeInt()

```
Breach Use User Defined Growth Ratio=-1
```

Breach Use User Defined Growth Ratio -> parseKeyValue(), parseMaybeInt()

```
Breach User Defined Growth Ratio=1
```

Breach User Defined Growth Ratio -> parseKeyValue(), parseMaybeInt()

```
DLBreach Methods=0,0
```

DLBreach Methods -> parseValueAsCSV()

```
DLBreach SoilType=0
```

DLBreach SoilType -> parseKeyValue(), parseMaybeInt()

```
DLBreach Core SoilType=0
```

DLBreach Core SoilType -> parseKeyValue(), parseMaybeInt()

```
DLBreach Cover Option=0
```

DLBreach Cover Option -> parseKeyValue(), parseMaybeInt()

```
DLBreach Breach Direction=0
```

DLBreach Breach Direction -> parseKeyValue(), parseMaybeInt()

```
       0       0     .05    .006      .1    .024     .15    .054      .2    .095
```

0 0 .05 .006 .1 .024 .15 .054 .2 .095 -> parseKeyValue(), parseMaybeFloat()

```
     .25    .146      .3    .206     .35    .273      .4    .345     .45    .422
```

.25 .146 .3 .206 .35 .273 .4 .345 .45 .422 -> parseKeyValue(), parseMaybeFloat()

```
      .5      .5     .55    .578      .6    .655     .65    .727      .7    .794
```

.5 .5 .55 .578 .6 .655 .65 .727 .7 .794 -> parseKeyValue(), parseMaybeFloat()

```
     .75    .854      .8    .905     .85    .946      .9    .976     .95    .994
```

.75 .854 .8 .905 .85 .946 .9 .976 .95 .994 -> parseKeyValue(), parseMaybeFloat()

```
       1       1
```

1 1 -> parseKeyValue(), parseMaybeFloat()

```
Breach Calculator Data=683,25,3.5,3.5,585,676.8,180000, 1, 1, 0, 1
```

Breach Calculator Data -> parseValueAsCSV()

```
Calibration Method= 0
```

Calibration Method -> parseKeyValue(), parseMaybeInt()

```
Calibration Iterations= 20
```

Calibration Iterations -> parseKeyValue(), parseMaybeInt()

```
Calibration Max Change=0.05
```

Calibration Max Change -> parseKeyValue(), parseMaybeFloat()

```
Calibration Tolerance=0.2
```

Calibration Tolerance -> parseKeyValue(), parseMaybeFloat()

```
Calibration Maximum=1.5
```

Calibration Maximum -> parseKeyValue(), parseMaybeFloat()

```
Calibration Minimum=0.5
```

Calibration Minimum -> parseKeyValue(), parseMaybeFloat()

```
Calibration Optimization Method= 1
```

Calibration Optimization Method -> parseKeyValue(), parseMaybeInt()

```
Calibration Window=,,,
```

Calibration Window -> parseValueAsCSV()

```
WQ AD Non Conservative
```

WQ AD Non Conservative -> NEEDS REVIEW (flag without "=")

```
WQ ULTIMATE=-1
```

WQ ULTIMATE -> parseKeyValue(), parseMaybeInt()

```
WQ Max Comp Step=1HOUR
```

WQ Max Comp Step -> parseDurationLine()

```
WQ Output Interval=15MIN
```

WQ Output Interval -> parseDurationLine()

```
WQ Output Selected Increments= 0
```

WQ Output Selected Increments -> parseKeyValue(), parseMaybeInt()

```
WQ Output face flow=0
```

WQ Output face flow -> parseKeyValue(), parseMaybeInt()

```
WQ Output face velocity=0
```

WQ Output face velocity -> parseKeyValue(), parseMaybeInt()

```
WQ Output face area=0
```

WQ Output face area -> parseKeyValue(), parseMaybeInt()

```
WQ Output face dispersion=0
```

WQ Output face dispersion -> parseKeyValue(), parseMaybeInt()

```
WQ Output cell volume=0
```

WQ Output cell volume -> parseKeyValue(), parseMaybeInt()

```
WQ Output cell surface area=0
```

WQ Output cell surface area -> parseKeyValue(), parseMaybeInt()

```
WQ Output cell continuity=0
```

WQ Output cell continuity -> parseKeyValue(), parseMaybeInt()

```
WQ Output cumulative cell continuity=0
```

WQ Output cumulative cell continuity -> parseKeyValue(), parseMaybeInt()

```
WQ Output face conc=0
```

WQ Output face conc -> parseKeyValue(), parseMaybeInt()

```
WQ Output face dconc_dx=0
```

WQ Output face dconc_dx -> parseKeyValue(), parseMaybeInt()

```
WQ Output face courant=0
```

WQ Output face courant -> parseKeyValue(), parseMaybeInt()

```
WQ Output face peclet=0
```

WQ Output face peclet -> parseKeyValue(), parseMaybeInt()

```
WQ Output face adv mass=0
```

WQ Output face adv mass -> parseKeyValue(), parseMaybeInt()

```
WQ Output face disp mass=0
```

WQ Output face disp mass -> parseKeyValue(), parseMaybeInt()

```
WQ Output cell mass=0
```

WQ Output cell mass -> parseKeyValue(), parseMaybeInt()

```
WQ Output cell source sink temp=0
```

WQ Output cell source sink temp -> parseKeyValue(), parseMaybeInt()

```
WQ Output nsm pathways=0
```

WQ Output nsm pathways -> parseKeyValue(), parseMaybeInt()

```
WQ Output nsm derived pathways=0
```

WQ Output nsm derived pathways -> parseKeyValue(), parseMaybeInt()

```
WQ Create Restart=0
```

WQ Create Restart -> parseKeyValue(), parseMaybeInt()

```
WQ Fixed Restart=0
```

WQ Fixed Restart -> parseKeyValue(), parseMaybeInt()

```
WQ Restart Simtime=
```

WQ Restart Simtime -> NEEDS REVIEW (unspecified format)

```
WQ Restart Date=
```

WQ Restart Date -> NEEDS REVIEW (unspecified format)

```
WQ Restart Hour=
```

WQ Restart Hour -> NEEDS REVIEW (unspecified format)

```
WQ System Summary=0
```

WQ System Summary -> parseKeyValue(), parseMaybeInt()

```
WQ Write To DSS=0
```

WQ Write To DSS -> parseKeyValue(), parseMaybeInt()

```
Sorting and Armoring Iterations= 10
```

Sorting and Armoring Iterations -> parseKeyValue(), parseMaybeInt()

```
XS Update Threshold= 0.02
```

XS Update Threshold -> parseKeyValue(), parseMaybeFloat()

```
Bed Roughness Predictor= 0
```

Bed Roughness Predictor -> parseKeyValue(), parseMaybeInt()

```
Hydraulics Update Threshold= 0.02
```

Hydraulics Update Threshold -> parseKeyValue(), parseMaybeFloat()

```
Energy Slope Method= 0
```

Energy Slope Method -> parseKeyValue(), parseMaybeInt()

```
Volume Change Method= 0
```

Volume Change Method -> parseKeyValue(), parseMaybeInt()

```
Sediment Retention Method= 0
```

Sediment Retention Method -> parseKeyValue(), parseMaybeInt()

```
Sediment TS Multiplier= 1
```

Sediment TS Multiplier -> parseKeyValue(), parseMaybeInt()

```
Warm Up Method= 0
```

Warm Up Method -> parseKeyValue(), parseMaybeInt()

```
Warm Up Duration=
```

Warm Up Duration -> parseDurationLine()

```
XS Weighting Method= 0
```

XS Weighting Method -> parseKeyValue(), parseMaybeInt()

```
Number of US Weighted Cross Sections= 1
```

Number of US Weighted Cross Sections -> parseKeyValue(), parseMaybeInt()

```
Number of DS Weighted Cross Sections= 1
```

Number of DS Weighted Cross Sections -> parseKeyValue(), parseMaybeInt()

```
Upstream XS Weight=0.25
```

Upstream XS Weight -> parseKeyValue(), parseMaybeFloat()

```
Main XS Weight=0.5
```

Main XS Weight -> parseKeyValue(), parseMaybeFloat()

```
Downstream XS Weight=0.25
```

Downstream XS Weight -> parseKeyValue(), parseMaybeFloat()

```
Number of DS XS's Weighted with US Boundary= 1
```

Number of DS XS's Weighted with US Boundary -> parseKeyValue(), parseMaybeInt()

```
Upstream Boundary Weight= 1
```

Upstream Boundary Weight -> parseKeyValue(), parseMaybeInt()

```
Weight of XSs Associated with US Boundary= 0
```

Weight of XSs Associated with US Boundary -> parseKeyValue(), parseMaybeInt()

```
Number of US XS's Weighted with DS Boundary= 1
```

Number of US XS's Weighted with DS Boundary -> parseKeyValue(), parseMaybeInt()

```
Downstream Boundary Weight= 0.5
```

Downstream Boundary Weight -> parseKeyValue(), parseMaybeFloat()

```
Weight of XSs Associated with DS Boundary= 0.5
```

Weight of XSs Associated with DS Boundary -> parseKeyValue(), parseMaybeFloat()

```
Percentile Method= 0
```

Percentile Method -> parseKeyValue(), parseMaybeInt()

```
Sediment Output Level= 4
```

Sediment Output Level -> parseKeyValue(), parseMaybeInt()

```
Mass or Volume Output= 0
```

Mass or Volume Output -> parseKeyValue(), parseMaybeInt()

```
Output Increment Type= 1
```

Output Increment Type -> parseKeyValue(), parseMaybeInt()

```
Profile and TS Output Increment= 10
```

Profile and TS Output Increment -> parseKeyValue(), parseMaybeInt()

```
Transport Output Increment 1
```

Transport Output Increment 1 -> NEEDS REVIEW (missing "=")

```
XS Output Flag= 0
```

XS Output Flag -> parseKeyValue(), parseMaybeInt()

```
XS Output Increment= 10
```

XS Output Increment -> parseKeyValue(), parseMaybeInt()

```
Read HDF5 Sediment Hotstart= 0
```

Read HDF5 Sediment Hotstart -> parseKeyValue(), parseMaybeInt()

```
Sediment Hotstart Type= 0
```

Sediment Hotstart Type -> parseKeyValue(), parseMaybeInt()

```
Sediment Hotstart File=
```

Sediment Hotstart File -> parseKeyValue(), parseMaybeFloat()

```
Sediment Hotstart Date=
```

Sediment Hotstart Date -> parseKeyValue(), parseMaybeFloat()

```
Sediment Hotstart Time=
```

Sediment Hotstart Time -> parseKeyValue(), parseMaybeFloat()

```
Write Gradation File= 0
```

Write Gradation File -> parseKeyValue(), parseMaybeInt()

```
Read Gradation Hotstart= 0
```

Read Gradation Hotstart -> parseKeyValue(), parseMaybeInt()

```
Gradation File Name=
```

Gradation File Name -> parseKeyValue(), parseMaybeFloat()

```
Write HDF5 File= 0
```

Write HDF5 File -> parseKeyValue(), parseMaybeInt()

```
Write Binary Output= 1
```

Write Binary Output -> parseKeyValue(), parseMaybeInt()

```
Write DSS Sediment File= 0
```

Write DSS Sediment File -> parseKeyValue(), parseMaybeInt()

```
DSS Sediment Output Type= 1
```

DSS Sediment Output Type -> parseKeyValue(), parseMaybeInt()

```
SV Curve= 0
```

SV Curve -> parseKeyValue(), parseMaybeInt()

```
Specific Gage Flag= 0
```

Specific Gage Flag -> parseKeyValue(), parseMaybeInt()

```
Subcell Erosion Methods= 0
```

Subcell Erosion Methods -> parseKeyValue(), parseMaybeInt()

```
Subcell Deposition Methods= 0
```

Subcell Deposition Methods -> parseKeyValue(), parseMaybeInt()

```
Advection Scheme= 0
```

Advection Scheme -> parseKeyValue(), parseMaybeInt()

```
Matrix Solver= 0
```

Matrix Solver -> parseKeyValue(), parseMaybeInt()

```
Implicit Weighting Factor= 1
```

Implicit Weighting Factor -> parseKeyValue(), parseMaybeInt()

```
Convergence Maximum Absolute= 0.000001
```

Convergence Maximum Absolute -> parseKeyValue(), parseMaybeFloat()

```
Convergence RMSE= 0.000001
```

Convergence RMSE -> parseKeyValue(), parseMaybeFloat()

```
Max Subgrid Regions= 1
```

Max Subgrid Regions -> parseKeyValue(), parseMaybeInt()

```
Max Subgrid Length Scale= 3.402823E+38
```

Max Subgrid Length Scale -> parseKeyValue(), parseMaybeFloat()

```
Initial Layer Thickness= 3.402823E+38
```

Initial Layer Thickness -> parseKeyValue(), parseMaybeFloat()

```
Min Layer Thickness= 3.402823E+38
```

Min Layer Thickness -> parseKeyValue(), parseMaybeFloat()

```
Max Layer Thickness= 3.402823E+38
```

Max Layer Thickness -> parseKeyValue(), parseMaybeFloat()

```
Number of Layers= 5
```

Number of Layers -> parseKeyValue(), parseMaybeInt()
