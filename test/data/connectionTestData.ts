// Test data for comprehensive connection parsing
import { Connection } from "../../src/models/connection"
import type { Coordinate, StationElevationPoint, CulvertData, CulvertBarrel, BridgeData } from "../../src/models/common"

export const connectionTestData = `
Connection=Culv_43         ,0,0
Connection Desc=Dimensions assumed by KGS 2024
Connection Line=2
    484553.74016    4751433.1891484551.728939999   4751441.22004
Connection Centerline Profile=0
Connection Last Edited Time=May-21-2025 14:53:52
Conn CellSize Min=2
Conn Near Repeats=1
Connection Up SA=2D_Grid         
Connection Dn SA=2D_Grid         
Conn Routing Type= 1 
Conn Use RC Family=False
Conn OverFlow Method 2D=True
Conn Weir WD=3.23
Conn Weir Coef=1.4
Conn Weir Is Ogee= 0 
Conn Simple Spill Pos Coef=0.05
Conn Simple Spill Neg Coef=0.05
Conn Weir SE= 2 
       0  262.45    8.28   262.5
Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 1 ,Culvert #1  , 0 ,
    3.56    4.96
Conn Culvert Barrel=1,Barrel #01,2
    484557.98934   4751436.44773     484544.9229   4751438.60715
Conn Culv Bottom n=0.024

Conn Outlet Rating Curve= 0 ,False,,
Conn BR: Bridge=-1,0,-1,-1, 0 ,0.3,0.5
Conn BR: Pressure-Weir=0.08,,0.25,,0.016
Conn BR: Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee
10,3.23,1.4,0, 2, 0, , , 0.98, 0, 0,0,,
       0    8.28
  262.45   262.5
                
Conn BR: BR SE=1,0
Conn BR: BR Bank Stations=1,,
Conn BR: BR Mann=1,0
Conn BR: BR SE=2,0
Conn BR: BR Bank Stations=2,,
Conn BR: BR Mann=2,0
Conn BR: BR Coef=-1 , 0 , 0 ,,,0.8,-1,1.2,0,
Conn BR: BR Skew=0
Conn BR: XS SE=1,0
Conn BR: XS Bank Stations=1,,
Conn BR: XS Mann=1,0
Conn BR: XS SE=2,0
Conn BR: XS Bank Stations=2,,
Conn BR: XS Mann=2,0

Connection=DM22-38608      ,0,0
Connection Desc=2nd bridge downstream of Dingman Dr
Connection Line=2
    483888.50815    4751220.0721     483877.6897    4751236.0422
Connection Centerline Profile=0
Connection Last Edited Time=May-15-2025 15:58:25
Conn CellSize Min=2
Conn Near Repeats=1
Connection Up SA=2D_Grid         
Connection Dn SA=2D_Grid         
Conn Routing Type= 32 
Conn Use RC Family=False
Conn OverFlow Method 2D=True
Conn Weir WD=3
Conn Weir Coef=1.4
Conn Weir Is Ogee= 0 
Conn Weir Design EG=0
Conn Weir Design HT=0
Conn Simple Spill Pos Coef=0.05
Conn Simple Spill Neg Coef=0.05
Conn Weir SE= 0 
Conn HTab HWMax=267

Conn Outlet Rating Curve= 0 ,False,,
Conn BR: Bridge=-1,0,-1,-1, 0 ,0.3,0.5
Conn BR: Pressure-Weir=0.08,,0.25,,0.016
Conn BR: Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee
2,3,1.4,0, 11, 11, , , 0.98, 0, 0,0,0,0
       2    2.61    3.24    3.24    6.66   13.09   16.35   16.87   16.87   17.33
   17.78
  260.83  261.67  261.67  261.67   261.7  261.73  261.75  261.77  261.77  261.77
  261.05
                          260.52  260.24  260.38  260.71  260.71                
        
       2    2.61    3.24    3.24    6.66   13.09   16.35   16.87   16.87   17.33
   17.78
  260.83  261.67  261.67  261.67   261.7  261.73  261.75  261.77  261.77  261.77
  261.05
                          260.52  260.24  260.38  260.71  260.71                
        
Conn BR: BR SE=1,40
       0 260.817    .407 260.859    .602 260.838   1.011 260.833   1.614 260.736
   2.043 260.584   2.403 260.492   2.822 260.327   3.426 259.969   3.566 259.645
   3.843  258.84    4.03 258.631   4.923 258.586   5.238 258.546   6.003 258.389
   6.363 258.269   6.723  258.12    7.05 258.022   8.258 257.839   8.915 257.766
   9.603 257.784  11.043 257.863  11.277 257.884  11.763 257.997  12.483 258.273
  12.844 258.446  13.204 258.717  13.373 258.818  13.564 258.899  13.693 258.922
  14.297 258.929  14.644 258.956  15.364 259.117  15.505 259.181  15.724 259.337
  17.316 260.503   17.92  260.79  18.524 260.894  18.722 260.901  19.289 260.858
Conn BR: BR Bank Stations=1,2.043,17.92
Conn BR: BR Mann=1,3
       0     .09   2.043    .035   17.92     .09
`

// Expected parsed data for the first connection (Culv_43)
export const expectedCulv43Connection = {
  // Basic info and metadata
  id: "Culv_43",
  description: "Dimensions assumed by KGS 2024",
  centerlineProfile: 0,
  lastEditedTime: "May-21-2025 14:53:52",
  cellSizeMin: 2,
  nearRepeats: 1,
  
  // Connection line coordinates
  line: [
    { x: 484553.74016, y: 4751433.1891 },
    { x: 484551.728939999, y: 4751441.22004 }
  ] as Coordinate[],
  
  // Storage area connections
  upSA: "2D_Grid",
  dnSA: "2D_Grid",
  
  // Routing settings
  routingType: 1,
  useRCFamily: false,
  overflowMethod2D: true,
  
  // Basic weir properties
  weirWidth: 3.23,
  weirCoefficient: 1.4,
  weirIsOgee: 0,
  simpleSpillPosCoef: 0.05,
  simpleSpillNegCoef: 0.05,
  
  // Weir station-elevation data
  weirStationElevation: [
    { station: 0, elevation: 262.45 },
    { station: 8.28, elevation: 262.5 }
  ] as StationElevationPoint[],
  
  // Culvert data
  culvertData: {
    barrelCount: 1,
    diameter: 1.5,
    height: 1.5,
    length: 13.24,
    roughness: 0.024,
    entranceLoss: 0.9,
    exitLoss: 1,
    shape: 2,
    inlet: 3,
    upstreamInvert: 260.71,
    downstreamInvert: 260.64,
    ratingFlag: 1,
    description: "Culvert #1",
    unknownFlag: 0,
    coordinates: [3.56, 4.96]
  } as CulvertData,
  
  // Culvert barrels
  culvertBarrels: [
    {
      id: 1,
      description: "Barrel #01",
      pointCount: 2,
      coordinates: [
        { x: 484557.98934, y: 4751436.44773 },
        { x: 484544.9229, y: 4751438.60715 }
      ]
    }
  ] as CulvertBarrel[],
  
  culvertBottomN: 0.024,
  
  // Outlet rating curve
  outletRatingCurve: {
    flag: 0,
    isActive: false,
    value1: "",
    value2: ""
  },
  
  // Bridge data
  bridgeData: {
    id: -1,
    flag1: 0,
    flag2: -1,
    flag3: -1,
    flag4: 0,
    weirCoeff: 0.3,
    skew: 0.5
  } as BridgeData,
  
  // Bridge pressure-weir settings
  bridgePressureWeir: {
    value1: 0.08,
    value2: "",
    value3: 0.25,
    value4: "",
    value5: 0.016
  },
  
  // Bridge deck properties
  bridgeDeck: {
    deckDist: 10,
    width: 3.23,
    weirC: 1.4,
    skew: 0,
    numUp: 2,
    numDn: 0,
    minLoCord: null,
    maxHiCord: null,
    maxSubmerge: 0.98,
    isOgee: 0,
    unknownValues: [0, 0, ""],
    stationElevation: [
      { station: 0, elevation: 262.45 },
      { station: 8.28, elevation: 262.5 }
    ]
  },
  
  bridgeSkew: 0
}

// Expected parsed data for the second connection (DM22-38608) - Bridge with advanced features
export const expectedDM2238608Connection = {
  // Basic info and metadata
  id: "DM22-38608",
  description: "2nd bridge downstream of Dingman Dr",
  centerlineProfile: 0,
  lastEditedTime: "May-15-2025 15:58:25",
  cellSizeMin: 2,
  nearRepeats: 1,
  
  // Connection line coordinates
  line: [
    { x: 483888.50815, y: 4751220.0721 },
    { x: 483877.6897, y: 4751236.0422 }
  ] as Coordinate[],
  
  // Storage area connections
  upSA: "2D_Grid",
  dnSA: "2D_Grid",
  
  // Routing settings (advanced routing type)
  routingType: 32,
  useRCFamily: false,
  overflowMethod2D: true,
  
  // Advanced weir properties
  weirWidth: 3,
  weirCoefficient: 1.4,
  weirIsOgee: 0,
  weirDesignEG: 0,
  weirDesignHT: 0,
  simpleSpillPosCoef: 0.05,
  simpleSpillNegCoef: 0.05,
  
  // HTab settings
  hTabHWMax: 267,
  
  // No weir station-elevation data (SE=0)
  weirStationElevation: [] as StationElevationPoint[],
  
  // Outlet rating curve
  outletRatingCurve: {
    flag: 0,
    isActive: false,
    value1: "",
    value2: ""
  },
  
  // Bridge data
  bridgeData: {
    id: -1,
    flag1: 0,
    flag2: -1,
    flag3: -1,
    flag4: 0,
    weirCoeff: 0.3,
    skew: 0.5
  } as BridgeData,
  
  // Bridge pressure-weir settings
  bridgePressureWeir: {
    value1: 0.08,
    value2: "",
    value3: 0.25,
    value4: "",
    value5: 0.016
  },
  
  // Complex bridge deck with multiple cross-sections
  bridgeDeck: {
    deckDist: 2,
    width: 3,
    weirC: 1.4,
    skew: 0,
    numUp: 11,
    numDn: 11,
    minLoCord: null,
    maxHiCord: null,
    maxSubmerge: 0.98,
    isOgee: 0,
    unknownValues: [0, 0, 0, 0],
    stationElevation: [
      { station: 2, elevation: 260.83 },
      { station: 2.61, elevation: 261.67 },
      { station: 3.24, elevation: 261.67 },
      { station: 3.24, elevation: 261.67 },
      { station: 6.66, elevation: 261.7 },
      { station: 13.09, elevation: 261.73 },
      { station: 16.35, elevation: 261.75 },
      { station: 16.87, elevation: 261.77 },
      { station: 16.87, elevation: 261.77 },
      { station: 17.33, elevation: 261.77 },
      { station: 17.78, elevation: 261.05 }
    ]
  },
  
  // Bridge cross-section data with detailed station-elevation points
  bridgeStations: {
    "BR SE 1": [
      { station: 0, elevation: 260.817 },
      { station: 0.407, elevation: 260.859 },
      { station: 0.602, elevation: 260.838 },
      { station: 1.011, elevation: 260.833 },
      { station: 1.614, elevation: 260.736 },
      { station: 2.043, elevation: 260.584 },
      { station: 2.403, elevation: 260.492 },
      { station: 2.822, elevation: 260.327 },
      { station: 3.426, elevation: 259.969 },
      { station: 3.566, elevation: 259.645 },
      { station: 3.843, elevation: 258.84 },
      { station: 4.03, elevation: 258.631 },
      { station: 4.923, elevation: 258.586 },
      { station: 5.238, elevation: 258.546 },
      { station: 6.003, elevation: 258.389 },
      { station: 6.363, elevation: 258.269 },
      { station: 6.723, elevation: 258.12 },
      { station: 7.05, elevation: 258.022 },
      { station: 8.258, elevation: 257.839 },
      { station: 8.915, elevation: 257.766 },
      { station: 9.603, elevation: 257.784 },
      { station: 11.043, elevation: 257.863 },
      { station: 11.277, elevation: 257.884 },
      { station: 11.763, elevation: 257.997 },
      { station: 12.483, elevation: 258.273 },
      { station: 12.844, elevation: 258.446 },
      { station: 13.204, elevation: 258.717 },
      { station: 13.373, elevation: 258.818 },
      { station: 13.564, elevation: 258.899 },
      { station: 13.693, elevation: 258.922 },
      { station: 14.297, elevation: 258.929 },
      { station: 14.644, elevation: 258.956 },
      { station: 15.364, elevation: 259.117 },
      { station: 15.505, elevation: 259.181 },
      { station: 15.724, elevation: 259.337 },
      { station: 17.316, elevation: 260.503 },
      { station: 17.92, elevation: 260.79 },
      { station: 18.524, elevation: 260.894 },
      { station: 18.722, elevation: 260.901 },
      { station: 19.289, elevation: 260.858 }
    ]
  },
  
  // Bridge bank stations
  bridgeBankStations: {
    "BR Bank Stations 1": {
      left: 2.043,
      right: 17.92
    }
  },
  
  // Bridge Manning's n values
  bridgeMannings: {
    "BR Mann 1": [
      { station: 0, nValue: 0.09 },
      { station: 2.043, nValue: 0.035 },
      { station: 17.92, nValue: 0.09 }
    ]
  },
  
  bridgeSkew: 0
}

// Categories for testing different attribute groups
export const connectionAttributeCategories = {
  basicInfo: [
    "id", "description", "centerlineProfile", "lastEditedTime", 
    "cellSizeMin", "nearRepeats"
  ],
  
  routingSettings: [
    "routingType", "useRCFamily", "overflowMethod2D"
  ],
  
  weirProperties: [
    "weirWidth", "weirCoefficient", "weirIsOgee", "simpleSpillPosCoef", 
    "simpleSpillNegCoef", "weirStationElevation"
  ],
  
  advancedWeirProperties: [
    "weirDesignEG", "weirDesignHT", "hTabHWMax"
  ],
  
  culvertData: [
    "culvertData", "culvertBarrels", "culvertBottomN"
  ],
  
  bridgeData: [
    "bridgeData", "bridgePressureWeir", "bridgeDeck", "bridgeStations",
    "bridgeBankStations", "bridgeMannings", "bridgeSkew"
  ],
  
  ratingCurve: [
    "outletRatingCurve"
  ]
}