import { describe, it, expect } from "vitest"
import { parseHECRASDuration } from "../src/parsers/atomic"
import { serializeHECRASDuration } from "../src/serializers/atomic"

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
      expect(serializeHECRASDuration(0.1)).toBe("0.1SEC")
      expect(serializeHECRASDuration(1)).toBe("1SEC")
      expect(serializeHECRASDuration(30)).toBe("30SEC")
    })

    it("should serialize minutes", () => {
      expect(serializeHECRASDuration(60)).toBe("1MIN")
      expect(serializeHECRASDuration(120)).toBe("2MIN")
      expect(serializeHECRASDuration(180)).toBe("3MIN")
    })

    it("should serialize hours", () => {
      expect(serializeHECRASDuration(3600)).toBe("1HOUR")
      expect(serializeHECRASDuration(7200)).toBe("2HOUR")
      expect(serializeHECRASDuration(10800)).toBe("3HOUR")
    })

    it("should serialize days", () => {
      expect(serializeHECRASDuration(86400)).toBe("1DAY")
    })

    it("should serialize weeks", () => {
      expect(serializeHECRASDuration(604800)).toBe("1WEEK")
    })
    it("should serialize months", () => {
      expect(serializeHECRASDuration(2592000)).toBe("1MONTH")
    })

    it("should serialize years", () => {
      expect(serializeHECRASDuration(31536000)).toBe("1YEAR")
    })
  })
})
