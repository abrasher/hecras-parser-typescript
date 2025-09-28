import { describe, expect, it } from "vitest"
import {
  formatKeyValue,
  formatCommaSeparated,
  formatBoolean,
  formatDuration,
  formatFixedWidth,
  formatNullableNumber,
  formatChunkedLines,
  formatHECRASCoordinateNumber,
  formatHECRASStationNumber,
  formatCoordinateChunks,
  formatCoordinateMultipleLines,
  formatStationChunks,
  formatStationElevationPairs,
} from "../../src/schema/serializationUtils"

describe("serializationUtils", () => {
  describe("formatKeyValue", () => {
    it("should format key-value pairs", () => {
      expect(formatKeyValue("test", 123)).toBe("test=123")
      expect(formatKeyValue("key", "value", ":")).toBe("key:value")
      expect(formatKeyValue("empty", undefined)).toBe("")
    })
  })

  describe("formatCommaSeparated", () => {
    it("should join values with commas", () => {
      expect(formatCommaSeparated([1, 2, 3])).toBe("1,2,3")
      expect(formatCommaSeparated(["a", "b", "c"])).toBe("a,b,c")
      expect(formatCommaSeparated([])).toBe("")
    })
  })

  describe("formatBoolean", () => {
    it("should format boolean in 10 mode (default)", () => {
      expect(formatBoolean(true)).toBe("-1")
      expect(formatBoolean(false)).toBe(" 0")
      expect(formatBoolean(false, "10", false)).toBe("0")
    })

    it("should format boolean in TF mode", () => {
      expect(formatBoolean(true, "TF")).toBe("T")
      expect(formatBoolean(false, "TF")).toBe("F")
    })

    it("should format boolean in trueFalse mode", () => {
      expect(formatBoolean(true, "trueFalse")).toBe("True")
      expect(formatBoolean(false, "trueFalse")).toBe("False")
    })

    it("should format boolean in enableDisable mode", () => {
      expect(formatBoolean(true, "enableDisable")).toBe("Enable")
      expect(formatBoolean(false, "enableDisable")).toBe("Disable")
    })
  })

  describe("formatDuration", () => {
    it("should format durations correctly", () => {
      expect(formatDuration(30)).toBe("30SEC")
      expect(formatDuration(120)).toBe("2MIN")
      expect(formatDuration(7200)).toBe("2HOUR")
      expect(formatDuration(86400)).toBe("1DAY")
    })
  })

  describe("formatFixedWidth", () => {
    it("should format numbers with fixed width", () => {
      expect(formatFixedWidth(123, 8)).toBe("   123.0")
      expect(formatFixedWidth("test", 8)).toBe("    test")
      expect(formatFixedWidth(123.456, 5)).toBe("123.4") // truncated
    })

    it("should handle null and undefined", () => {
      expect(formatFixedWidth(null, 5, { nullToken: "NULL" })).toBe(" NULL")
      expect(formatFixedWidth(undefined, 5)).toBe("     ")
    })

    it("should support end padding", () => {
      expect(formatFixedWidth("test", 8, { padDirection: "end" })).toBe("test    ")
    })
  })

  describe("formatNullableNumber", () => {
    it("should mirror parseMaybeFloat semantics", () => {
      expect(formatNullableNumber(123.45)).toBe("123.45")
      expect(formatNullableNumber(null, { blankToken: "NULL" })).toBe("NULL")
      expect(formatNullableNumber(undefined)).toBe("") // blank for undefined
    })

    it("should support width formatting", () => {
      expect(formatNullableNumber(123, { width: 8 })).toBe("   123.0")
    })
  })

  describe("formatChunkedLines", () => {
    it("should format values into chunked lines", () => {
      const values = [1, 2, 3, 4, 5, 6]
      const result = formatChunkedLines(values, {
        width: 4,
        perLine: 2,
        formatter: (n) => n.toString(),
      })
      expect(result).toEqual(["   1   2", "   3   4", "   5   6"])
    })
  })

  describe("formatHECRASCoordinateNumber", () => {
    it("should format coordinates using HEC-RAS conventions", () => {
      expect(formatHECRASCoordinateNumber(0)).toBe("0")
      expect(formatHECRASCoordinateNumber(123)).toBe("123.")
      expect(formatHECRASCoordinateNumber(0.584)).toBe(" .584")
      expect(formatHECRASCoordinateNumber(123.456)).toBe("123.456")
    })
  })

  describe("formatHECRASStationNumber", () => {
    it("should format stations using HEC-RAS conventions", () => {
      expect(formatHECRASStationNumber(null)).toBe("")
      expect(formatHECRASStationNumber(0)).toBe("0")
      expect(formatHECRASStationNumber(0.584)).toBe(".584")
      expect(formatHECRASStationNumber(-0.584)).toBe("-.584")
      expect(formatHECRASStationNumber(123.456)).toBe("123.456")
    })
  })

  describe("formatCoordinateChunks", () => {
    it("should format coordinate pairs into fixed-width lines", () => {
      const coords: [number, number][] = [[123.0, 456.0], [0.5, -0.25]]
      const result = formatCoordinateChunks(coords)
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveLength(32) // 2 numbers × 16 chars each
    })
  })

  describe("formatCoordinateMultipleLines", () => {
    it("should include header with coordinate count", () => {
      const coords: [number, number][] = [[1, 2], [3, 4]]
      const result = formatCoordinateMultipleLines("XYZ", coords)
      expect(result[0]).toBe("XYZ=2")
      expect(result).toHaveLength(3) // header + 2 coordinate lines
    })

    it("should support padded length value", () => {
      const coords: [number, number][] = [[1, 2]]
      const result = formatCoordinateMultipleLines("BC", coords, true)
      expect(result[0]).toBe("BC= 1 ")
    })
  })

  describe("formatStationChunks", () => {
    it("should format station data into 8-char chunks", () => {
      const stations = [100.0, 200.0, 300.0, 400.0]
      const result = formatStationChunks(stations)
      expect(result[0]).toHaveLength(32) // 4 numbers × 8 chars each
    })
  })

  describe("formatStationElevationPairs", () => {
    it("should be an alias for formatStationChunks", () => {
      const data = [1, 2, 3, 4]
      expect(formatStationElevationPairs(data)).toEqual(formatStationChunks(data))
    })
  })
})