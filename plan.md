# Architecture plan
I want to simplify the architecture. Things that are present currently that I don't need:
1. keeping track of errors, warnings, and recovery in the parsers.
2. remove plugin system

Instead
1. if the parser fails, just throw error.
2. just expose a parseGeometry, parse____ instead of detecting file type automatically

I first want solid atomic parsers for the different basic structures. Some are already made in src/utils and @src/core/primitives:
- parseKeyValue
- parseCommaSeparated
- chunkStringToNumbers
- numbersToCoordinates

Which will be used to built up the next level of parsing which uses the atomic parsers to make line type parsers such as
- parseLineToCoordinates
- parseLineStationPairs

Object level parsers which are specialized to parse one kind of object. may delegate to smaller object parsers.
- parseBarrel
- parseCulvertGroup (which calls some atomic parsers and parseBarrel)
- parseCulvertGroup (which calls parseCulvertGroup and some atomic parers)
- parseCulvertData (which calls parseCulvertGroup one or more times) 
- parseConnection (which would call parseCulvertData and others)

Levels of parsing (lowests to highest level)
1. atomic parsers (very simple)
2. single line type parsers (uses atomic parsers and some logic)
3. single object level parsers (takes in the result of single line parsers and transform it into an object, may call separate object parsers)

This will allow every part of the parser stack to be easily unit testable
