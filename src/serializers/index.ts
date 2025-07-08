// Main serializer exports - Individual component access functions
// Provides both main geometry serializer and individual component serializers

// Main geometry serializer
export { serializeGeometry, serializeGeometryString } from "./geometrySerializer"

// Individual component serializers
export { serializeCulvert, serializeCulvertGroup, serializeCulvertGroups } from "./geometry/culvertSerializer"
export { serializeBridge, serializeBridgeConnection } from "./geometry/bridgeSerializer"
export { serializeConnection, serializeConnectionString } from "./geometry/connectionSerializer"
export { serializeStorageArea, serializeStorageAreaString } from "./geometry/storageAreaSerializer"
export { serializeBoundaryCondition, serializeBoundaryConditionString } from "./geometry/boundaryConditionSerializer"
export { serializeGeometryHeader, serializeGeometryHeaderString } from "./geometry/geometryHeaderSerializer"

// Atomic serializer utilities
export {
  formatKeyValue,
  formatCommaSeparated,
  formatFixedWidth,
  formatNumbersToChunks,
  formatNumbersOrNullToChunks,
  formatCoordinates,
  formatCoordinateLines,
  formatStationPairs,
  formatStationPairLines,
  formatDescriptionBlock,
} from "./atomic"
