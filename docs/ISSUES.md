# Known Parser Issues

This document tracks all known issues discovered during geometry file parsing tests. Issues are grouped by category and priority.

## Critical Issues (Blocking Parsing)

### 1. Boolean Encoding Inconsistency
**Status:** 🔴 Critical
**Affected Files:** Multiple (17 occurrences)
**Schema Impact:** Cross sections, bridges, culverts, lateral weirs

**Description:**
The parser expects booleans in `-1,0` format, but several HEC-RAS files use `1` to represent `true` instead of `-1`. This appears in:
- `BR Coef=` lines (bridge coefficients)
- `Bridge Culvert-` lines
- `#Mann=` lines (Manning's n)

**Example:**
```
BR Coef= 1 , 1 , 1 ,1.05, 0 ,,,0.8,0,1.33,0,
#Mann= 6 , 1 , 0
Bridge Culvert-0,0,1,-1, 0
```

**Affected Files:**
- 1D Unsteady Flow Hydraulics_JunctionHydraulics_JunctionHydraulics.g01
- 1D Unsteady Flow Hydraulics_JunctionHydraulics_JunctionHydraulics.g02
- 1D Unsteady Flow Hydraulics_Lateral Structure connected to a River Reach_3Reach_with_Lat.g01
- 1D Unsteady Flow Hydraulics_Lateral Structure with Culverts and Gates_Beav_Lateral.g01
- 1D Unsteady Flow Hydraulics_Levee Breaching_LeveeBreach.g01
- 1D Unsteady Flow Hydraulics_Multiple Reaches with Hydraulic Structures_3ReachUnsteady.g01
- 1D Unsteady Flow Hydraulics_Pumping Station_Pumps.g01
- 1D Unsteady Flow Hydraulics_Storage Area Hydraulic Connection_Beaver_LS_SAConn.g01
- 1D Steady Flow Hydraulics_ConSpan Culvert_ConSpan.g01
- Applications Guide_Example 18 - Advanced Inline Structure_InlineStructureE.g01
- Applications Guide_Example 2 - Beaver Creek_BEAVCREK.g04
- Applications Guide_Example 3 - Single Culvert_TWINPIPE.g01
- Applications Guide_Example 5 - Multiple Openings_MULTOPEN.g01

**Recommendation:**
Update `booleanPart` to support multiple modes or add a `1,0` mode alongside `-1,0`. May need to detect the format dynamically or make it configurable per file version.

---

### 2. Missing `BreakLine CellSize Min=` Optional Support
**Status:** 🔴 Critical
**Affected Files:** 5 occurrences
**Schema Impact:** 2D geometry (breakLineSchema)

**Description:**
The `BreakLine CellSize Min=` field can be blank (null) in some geometry files, but the schema expects a number value without `nullOnBlank: true`.

**Error:**
```
Expected number but found blank segment
[ParseContext] Last parsed line index: 14786, content: "BreakLine CellSize Min="
```

**Affected Files:**
- 2D Unsteady Flow Hydraulics_BaldEagleCrkMulti2D_BaldEagleDamBrk.g02
- 2D Unsteady Flow Hydraulics_BaldEagleCrkMulti2D_BaldEagleDamBrk.g03
- 2D Unsteady Flow Hydraulics_BaldEagleCrkMulti2D_BaldEagleDamBrk.g09
- 2D Unsteady Flow Hydraulics_BaldEagleCrkMulti2D_BaldEagleDamBrk.g11

**Recommendation:**
Add `nullOnBlank: true` to the `BreakLine CellSize Min=` field in `breakLineSchema.ts`.

---

### 3. Missing Gate Support in Lateral Weir Schema
**Status:** 🔴 Critical
**Affected Files:** 1 occurrence
**Schema Impact:** lateralWeirSchema

**Description:**
Lateral weirs can have gates defined with `LW Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings`, but this is not supported in the current schema.

**Error:**
```
Expected gate opening line at index 62 for opening 1
[ParseContext] Last parsed line index: 59, content: "LW Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings"
```

**Affected Files:**
- Applications Guide_Example 21 - Overflow Gates_Overflow.g03

**Recommendation:**
Add gate definition support to `lateralWeirSchema.ts` similar to connection gate handling.

---

## High Priority Issues (Data Loss)

### 4. Missing `Multiple Barrel Culv=` Support
**Status:** 🟠 High
**Affected Files:** 2 occurrences
**Schema Impact:** 1D culverts

**Description:**
Multiple barrel culverts are not supported in the 1D culvert schema. The line is not parsed and data is lost during round-trip.

**Example:**
```
Multiple Barrel Culv=2,1.88,2.42,49.54,0.017,0.5,1,58,1,261.2,261.1, 2,Culvert #1  , 0 ,3.79
```

**Affected Files:**
- Applications Guide_Example 22 - Groundwater Interflow_BeaverSALeak.g01 (2 occurrences)

**Recommendation:**
Add `Multiple Barrel Culv=` field to the 1D culvert schema.

---

### 5. Missing `Node Name=` Support in Cross Sections
**Status:** 🟠 High
**Affected Files:** 2 occurrences
**Schema Impact:** crossSectionSchema, oneDimensionalBridgeSchema

**Description:**
Cross sections and bridges can have an optional `Node Name=` field that is not in the schema.

**Example:**
```
Node Name=LD5HW
Node Name=Low Water Bridge
```

**Affected Files:**
- 1D Unsteady Flow Hydraulics_NavigationDam_StPaul.g02
- 2D Unsteady Flow Hydraulics_BaldEagleCrkMulti2D_BaldEagleDamBrk.g06

**Recommendation:**
Add optional `Node Name=` field to `crossSectionSchema.ts` and `oneDimensionalBridgeSchema.ts`.

---

### 6. Missing Gate Support in 2D Connections
**Status:** 🟠 High
**Affected Files:** 3 occurrences
**Schema Impact:** connectionSchema (2D)

**Description:**
2D area connections can have gates defined with `Conn Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings`, but this is not supported.

**Example:**
```
Conn Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings
```

**Affected Files:**
- 2D Unsteady Flow Hydraulics_BaldEagleCrkMulti2D_BaldEagleDamBrk.g01
- 2D Unsteady Flow Hydraulics_BaldEagleCrkMulti2D_BaldEagleDamBrk.g12
- 2D Unsteady Flow Hydraulics_BaldEagleCrkMulti2D_BaldEagleDamBrk.g13

**Recommendation:**
Add gate definition support to `connectionSchema.ts`.

---

### 7. Missing `BC HTab HWMax=` Support in 1D Bridges
**Status:** 🟠 High
**Affected Files:** 2 occurrences
**Schema Impact:** oneDimensionalBridgeSchema

**Description:**
1D bridges can have a `BC HTab HWMax=` (bridge culvert hydraulic table headwater maximum) field that is not in the schema.

**Example:**
```
BC HTab HWMax=220
```

**Affected Files:**
- 1D Unsteady Flow Hydraulics_Unsteady Flow Encroachment Analysis_UnsteadyEncroachment.g01 (2 occurrences)

**Recommendation:**
Add `BC HTab HWMax=` field to `oneDimensionalBridgeSchema.ts`.

---

### 8. Missing River Reach Storage Area Fields
**Status:** 🟠 High
**Affected Files:** 2 occurrences
**Schema Impact:** riverReachSchema

**Description:**
River reaches can have upstream and downstream storage area connections that are not in the schema:
- `Reach Downstream Storage Area=`
- `Reach Upstream Storage Area=`

**Example:**
```
Reach Downstream Storage Area=BaldEagleCr
Reach Upstream Storage Area=Upstream2D
```

**Affected Files:**
- 2D Unsteady Flow Hydraulics_BaldEagleCrkMulti2D_BaldEagleDamBrk.g08
- 2D Unsteady Flow Hydraulics_BaldEagleCrkMulti2D_BaldEagleDamBrk.g10

**Recommendation:**
Add both storage area fields to `riverReachSchema.ts`.

---

### 9. Missing `Lateral Weir Is Sharp=` Support
**Status:** 🟠 High
**Affected Files:** 1 occurrence
**Schema Impact:** lateralWeirSchema

**Description:**
Lateral weirs can have a `Lateral Weir Is Sharp=` field (boolean) that is not in the schema.

**Example:**
```
Lateral Weir Is Sharp=-1
```

**Affected Files:**
- Applications Guide_Example 20 - HagerLatWeir_HagerLatWeir.g04

**Recommendation:**
Add `Lateral Weir Is Sharp=` boolean field to `lateralWeirSchema.ts`.

---

### 10. Missing Description Block Support in Lateral Weirs
**Status:** 🟠 High
**Affected Files:** 2 occurrences
**Schema Impact:** lateralWeirSchema

**Description:**
Lateral weirs can have description blocks starting with `BEGIN DESCRIPTION:`, but this is not supported in the schema.

**Example:**
```
BEGIN DESCRIPTION:
[description text]
END DESCRIPTION:
```

**Affected Files:**
- Applications Guide_Example 24 - Mannings-n-Calibration_Manning'snCalibra.g01 (2 occurrences)

**Recommendation:**
Add description block support to `lateralWeirSchema.ts` using a `repeat` or `contextual` pattern.

---

## Medium Priority Issues (Formatting Inconsistencies)

### 11. River/Reach Name Padding Issues
**Status:** 🟡 Medium
**Affected Files:** 5 occurrences
**Schema Impact:** riverReachSchema, junctionSchema

**Description:**
The reach name in `Up River,Reach=` should be padded to 12 characters (not 16), but the serializer is not padding correctly.

**Example:**
```
Original:  "Up River,Reach=Baxter River    ,Upper Reach     "
Serialized: "Up River,Reach=Baxter River    ,Upper Reach"
```

**Affected Files:**
- 1D Steady Flow Hydraulics_Baxter RAS Mapper_RAS Model_Baxter.g02
- 1D Unsteady Flow Hydraulics_JunctionHydraulics_JunctionHydraulics.serialized.g02 (2 occurrences)
- Applications Guide_Example 17 - Unsteady Flow Application_Diamond.g01
- Applications Guide_Example 23 - Urban Modeling_OrleansEx.g04

**Recommendation:**
Update the reach name field width from 16 to 12 in `riverReachSchema.ts` and `junctionSchema.ts`.

---

### 12. Junction Name Padding Issues
**Status:** 🟡 Medium
**Affected Files:** 2 occurrences
**Schema Impact:** junctionSchema

**Description:**
Junction names should be padded to 16 characters but are not being padded during serialization.

**Example:**
```
Original:  "Junct Name=Sutter"
Serialized: "Junct Name=Sutter          "
```

**Affected Files:**
- 1D Unsteady Flow Hydraulics_JunctionHydraulics_JunctionHydraulics.serialized.g02 (2 occurrences)

**Recommendation:**
Verify and fix padding for `Junct Name=` in `junctionSchema.ts` (should be 16 characters).

---

### 13. Coordinate Decimal Formatting
**Status:** 🟡 Medium
**Affected Files:** 5 occurrences
**Schema Impact:** storageAreaSchema (2D surface lines)

**Description:**
Whole number coordinates (0, 1, 2, etc.) should include a trailing decimal point (0., 1., 2.) in storage area surface lines, but the serializer outputs them without.

**Example:**
```
Original:  "              0.              0.                "
Serialized: "               0               0                "
```

**Affected Files:**
- 2D Sediment Transport_Weise_2D_Backup.g01
- 2D Sediment Transport_Weise_2D_Backup_Weise.2022-Dec-08(1).g08
- 2D Sediment Transport_Weise_2D_Weise.g08 (3 occurrences)

**Recommendation:**
Update the coordinate formatter to preserve trailing decimal points for whole numbers in storage area surface lines.

---

### 14. `LW Div RC=` Backward Compatibility Issue
**Status:** 🟡 Medium
**Affected Files:** 2 occurrences
**Schema Impact:** lateralWeirSchema

**Description:**
The `LW Div RC=` field has changed between HEC-RAS versions. Older files (v5) have 3 parts (2 commas), newer files (v6) have 4 parts (3 commas). The serializer outputs the new format, adding an extra comma.

**Example:**
```
Original:  "LW Div RC= 0 ,False,"
Serialized: "LW Div RC= 0 ,False,,"
```

**Affected Files:**
- test/data/Muncie.g01
- 1D Unsteady Flow Hydraulics_Simplified Physical Breaching_L40_Levee_Outflow_H.g02

**Recommendation:**
Add version detection or make the 4th part optional with conditional serialization based on file version.

---

### 15. Cross Section Sediment Elevation Ordering
**Status:** 🟡 Medium
**Affected Files:** 2 occurrences
**Schema Impact:** crossSectionSchema

**Description:**
The sediment elevation field should appear before `XS HTab Starting El and Incr=`, but the schema has them in the wrong order.

**Example:**
```
Original line: "XS HTab Starting El and Incr=436.8,1, 63"
Expected before this: [sediment elevation field]
```

**Affected Files:**
- 1D Unsteady Flow Hydraulics_NavigationDam_ROCK_TEST.g02 (2 occurrences)

**Recommendation:**
Reorder fields in `crossSectionSchema.ts` to place sediment elevation before hydraulic table fields.

---

### 16. `Lateral Weir Distance=` Should Be Float, Not Int
**Status:** 🟡 Medium
**Affected Files:** 2 occurrences
**Schema Impact:** lateralWeirSchema

**Description:**
The `Lateral Weir Distance=` field is defined as an integer in the schema, but actual files contain decimal values.

**Example:**
```
Original:  "Lateral Weir Distance=3.4"
Serialized: "Lateral Weir Distance=3"

Original:  "Lateral Weir Distance=3.6"
Serialized: "Lateral Weir Distance=3"
```

**Affected Files:**
- 2D Unsteady Flow Hydraulics_Muncie_Muncie.g02
- 2D Unsteady Flow Hydraulics_Muncie_Muncie.g04

**Recommendation:**
Change `Lateral Weir Distance=` from `integerPart()` to `numberPart()` in `lateralWeirSchema.ts`.

---

## Low Priority Issues (Legacy File Support)

### 17. Missing `Program Version` in Very Old Files
**Status:** 🟢 Low
**Affected Files:** 2 occurrences
**Schema Impact:** geometrySchema

**Description:**
Some very old geometry files don't have a `Program Version` line. These files are likely from ancient HEC-RAS versions and may not need support.

**Example:**
```
Geometry File
Viewing Rectangle= 7.81008166957784E-02 , 0.894100828855126 , 0.908000006079674 , 9.19999939203262E-02
[no Program Version line]
```

**Affected Files:**
- Applications Guide_Example 14 - Ice Covered River_thames.g02 (2 occurrences)

**Recommendation:**
Decision needed: Support legacy format or document as unsupported. If support is needed, make `Program Version` optional in `geometrySchema.ts`.

---

## Summary Statistics

- **Total Issues:** 17 unique issues
- **Critical (Blocking):** 3 issues (18%)
- **High Priority (Data Loss):** 7 issues (41%)
- **Medium Priority (Formatting):** 6 issues (35%)
- **Low Priority (Legacy):** 1 issue (6%)
- **Total Affected Files:** 57 file instances across all issues

## Next Steps

1. **Phase 1 (Critical):** Fix boolean encoding and blank field handling
2. **Phase 2 (High Priority):** Add missing schema fields to prevent data loss
3. **Phase 3 (Medium Priority):** Fix formatting inconsistencies for perfect round-trip
4. **Phase 4 (Low Priority):** Decide on legacy file support strategy
