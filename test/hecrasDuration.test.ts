import { describe, it, expect } from "vitest"
import { parseHECRASDuration } from "../src/parsers/atomic"
import { formatDuration } from "../src/serializers/atomic"

describe("hecrasDuration", () => {
  describe("parseHECRASDuration", () => {
    it("should parse seconds", () => {
      expect(parseHECRASDuration("0.1SEC")).toBe(0.1)
      expect(parseHECRASDuration("1SEC")).toBe(1)
      expect(parseHECRASDuration("30SEC")).toBe(30)
    })

    it("should parse minutes", () => {
      expect(parseHECRASDuration("1MIN")).toBe(60)
      expect(parseHECRASDuration("2MIN")).toBe(120)
      expect(parseHECRASDuration("3MIN")).toBe(180)
    })

    it("should parse hours", () => {
      expect(parseHECRASDuration("1HOUR")).toBe(3600)
      expect(parseHECRASDuration("2HOUR")).toBe(7200)
      expect(parseHECRASDuration("3HOUR")).toBe(10800)
    })

    it("should parse days", () => {
      expect(parseHECRASDuration("1DAY")).toBe(86400)
    })

    it("should parse weeks", () => {
      expect(parseHECRASDuration("1WEEK")).toBe(604800)
    })

    it("should parse months", () => {
      expect(parseHECRASDuration("1MONTH")).toBe(2592000)
    })

    it("should parse years", () => {
      expect(parseHECRASDuration("1YEAR")).toBe(31536000)
    })
  })

  describe("serializeHECRASDuration", () => {
    it("should serialize seconds", () => {
      expect(formatDuration(0.1)).toBe("0.1SEC")
      expect(formatDuration(1)).toBe("1SEC")
      expect(formatDuration(30)).toBe("30SEC")
    })

    it("should serialize minutes", () => {
      expect(formatDuration(60)).toBe("1MIN")
      expect(formatDuration(120)).toBe("2MIN")
      expect(formatDuration(180)).toBe("3MIN")
    })

    it("should serialize hours", () => {
      expect(formatDuration(3600)).toBe("1HOUR")
      expect(formatDuration(7200)).toBe("2HOUR")
      expect(formatDuration(10800)).toBe("3HOUR")
    })

    it("should serialize days", () => {
      expect(formatDuration(86400)).toBe("1DAY")
    })

    it("should serialize weeks", () => {
      expect(formatDuration(604800)).toBe("1WEEK")
    })
    it("should serialize months", () => {
      expect(formatDuration(2592000)).toBe("1MONTH")
    })

    it("should serialize years", () => {
      expect(formatDuration(31536000)).toBe("1YEAR")
    })
  })
})
