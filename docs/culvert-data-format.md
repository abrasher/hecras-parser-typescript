# Culvert Data Format Documentation

This document describes the parsing logic for culvert data in HEC-RAS geometry files.

## Connection Culvert Data Format

### Connection Culv

**Original Key Name**: `Connection Culv=`
**Object Path**: `Connection.culvertData`
**Type**: Multi-parameter comma-separated values followed by coordinate data

#### Format Structure
```
Connection Culv=barrelCount,width,height,length,roughness,entranceLoss,shape,inlet,outlet,upstreamInvert,downstreamInvert,ratingFlag,description,unknownFlag,
    coordinate1    coordinate2    [additional coordinates...]
```

#### Parameter Mapping
| Position | Field Name | Type | Description | Example |
|----------|------------|------|-------------|---------|
| 0 | barrelCount | int | Number of culvert barrels | 1 |
| 1 | diameter/width | float | Culvert diameter or width (ft/m) | 1.5 |
| 2 | height | float | Culvert height (ft/m) | 1.5 |
| 3 | length | float | Culvert length (ft/m) | 13.24 |
| 4 | roughness | float | Manning's n roughness coefficient | 0.024 |
| 5 | entranceLoss | float | Entrance loss coefficient | 0.9 |
| 6 | shape | int | Shape code (1=circular, etc.) | 1 |
| 7 | inlet | int | Inlet type code | 2 |
| 8 | outlet | int | Outlet type code | 3 |
| 9 | upstreamInvert | float | Upstream invert elevation (ft/m) | 260.71 |
| 10 | downstreamInvert | float | Downstream invert elevation (ft/m) | 260.64 |
| 11 | ratingFlag | int | Rating curve flag | 1 |
| 12 | description | string | Culvert description | "Culvert #1" |
| 13 | unknownFlag | int | Unknown flag parameter | 0 |

#### Example Input
```
Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 1 ,Culvert #1  , 0 ,
    3.56    4.96
```

#### Example Output
```typescript
culvertData: {
  barrelCount: 1,
  diameter: 1.5,
  height: 1.5,
  length: 13.24,
  roughness: 0.024,
  entranceLoss: 0.9,
  exitLoss: 0,
  shape: 1,
  inlet: 2,
  upstreamInvert: 260.71,
  downstreamInvert: 260.64,
  ratingFlag: 1,
  description: "Culvert #1",
  unknownFlag: 0,
  coordinates: [3.56, 4.96]
}
```

### Culvert Barrel Data

**Original Key Name**: `Conn Culvert Barrel=`
**Object Path**: `Connection.culvertBarrels[]`
**Type**: Barrel definition followed by coordinate pairs

#### Format Structure
```
Conn Culvert Barrel=barrelId,description,pointCount
    x1    y1    x2    y2    [additional coordinate pairs...]
```

#### Parameter Mapping
| Position | Field Name | Type | Description | Example |
|----------|------------|------|-------------|---------|
| 0 | id | int | Barrel identifier | 1 |
| 1 | description | string | Barrel description | "Barrel #01" |
| 2 | pointCount | int | Number of coordinate points | 2 |

#### Example Input
```
Conn Culvert Barrel=1,Barrel #01,2
    484557.98934   4751436.44773     484544.9229   4751438.60715
```

#### Example Output
```typescript
culvertBarrels: [{
  id: 1,
  description: "Barrel #01",
  pointCount: 2,
  coordinates: [
    { x: 484557.98934, y: 4751436.44773 },
    { x: 484544.9229, y: 4751438.60715 }
  ]
}]
```

### Additional Culvert Properties

#### Culvert Bottom Manning's n

**Original Key Name**: `Conn Culv Bottom n=`
**Object Path**: `Connection.culvertBottomN`
**Type**: Float value
**Description**: Additional Manning's roughness coefficient for culvert bottom

#### Example Input
```
Conn Culv Bottom n=0.024
```

#### Example Output
```typescript
culvertBottomN: 0.024
```

#### Outlet Rating Curve

**Original Key Name**: `Conn Outlet Rating Curve=`
**Object Path**: `Connection.outletRatingCurve`
**Type**: Comma-separated values
**Description**: Outlet control rating curve parameters

#### Format Structure
```
Conn Outlet Rating Curve=flag,isActive,value1,value2
```

#### Example Input
```
Conn Outlet Rating Curve= 0 ,False,,
```

#### Example Output
```typescript
outletRatingCurve: {
  flag: 0,
  isActive: false,
  value1: "",
  value2: ""
}
```

## Shape Codes

Common culvert shape codes used in the `shape` field:

| Code | Shape Type |
|------|------------|
| 1 | Circular |
| 2 | Box |
| 3 | Elliptical |
| 4 | Arch |
| 5 | Pipe Arch |
| 6 | Low Profile Arch |
| 7 | Semi-Elliptical |
| 8 | Rectangular |
| 9 | Trapezoidal |

## Parsing Notes

### Field Length Considerations
- Description fields may contain trailing spaces that should be preserved
- Coordinate data may span multiple lines
- Some fields may be empty (represented as empty strings between commas)

### Special Handling
- Coordinate parsing stops when a line starting with a letter is encountered
- Manning's n values should be validated to be within typical range (0.010-0.100)
- Shape codes should be validated against known types
- Inlet/outlet codes may need lookup tables for full interpretation

### Error Handling
- Missing or invalid parameters default to zero or empty string
- Coordinate parsing is tolerant of formatting variations
- Unknown shape codes are preserved as-is for debugging