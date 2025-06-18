import { describe, it, expect } from "vitest"
import { chunkStringToNumbers } from "../src/core/primitives"

describe("HECRASPrimitives", () => {
  describe("chunkStringToNumbers", () => {
    it("should parse a 64-character string into 4 numbers", () => {
      // Each chunk is exactly 16 characters
      const input1 =
        "    484341.38666   4751440.89191484324.294289998   4751440.29566"

      expect(input1.length).toBe(64)

      const result1 = chunkStringToNumbers(input1, 16)

      expect(result1.data).toEqual([
        484341.38666, 4751440.89191, 484324.294289998, 4751440.29566,
      ])
      expect(result1.errors).toHaveLength(0)
      expect(result1.warnings).toHaveLength(0)
      expect(result1.recovered).toBe(false)

      const input2 =
        "485594.4553931384751612.90089524485630.124233531  4751617.106293"
      expect(input2.length).toBe(64)

      const result2 = chunkStringToNumbers(input2, 16)

      expect(result2.data).toEqual([
        485594.455393138, 4751612.90089524, 485630.124233531, 4751617.106293,
      ])
      expect(result2.errors).toHaveLength(0)
      expect(result2.warnings).toHaveLength(0)
      expect(result2.recovered).toBe(false)
    })
  })
})
