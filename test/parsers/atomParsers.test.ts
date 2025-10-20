import { describe, it, expect } from "vitest"
import { chunkStringToNumbers } from "../../src/parsers/atomic"

describe("", () => {
  describe("chunkStringToNumbers", () => {
    it("should parse a 64-character string into 4 numbers", () => {
      // Each chunk is exactly 16 characters
      const input1 = "    484341.38666   4751440.89191484324.294289998   4751440.29566"
      const result1 = chunkStringToNumbers(input1, 16)

      expect(input1.length).toBe(64)
      expect(result1).toEqual([484341.38666, 4751440.89191, 484324.294289998, 4751440.29566])

      // Test string with no spaces
      const input2 = "485594.4553931384751612.90089524485630.124233531  4751617.106293"
      expect(input2.length).toBe(64)

      const result2 = chunkStringToNumbers(input2, 16)

      expect(result2).toEqual([
        485594.455393138, 4751612.90089524, 485630.124233531, 4751617.106293,
      ])
    })
  })
})
