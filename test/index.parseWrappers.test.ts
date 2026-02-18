import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseGeometry, parsePlan, parseSteadyFlow, parseUnsteadyFlow } from "../src/index"
import { parseWithSchema } from "../src/schema"
import { planSchema } from "../src/schemas/planSchema"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function readFixture(relativePath: string): string {
  return readFileSync(resolve(__dirname, relativePath), "utf-8")
}

const geometryContent = readFixture("./data/Dingman.g01")
const steadyFlowContent = readFixture("./data/steady_flows/Mixed_Flow_Regime_Channel__MIXED.f01")
const unsteadyFlowContent = readFixture("./data/unsteady_flows/Muncie.u01")
const fullPlanContent = readFixture("./data/plans/Muncie.p01")

const planLines = fullPlanContent.replace(/\r\n/g, "\n").split("\n")
const planPrefix = (() => {
  const { nextIndex } = parseWithSchema(planSchema, planLines, 0)
  return planLines.slice(0, nextIndex).join("\n")
})()

const parseCases = [
  {
    fileType: "plan",
    content: planPrefix,
    parse: parsePlan,
  },
  {
    fileType: "geometry",
    content: geometryContent,
    parse: parseGeometry,
  },
  {
    fileType: "steady flow",
    content: steadyFlowContent,
    parse: parseSteadyFlow,
  },
  {
    fileType: "unsteady flow",
    content: unsteadyFlowContent,
    parse: parseUnsteadyFlow,
  },
] as const

const throwCases = [
  {
    fileType: "plan",
    content: planPrefix,
    parse: parsePlan,
  },
  {
    fileType: "geometry",
    content: geometryContent,
    parse: parseGeometry,
  },
  {
    fileType: "steady flow",
    content: steadyFlowContent,
    parse: parseSteadyFlow,
  },
] as const

describe("public parse wrappers", () => {
  it.each(throwCases)(
    "throws by default on unknown trailing content for $fileType",
    ({ fileType, content, parse }) => {
      const trailingLine = "Unknown Trailing Line=1"
      const input = `${content}\n${trailingLine}`
      const lineNumber = content.replace(/\r\n/g, "\n").split("\n").length + 1

      expect(() => parse(input)).toThrowError(
        new RegExp(
          `Unparsed trailing content in ${fileType} file at line ${lineNumber}: ${JSON.stringify(trailingLine)}`,
        ),
      )
    },
  )

  it("allows partial parsing when requireFullParse is false", () => {
    expect(() => parsePlan(fullPlanContent, { requireFullParse: false })).not.toThrow()
  })

  it.each(parseCases)("allows trailing blank lines for $fileType", ({ content, parse }) => {
    const withTrailingBlankLines = `${content}\n\n   \n`
    expect(() => parse(withTrailingBlankLines)).not.toThrow()
  })
})
