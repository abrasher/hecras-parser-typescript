# Plan Files Schema Analysis

This document captures a high-level scaffold of the HEC-RAS plan (*.p##) files located in `test/data/plans`. It mirrors how we break down geometry schemas, but deliberately stops short of actual implementation so we can tackle each section iteratively.

## 1. Header & Core Context

1. **PlanMetadata** – `Plan Title`, `Program Version`, padded `Short Identifier`, `Simulation Date`, `Geom File`, `Flow File`, and the flow-regime flag (`Subcritical Flow`).
2. **FlowRegimeAndDefaults** – global tolerances (`K Sum by GR`, `Std Step Tol`, `Critical Tol`, etc.), method flags like `Parabolic Critical Depth`, and friction/bridge slope selections.
3. **GlobalFlagsAndEncroachment** – multi-value toggles such as `Global Vel Dist`, `Global Log Level`, `CheckData`, and the four-part `Encroach Param` line.
4. **DescriptionBlock** – optional `BEGIN DESCRIPTION:` / `END DESCRIPTION:` payload; must preserve internal line breaks verbatim.
5. **IntervalsAndAdaptiveTimeStep** – base intervals (`Computation Interval`, `Output Interval`, `Instantaneous Interval`, `Mapping Interval`) plus the optional Courant/time-series adaptive controls seen in later plans.
6. **IOAndEcho** – `DSS File`, IC write scheduling, `Echo` flags, and the full suite of HDF output switches (including the expanded cell-level variants in newer files).

## 2. Solver & Execution Controls

1. **RunComponentSwitches** – contiguous block of binary toggles for `Run HTab`, `Run UNet`, `Run Sediment`, `Run PostProcess`, `Run WQNet`, `Run RASMapper`.
2. **Unet1DCore** – theta parameters, tolerances (`UNET ZTol`, `UNET ZSATol`, `UNET QTol`), iteration limits, CRT caps, stabilizer coefficients, DSS multiplier, and solver selection.
3. **Unet1DEnhancements** – Froude reduction, time slicing, methodology (`UNET 1D Methodology`), junction-loss flag, wind reference/drag formulation, etc.
4. **Unet2DGlobal** – shared 2D settings: Coriolis, core count, theta, volume tolerance, iteration maxima, equation type, ramp-up fraction, time slices, eddy/smagorinsky viscosities, and solver type.
5. **Unet2DAreaOverrides** – repeated `UNET D2 Name=` blocks, each restating the theta/tolerance bundle and optional viscosity/solver overrides; should be parsed via `repeat` keyed on the header.
6. **CouplingAndResourceLimits** – D1/D2 coupling tolerances (`UNET D1D2 ZTol`, `QTol`, `MinQTol`), max iteration cap, and any cross-engine resource controls.

## 3. Scenario Features & Boundary Data

1. **BoundaryHydrographsAndLinks** – repeated `Stage Flow Hydrograph=` lines plus optional ADH coupling (`ADH Filename`, `ADH Link`).
2. **BreachDefinitions** – repeated `Breach Loc` sections with `Breach Method`, `Breach Geom`, `Breach Start`; needs to support both fully populated and comma-blank entries.
3. **BreachGrowthAndOptions** – trailing tables (`Breach Progression`, `Simplified Physical Breach Downcutting/Widening`), sentinel-based numeric fields (`Starting Notch Depth`, `Initial Piping Diameter`, `Mass Wasting ...`), growth-ratio flags, DLBreach metadata, calculator data.
4. **Calibration** – method, iteration limits, max-change and tolerance settings, bounds, optimization mode, and optional window tuple.
5. **WaterQuality** – `WQ AD ...` header, timing controls, dozens of per-output toggles, restart configuration, and fixed-temperature flags.
6. **SedimentAndMorphology** – sorting/armoring iterations, XS weighting, output increments, gradation hotstart configuration, erosion/deposition method selectors, solver tolerances, and layer thickness/limit parameters.

## 4. Cross-Cutting Data Patterns

- **CountedTables** – headers like `Breach Progression= 21` followed by `count * 2` tokens; prefer `tupleArrayField` (with the header line carrying the count) to stay inside the DSL. Drop to `contextual` only if the format mixes delimiters or spacing we can’t express via tuple arrays.
- **BlankSentinels** – `3.402823E+38` marks “unset” numeric values (notch depth, piping diameter, layer limits); serializers must preserve this sentinel rather than omitting lines.
- **BooleanEncodings** – mixture of `True/False` literals and numeric booleans (`0/1`, occasionally `-1/0`); each schema field must specify the appropriate encoding mode.
- **FixedWidthIdentifiers** – padded identifiers (e.g., `Short Identifier`, river/reach names in `Breach Loc` or `Stage Flow Hydrograph`) require `stringField` definitions with explicit widths to maintain whitespace.

## 5. Recommended Implementation Order

1. Start with **PlanMetadata** and **RunComponentSwitches** to establish the scaffolding and overall plan shape.
2. Follow with **Unet1DCore** and **IntervalsAndAdaptiveTimeStep** since they introduce the common numeric/boolean modes used elsewhere.
3. Implement **BreachDefinitions** + **BreachGrowthAndOptions** together to validate repeated `contextual` + sentinel handling before tackling other repeats.
4. Add **BoundaryHydrographsAndLinks** and **WaterQuality**, then close with the verbose **SedimentAndMorphology** section once helper utilities are in place.

This structure mirrors the ordering of the sample plan files and should make it straightforward to add schema definitions and tests section by section.
