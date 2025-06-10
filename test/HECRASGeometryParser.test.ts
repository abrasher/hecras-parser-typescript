import { expect, it } from "vitest";
import { HECRASGeometry } from "../src/models/geometry";
import { HecRasGeometryParser } from "../src/HECRASGeometryParser";
import { Coordinate } from "../src/models/common";
import fs from "fs";

it("HECRASGeometry should parse correct headers", () => {
  const parser = new HecRasGeometryParser();

  const geometryString = fs.readFileSync("test/data/Muncie.g01", "utf-8");
  const muncieGeometry = parser.parse(geometryString);

  expect(muncieGeometry).toHaveProperty(
    "Geom Title",
    "Muncie Base Geometry - 9 SAs"
  );
  expect(muncieGeometry).toHaveProperty("Program Version", "5.00");

  expect(muncieGeometry).toHaveProperty("Viewing Rectangle", {
    left: 404112.085287251,
    right: 413818.78591839,
    top: 1806670.07015604,
    bottom: 1799678.66049907,
  });
});

it("HECRASGeometry should parse reaches", () => {
  const parser = new HecRasGeometryParser();
  const geometryString = fs.readFileSync("test/data/Muncie.g01", "utf-8");
  const muncieGeometry = parser.parse(geometryString);

  expect(muncieGeometry).toHaveProperty("reaches");
  expect(Array.isArray(muncieGeometry.reaches)).toBe(true);
  expect(muncieGeometry.reaches.length).toBeGreaterThan(0);
  const firstReach = muncieGeometry.reaches[0];
  expect(firstReach).toHaveProperty("centerline");
  expect(firstReach.centerline[0]).toEqual({
    // Point 1
    x: 413723.622186712,
    y: 1800205.14997914,
  });
  expect(firstReach.centerline[1]).toEqual({
    // Point 2
    x: 413628.76151458,
    y: 1800234.33788318,
  });
  expect(firstReach.centerline[2]).toEqual({
    // Point 5
    x: 413322.288554152,
    y: 1800307.30761129,
  });
  expect(firstReach.centerline[0]).toEqual({
    // Point 6
    x: 413190.943081968,
    y: 1800372.98037938,
  });
  expect(firstReach.centerline.length).toBe(87); // Check that the first reach has 87 points
});
