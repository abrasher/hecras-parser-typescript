import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"
import { parseUnsteadyFlow } from "../../src/parseUnsteadyFlow"

const dataDir = join(__dirname, "..", "data", "unsteady_flows")

describe("Unsteady Flow Parser", () => {
  it("parses BaldEagleDamBrk.u02", () => {
    const content = readFileSync(join(dataDir, "BaldEagleDamBrk.u02"), "utf-8")
    const uf = parseUnsteadyFlow(content)
    expect(uf.flowTitle).toBe("Single 2D Area with Bridges")
    expect(uf.programVersion).toBe("5.10")
    expect(uf.boundaries).toHaveLength(5)
    const upstream = uf.boundaries.find((b) => b.location[7].trim() === "Upstream Inflow")!
    expect(upstream.flowHydrograph).toBeDefined()
    expect(upstream.flowHydrograph![0]).toBe(1000)
    expect(upstream.flowHydrograph![199]).toBe(5000)
    const gateBoundary = uf.boundaries.find((b) =>
      b.location.some((l) => l.trim() === "Sayers Dam"),
    )!
    expect(gateBoundary.gates[0].openings[0]).toBe(2)
    expect(uf.metBC.length).toBe(18)
    expect(uf.nonNewtonian["Non-Newtonian Method"]).toBe("0")
  })

  it("parses BaldEagleDamBrk.u03 with gridded precipitation", () => {
    const content = readFileSync(join(dataDir, "BaldEagleDamBrk.u03"), "utf-8")
    const uf = parseUnsteadyFlow(content)
    expect(uf.programVersion).toBe("6.00")
    expect(uf.metBC.some((v) => v.includes("Precipitation|Gridded DSS Pathname"))).toBe(true)
  })

  it("parses BaldEagleDamBrk.u08 initial flows", () => {
    const content = readFileSync(join(dataDir, "BaldEagleDamBrk.u08"), "utf-8")
    const uf = parseUnsteadyFlow(content)
    expect(uf.initialFlowLocations).toHaveLength(3)
    expect(uf.boundaries.length).toBeGreaterThan(5)
  })

  it("parses BaldEagleDamBrk.u09 upstream 2D", () => {
    const content = readFileSync(join(dataDir, "BaldEagleDamBrk.u09"), "utf-8")
    const uf = parseUnsteadyFlow(content)
    expect(uf.initialStorageElevations).toHaveLength(2)
    const usBoundary = uf.boundaries.find((b) => b.location[7].trim() === "USFlow")
    expect(usBoundary?.flowHydrograph?.length).toBe(204)
  })

  it("parses BaldEagleDamBrk.u13", () => {
    const content = readFileSync(join(dataDir, "BaldEagleDamBrk.u13"), "utf-8")
    const uf = parseUnsteadyFlow(content)
    expect(uf.boundaries[2].flowHydrograph?.length).toBe(200)
  })

  it("parses Muncie.u01 with lava parameters", () => {
    const content = readFileSync(join(dataDir, "Muncie.u01"), "utf-8")
    const uf = parseUnsteadyFlow(content)
    expect(Object.keys(uf.lava || {})).toContain("Lava Activation")
    expect(uf.metBC.length).toBeGreaterThan(0)
  })
})
