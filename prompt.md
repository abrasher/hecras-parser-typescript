## Goal

You are to refactor the code in `src/parsers` to consitency use the basic parsers.

## Summary

This is a project to parse HEC-RAS files into objects and then back to HEC-RAS files. It's a work in progress. Currently it can only parse and serialize some parts of the HECRAS geometry files. In the future it will be able to parse all the HEC-RAS file types (such as flow files, plan files, etc).

## Project Structure

The parsers are in the `src/parsers` folder. Currently we have "basic" parsers `src/parsers/atomic.ts` and a level above `src/parsers/lineParsers.ts`
Then parsers for geometry are in `src/parsers/geometry`, split into separate files for each geometry attribute (eg. storageArea, connection, culvert, etc).

HEC-RAS files do follow a strict custom structure.

## Current Problem to Solve

Currently the parsers are not DRY and do not all use the atomic / line parsers.

## Solution

We need to refactor the parsers. We need to make sure that all parsers use the same basic parsers and that the parsers are DRY.

Considerations:

- We need to make sure that all parsers use the same basic parsers.
- We need to make sure that the parsers are DRY.
- We need to make sure the code is maintainable and easy to read. No heavy abstractions.
- We may need to add more basic / line parsers.
- The current heirarchy of parsers may not be the best way to do this.

Tasks:

- [] Research the current heirarchy of parsers. Look at the atomic and lineParsers. Then look at each parser in `src/parsers/geometry/` carefully. You need to determine if we need to our general approach.
- [] Create a comprehensive plan in `plan.md` of how to refactor the parsers.
- [] Get approval of the plan before starting work.
