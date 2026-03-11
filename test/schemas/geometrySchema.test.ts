import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../src/schema"
import { geometrySchema } from "../../src/schemas/geometrySchema"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

it("round trips Burnt Islands geometry", () => {
  const filePath = resolve(__dirname, "../data/BurntIslands.g01")
  const fileContent = readFileSync(filePath, "utf-8")
  const lines = fileContent.replace(/\r\n/g, "\n").split("\n")

  const { value } = parseWithSchema(geometrySchema, lines, 0)
  const serializedLines = serializeWithSchema(geometrySchema, value)

  expect(serializedLines).toEqual(lines)
})
