# HEC-RAS Storage Area (SA) Connections Properties Documentation

## Overview

Storage Area (SA) connections in HEC-RAS define how storage areas interact with river reaches, 2D flow areas, and other hydraulic structures. This document outlines the properties and parameters that users can configure for SA connections.

## Connection Types

### 1. SA/2D Connections
SA/2D connections link storage areas to 2D flow areas and include the following structure types:

- **Weir**: Simple overflow structure
- **Weir and Culverts**: Combined overflow and pipe flow
- **Weir and Gates**: Controlled overflow structure
- **Linear Routing**: Simplified flow routing connection

### 2. River Reach Connections
Direct connections between storage areas and 1D river reaches at specific cross-sections.

### 3. Lateral Structure Connections
Connections through lateral structures (spillways, diversions, etc.) that can transfer flow between storage areas and river reaches.

## Culvert Properties in SA Connections

When using "Weir and Culverts" connection type, detailed culvert properties can be configured:

### Culvert Configuration Limits
- **Maximum Culvert Types**: Up to 10 different culvert types per connection
- **Maximum Barrels**: Up to 25 identical barrels per culvert type
- **Multiple Groups**: Different shapes, sizes, and elevations allowed

### Geometric Properties
| Property | Description | Units |
|----------|-------------|-------|
| Shape | 9 available culvert shapes (circular, box, etc.) | Selection |
| Span | Culvert width or diameter | ft or m |
| Rise | Culvert height | ft or m |
| Culvert Length | Total length of culvert barrel | ft or m |
| Upstream Invert Elevation | Inlet bottom elevation | ft or m |
| Downstream Invert Elevation | Outlet bottom elevation | ft or m |
| Barrel Centerline Station | Positioning along connection line | ft or m |

### Hydraulic Properties
| Property | Description | Typical Range |
|----------|-------------|---------------|
| Entrance Loss Coefficient | Energy loss at culvert inlet | 0.1 - 1.5 |
| Exit Loss Coefficient | Energy loss at culvert outlet | 0.3 - 1.0 |
| Manning's n (Top) | Roughness coefficient for top portion | 0.010 - 0.035 |
| Manning's n (Bottom) | Roughness coefficient for bottom portion | 0.010 - 0.035 |
| Solution Criteria | Inlet vs. outlet control analysis | Selection |

### Advanced Culvert Features
- **FHWA Chart Selection**: Standard hydraulic design charts
- **Scale Number**: Chart-specific scaling factor
- **Road Embankment**: Associated roadway information
- **Depth Blocked**: Partial blockage simulation
- **Barrel GIS Data**: Spatial data for 2D flow area connections

### Culvert Flow Control Types
1. **Inlet Control**: Flow limited by upstream conditions
2. **Outlet Control**: Flow limited by downstream conditions or barrel capacity
3. **Full Flow**: Pressure flow through entire barrel length

### Design Considerations for SA Culvert Connections
- **Hydraulic Grade Line**: Consider upstream and downstream water levels
- **Velocity Limits**: Ensure reasonable flow velocities through barrels
- **Tailwater Effects**: Account for downstream backwater conditions
- **Multiple Barrels**: Use for increased capacity and redundancy
- **Sediment Transport**: Consider sediment deposition in culvert barrels

## Connection Data Properties

### SA/2D Connection Table Properties
| Property | Description | Type |
|----------|-------------|------|
| SA/2D Connection ID | Unique identifier for the connection | Read-only |
| Structure Type | Type of hydraulic structure used | Selection |
| Connection Definition | Detailed connection parameters | Configurable |

### River Reach End Connection Properties
| Property | Description | Type |
|----------|-------------|------|
| River | Name of the connected river | Read-only |
| Reach | Name of the connected reach | Read-only |
| Cross Section River Station | Station of connection point | Numeric |

### Lateral Structure Connection Properties
| Property | Description | Type |
|----------|-------------|------|
| River | Name of the connected river | Read-only |
| Reach | Name of the connected reach | Read-only |
| Headwater River Station | Upstream station for lateral structure | Numeric |

## Storage Area Volume Definition Methods

Users can define storage area volume using three methods:

### 1. Fixed Area Method
- **Area**: Constant surface area (sq ft or sq m)
- **Bottom Elevation**: Lowest elevation of storage area (ft or m)

### 2. Elevation vs. Area Method
- **Elevation**: Water surface elevation (ft or m)
- **Area**: Corresponding surface area (sq ft or sq m)
- **Computed Volume**: Automatically calculated volume

### 3. Elevation vs. Volume Method
- **Elevation**: Water surface elevation (ft or m)
- **Volume**: Corresponding storage volume (cu ft or cu m)
- **Computed Area**: Automatically calculated surface area

## Connection Configuration Options

### Boundary Connection Definition
- **Connection Definition Columns**: Detail the SA/2D connection parameters
- **Pick Buttons**: Select SA/2D connections from Map View
- **Define Buttons**: Access detailed SA/2D connection configuration dialog

### Boundary Condition Properties
- **Boundary Connection Definition**: Columns detailing boundary condition lines
- **Type-Specific Details**: Properties vary based on selected boundary condition type

## Advanced Connection Applications

### Storage Area to 2D Flow Area Modeling
- **Upstream Storage Area**: Connected to 2D domain downstream
- **SA/2D Connection**: Hydraulic link between storage and 2D areas
- **Advantages**: Avoids complex 1D cross-section placement, easier setup

### 1D Reach to 2D Flow Area via Storage Area
- **Configuration**: 2D Flow Area → Storage Area → 1D Reach upstream node
- **Benefits**: Increased model stability, flexible connection options

## Technical Parameters

### Flow Calculation Dependencies
Flow calculations through SA connections depend on:
- Hydraulic structure type (weir, culvert, gate, etc.)
- Water surface elevations on both sides of connection
- Structure geometry and coefficients
- Flow direction and magnitude

### Geometric Definition
- **Unique Storage Area ID**: Alphanumeric identifier
- **Polygon Boundary**: Defines storage area extent
- **Volume Curve**: Elevation-area or elevation-volume relationship
- **Connection Points**: Specific locations where flow exchange occurs

## Best Practices

1. **Connection Selection**: Choose appropriate structure type based on physical conditions
2. **Volume Definition**: Use terrain-based methods for accuracy when available
3. **Connection Placement**: Position connections at hydraulically significant locations
4. **Model Stability**: Consider using storage areas for complex junction modeling
5. **Documentation**: Maintain clear naming conventions for connection IDs

## References

- HEC-RAS User's Manual (CPD-68)
- HEC-RAS Applications Guide
- HEC-RAS Hydraulic Reference Manual
- U.S. Army Corps of Engineers Hydrologic Engineering Center Documentation