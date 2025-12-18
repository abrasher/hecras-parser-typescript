// Data models
export type * from "./models/geometry/common"
export type * from "./models/plan/plan"
export type * from "./models/unsteadyFlow"

// Schema exports
export { parseWithSchema, serializeWithSchema } from "./schema/driver"
export { planSchema } from "./schemas/planSchema"
export { geometrySchema } from "./schemas/geometrySchema"
export type { Infer } from "./schema/core"

// Types
import { parseWithSchema, serializeWithSchema } from "./schema/driver"
import { planSchema } from "./schemas/planSchema"
import { geometrySchema } from "./schemas/geometrySchema"
import type { Infer } from "./schema/core"

export type Plan = Infer<typeof planSchema>
export type Geometry = Infer<typeof geometrySchema>

export type LineEndings = "\r\n" | "\n"

export interface SerializeOptions {
  /** Line ending style. Defaults to Windows line endings (\r\n). */
  lineEndings?: LineEndings
}

const DEFAULT_LINE_ENDINGS: LineEndings = "\r\n"

// Plan files (.pXX)

export function parsePlan(content: string): Plan {
  const normalized = content.replace(/\r\n/g, "\n")
  const lines = normalized.split("\n")
  const { value } = parseWithSchema(planSchema, lines, 0)
  return value
}

export function serializePlan(plan: Plan, options?: SerializeOptions): string {
  const lineEndings = options?.lineEndings ?? DEFAULT_LINE_ENDINGS
  const lines = serializeWithSchema(planSchema, plan)
  return lines.join(lineEndings)
}

// Geometry files (.gXX)

export function parseGeometry(content: string): Geometry {
  const normalized = content.replace(/\r\n/g, "\n")
  const lines = normalized.split("\n")
  const { value } = parseWithSchema(geometrySchema, lines, 0)
  return value
}

export function serializeGeometry(geometry: Geometry, options?: SerializeOptions): string {
  const lineEndings = options?.lineEndings ?? DEFAULT_LINE_ENDINGS
  const lines = serializeWithSchema(geometrySchema, geometry)
  return lines.join(lineEndings)
}
