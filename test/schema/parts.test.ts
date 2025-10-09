import { describe, expect, it } from "vitest"
import {
  booleanPart,
  durationPart,
  numberPart,
  opt,
  stringPart,
} from "../../src/schema"

describe("schema parts", () => {
  it("parses and serializes string parts with trimming and width", () => {
    const part = stringPart({ trim: true, width: 5 })
    expect(part.parse("  abc  ")).toBe("abc")
    expect(part.serialize("hi")).toBe("hi   ")
  })

  it("handles integer and float number parts with null on blank", () => {
    const floatPart = numberPart()
    expect(floatPart.parse(" 3.5")).toBe(3.5)
    expect(floatPart.serialize(3.5)).toBe("3.5")

    const intPart = numberPart({ integer: true })
    expect(intPart.parse("7")).toBe(7)
    expect(intPart.serialize(7.9)).toBe("7")

    const nullablePart = numberPart({ nullOnBlank: true })
    expect(nullablePart.parse("   ")).toBeNull()
    expect(nullablePart.serialize(null)).toBe("")
  })

  it("optionally pads serialized numbers when requested", () => {
    const paddedPart = numberPart({ pad: true })
    expect(paddedPart.serialize(3.5)).toBe(" 3.5 ")
    expect(paddedPart.serialize(-3.5)).toBe("-3.5 ")
    expect(paddedPart.parse(" 3.5 ")).toBe(3.5)
    expect(paddedPart.serialize(Infinity)).toBe(" 1.79769313486232E+308 ")
  })

  it("handles scientific notation for large numbers and HEC-RAS infinity", () => {
    const part = numberPart()

    // Test automatic scientific notation for numbers with 16+ digits before decimal
    expect(part.serialize(1234567890123456)).toBe("1.234567890123456e+15")

    // Test normal formatting for numbers with <16 digits before decimal
    expect(part.serialize(123456789012345)).toBe("123456789012345")

    // Test HEC-RAS infinity representation
    expect(part.parse("1.79769313486232E+308")).toBe(Infinity)
    expect(part.serialize(Infinity)).toBe("1.79769313486232E+308")

    // Test round-trip for HEC-RAS infinity
    const parsed = part.parse("1.79769313486232E+308")
    expect(part.serialize(parsed)).toBe("1.79769313486232E+308")
  })

  it("supports boolean encodings", () => {
    const tfPart = booleanPart({ mode: "TF" })
    expect(tfPart.parse("T")).toBe(true)
    expect(tfPart.parse("F")).toBe(false)
    expect(tfPart.serialize(true)).toBe("T")

    const tensPart = booleanPart({ mode: "10" })
    expect(tensPart.parse("1")).toBe(true)
    expect(tensPart.parse("0")).toBe(false)
    expect(tensPart.serialize(false)).toBe("0")

    const wordPart = booleanPart({ mode: "trueFalse" })
    expect(wordPart.serialize(true)).toBe("True")
    expect(wordPart.serialize(false)).toBe("False")
  })

  it("wraps parts with opt to support undefined serialization", () => {
    const nullableNumber = opt(numberPart({ nullOnBlank: true }))
    expect(nullableNumber.parse("  ")).toBeNull()
    expect(nullableNumber.serialize(undefined)).toBe("")
    expect(nullableNumber.serialize(null)).toBe("")
  })

  it("parses and formats durations", () => {
    const part = durationPart()
    expect(part.parse("5MIN")).toBe(300)
    expect(part.serialize(3600)).toBe("1HOUR")
  })
})
