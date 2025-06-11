import { HECRASGeometry } from "../../src/models/geometry"
import { ManningSegment } from "../../src/models/common"
import { StorageArea } from "../../src/models/storageArea"

export const expectedHeaders = {
  "Geom Title": "Muncie Base Geometry - 9 SAs",
  "Program Version": "5.00",
  "Viewing Rectangle": {
    left: 404112.085287251,
    right: 413818.78591839,
    top: 1806670.07015604,
    bottom: 1799678.66049907,
  },
}

// Key points from the first reach that we want to verify
export const expectedFirstReachPoints = {
  totalPoints: 87,
  keyPoints: [
    { index: 0, point: { x: 413723.622186712, y: 1800205.14997914 } }, // First point
    { index: 1, point: { x: 413628.76151458, y: 1800234.33788318 } }, // Second point
    { index: 2, point: { x: 413533.900842447, y: 1800248.9318032 } }, // Third point
    { index: 3, point: { x: 413402.555306264, y: 1800278.11970724 } }, // Fourth point
    { index: 4, point: { x: 413322.288554152, y: 1800307.30761129 } }, // Fifth point
    { index: 5, point: { x: 413190.943081968, y: 1800372.98037938 } }, // Sixth point
    { index: 86, point: { x: 404398.089373685, y: 1801686.43567721 } }, // Last point
  ],
}

export const expectedFirstCrossSection = {
  riverStation: 15696.24,
  lengthL: 228.66,
  lengthCh: 210.73,
  lengthR: 167.84,
  lastEditedTime: "Jul/13/2007 10:50:07",
  gisCutLine: [
    { x: 413443.23844232, y: 1799937.56405877 },
    { x: 413545.895786464, y: 1800177.0978191 },
    { x: 413561.864682486, y: 1800361.88105136 },
    { x: 413662.240746626, y: 1800708.63471585 },
  ],
  // Key station/elevation points we want to verify
  staElevData: {
    totalPoints: 134,
    keyPoints: [
      { index: 0, point: { station: 0, elevation: 963.04 } }, // First point
      { index: 1, point: { station: 27.2, elevation: 963.04 } }, // Second point
      { index: 2, point: { station: 32.64, elevation: 963.02 } }, // Third point
      { index: 3, point: { station: 38.08, elevation: 962.85 } }, // Fourth point
      { index: 10, point: { station: 81.6, elevation: 961.29 } }, // Middle point
      { index: 20, point: { station: 168.63, elevation: 951.83 } }, // Another middle point
      { index: 133, point: { station: 807.07, elevation: 958.77 } }, // Last point
    ],
  },
  manningSegments: [
    { station: 0, nValue: 0.07, unknownParameter: 0 },
    { station: 250.23, nValue: 0.04, unknownParameter: 0 },
    { station: 401.13, nValue: 0.07, unknownParameter: 0 },
  ],
  bankStations: {
    left: 250.23,
    right: 401.13,
  },
  expansionCoefficient: 0.3,
  contractionCoefficient: 0.1,
}

export const expectedFirstStorageArea = {
  id: 146,
  centroid: { x: 412647.4244022, y: 1800849.9601867 },
  surfaceLine: [
    {
      x: 412026.032488341,
      y: 1801011.62121227,
    },
    {
      x: 412066.712552398,
      y: 1801026.94985229,
    },
    {
      x: 412054.700072381,
      y: 1801050.26018832,
    },
    {
      x: 412220.887976613,
      y: 1801161.05212448,
    },
    {
      x: 412248.581352652,
      y: 1801233.74716458,
    },
    {
      x: 412581.886633117,
      y: 1801447.92604488,
    },
    {
      x: 412600.366121143,
      y: 1801427.55228485,
    },
    {
      x: 412607.575977153,
      y: 1801418.68809284,
    },
    {
      x: 412617.984489168,
      y: 1801405.75484482,
    },
    {
      x: 412656.426857221,
      y: 1801364.24738876,
    },
    {
      x: 412685.315049262,
      y: 1801330.94038072,
    },
    {
      x: 412704.564201289,
      y: 1801297.92841267,
    },
    {
      x: 412715.926057304,
      y: 1801267.62172463,
    },
    {
      x: 412724.823721317,
      y: 1801230.82223658,
    },
    {
      x: 412738.086377335,
      y: 1801134.73103644,
    },
    {
      x: 412773.204137384,
      y: 1801085.27087637,
    },
    {
      x: 412781.121513396,
      y: 1801000.16303625,
    },
    {
      x: 412783.143145398,
      y: 1800980.82607623,
    },
    {
      x: 412788.965673406,
      y: 1800920.15510014,
    },
    {
      x: 412791.69175341,
      y: 1800890.8753561,
    },
    {
      x: 412791.888169411,
      y: 1800890.6210201,
    },
    {
      x: 412795.181545415,
      y: 1800883.38287609,
    },
    {
      x: 412817.768681447,
      y: 1800789.32719596,
    },
    {
      x: 412824.461097456,
      y: 1800760.27964392,
    },
    {
      x: 412841.28048948,
      y: 1800735.38313188,
    },
    {
      x: 412846.842921487,
      y: 1800710.01103585,
    },
    {
      x: 412857.773737503,
      y: 1800691.50601182,
    },
    {
      x: 412907.598441572,
      y: 1800606.1407637,
    },
    {
      x: 412954.810665638,
      y: 1800525.02889159,
    },
    {
      x: 412987.492329684,
      y: 1800469.40418751,
    },
    {
      x: 413051.985769774,
      y: 1800359.39055536,
    },
    {
      x: 413080.594089814,
      y: 1800310.41852329,
    },
    {
      x: 413110.873385856,
      y: 1800173.3666831,
    },
    {
      x: 413058.546409783,
      y: 1800173.1873551,
    },
    {
      x: 412993.970473693,
      y: 1800339.81161133,
    },
    {
      x: 412929.550889603,
      y: 1800460.9729555,
    },
    {
      x: 412835.973673472,
      y: 1800612.38031571,
    },
    {
      x: 412730.980969325,
      y: 1800695.48085983,
    },
    {
      x: 412724.909353317,
      y: 1800763.69186792,
    },
    {
      x: 412689.837161268,
      y: 1800824.26313201,
    },
    {
      x: 412590.81175313,
      y: 1800861.84822006,
    },
    {
      x: 412433.46564091,
      y: 1800937.15804416,
    },
    {
      x: 412334.520552772,
      y: 1800959.5899802,
    },
    {
      x: 412200.704168585,
      y: 1800959.1357722,
    },
    {
      x: 412026.186472341,
      y: 1800966.12175621,
    },
    {
      x: 412026.032488341,
      y: 1801011.62121227,
    },
  ],
  volumeElevationData: [
    { elevation: 941.723, volume: 0 },
    { elevation: 943.551, volume: 0.15 },
    { elevation: 945.378, volume: 1.93 },
    { elevation: 947.206, volume: 7.49 },
    { elevation: 949.034, volume: 15.88 },
    { elevation: 950.861, volume: 25.44 },
    { elevation: 952.689, volume: 36.51 },
    { elevation: 954.517, volume: 48.43 },
    { elevation: 956.345, volume: 61.05 },
    { elevation: 958.172, volume: 74.07 },
    { elevation: 960, volume: 87.21 },
  ],
  type: 1,
  area: null,
  minElevation: null,
  is2D: 0,
  mannings: 0.06,
}

export const culvert43Connection = {
  id: "Culv_43",
  description: "Culvert 43",
}
