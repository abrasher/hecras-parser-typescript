// New Enhanced API - Recommended for new projects
export { loadGeometry, loadGeometrySync } from "./loadGeometry"
export { HECRASGeometry } from "./HECRASGeometry"

// Legacy API - Maintained for backward compatibility
export { parseGeometry } from "./parseGeometry"

// Data models
export type * from "./models/geometry/geometryHeaders"
export type * from "./models/geometry/connection"
export type * from "./models/geometry/storageArea"
export type * from "./models/geometry/bridge"
export type * from "./models/geometry/culvert"
export type * from "./models/geometry/boundaryCondition"
export type * from "./models/geometry/common"
export type * from "./models/plan/plan"

// Plan parser
export { parsePlan } from "./parsers/plan/planParser"

// Serializers
export { serializeGeometry } from "./serializers/geometrySerializer"
export {
  serializeConnection,
  serializeConnectionString,
} from "./serializers/geometry/connectionSerializer"
export { serializeBridgeConnection } from "./serializers/geometry/bridgeSerializer"
export { serializeStorageArea } from "./serializers/geometry/storageAreaSerializer"
export { serializeBoundaryCondition } from "./serializers/geometry/boundaryConditionSerializer"
export { serializePlan } from "./serializers/geometry/planSerializer"

// Parsing utilities (for advanced users)
export { parseLineToCoordinates, parseLineStationPairs } from "./parsers/lineParsers"
