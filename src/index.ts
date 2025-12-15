// Data models
export type * from "./models/geometry/common"
export type * from "./models/plan/plan"
export type * from "./models/unsteadyFlow"

// Schema exports
export { parseWithSchema, serializeWithSchema } from "./schema/driver"
export { planSchema } from "./schemas/planSchema"
export type { Infer } from "./schema/core"

// Plan parser convenience functions
import { parseWithSchema, serializeWithSchema } from "./schema/driver"
import { planSchema } from "./schemas/planSchema"
import type { Infer } from "./schema/core"

export type Plan = Infer<typeof planSchema>

export function parsePlan(content: string): Plan {
  const lines = content.split("\n")
  const { value } = parseWithSchema(planSchema, lines, 0)
  return value
}

export function serializePlan(plan: Plan): string {
  const lines = serializeWithSchema(planSchema, plan)
  console.log("Serialized lines:", lines)
  return lines.join("\n")
}
