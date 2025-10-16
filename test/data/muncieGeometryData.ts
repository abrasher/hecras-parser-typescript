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
    { index: 0, point: [413723.622186712, 1800205.14997914] }, // First point
    { index: 1, point: [413628.76151458, 1800234.33788318] }, // Second point
    { index: 2, point: [413533.900842447, 1800248.9318032] }, // Third point
    { index: 3, point: [413402.555306264, 1800278.11970724] }, // Fourth point
    { index: 4, point: [413322.288554152, 1800307.30761129] }, // Fifth point
    { index: 5, point: [413190.943081968, 1800372.98037938] }, // Sixth point
    { index: 86, point: [404398.089373685, 1801686.43567721] }, // Last point
  ],
}
export const expectedFirstCrossSection = {
  riverStation: 15696.24,
  lengthL: 228.66,
  lengthCh: 210.73,
  lengthR: 167.84,
  lastEditedTime: "Jul/13/2007 10:50:07",
  gisCutLine: [
    [413443.23844232, 1799937.56405877],
    [413545.895786464, 1800177.0978191],
    [413561.864682486, 1800361.88105136],
    [413662.240746626, 1800708.63471585],
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
  id: "146",
  centroid: [412647.4244022, 1800849.9601867],
  surfaceLine: [
    [412026.032488341, 1801011.62121227],
    [412066.712552398, 1801026.94985229],
    [412054.700072381, 1801050.26018832],
    [412220.887976613, 1801161.05212448],
    [412248.581352652, 1801233.74716458],
    [412581.886633117, 1801447.92604488],
    [412600.366121143, 1801427.55228485],
    [412607.575977153, 1801418.68809284],
    [412617.984489168, 1801405.75484482],
    [412656.426857221, 1801364.24738876],
    [412685.315049262, 1801330.94038072],
    [412704.564201289, 1801297.92841267],
    [412715.926057304, 1801267.62172463],
    [412724.823721317, 1801230.82223658],
    [412738.086377335, 1801134.73103644],
    [412773.204137384, 1801085.27087637],
    [412781.121513396, 1801000.16303625],
    [412783.143145398, 1800980.82607623],
    [412788.965673406, 1800920.15510014],
    [412791.69175341, 1800890.8753561],
    [412791.888169411, 1800890.6210201],
    [412795.181545415, 1800883.38287609],
    [412817.768681447, 1800789.32719596],
    [412824.461097456, 1800760.27964392],
    [412841.28048948, 1800735.38313188],
    [412846.842921487, 1800710.01103585],
    [412857.773737503, 1800691.50601182],
    [412907.598441572, 1800606.1407637],
    [412954.810665638, 1800525.02889159],
    [412987.492329684, 1800469.40418751],
    [413051.985769774, 1800359.39055536],
    [413080.594089814, 1800310.41852329],
    [413110.873385856, 1800173.3666831],
    [413058.546409783, 1800173.1873551],
    [412993.970473693, 1800339.81161133],
    [412929.550889603, 1800460.9729555],
    [412835.973673472, 1800612.38031571],
    [412730.980969325, 1800695.48085983],
    [412724.909353317, 1800763.69186792],
    [412689.837161268, 1800824.26313201],
    [412590.81175313, 1800861.84822006],
    [412433.46564091, 1800937.15804416],
    [412334.520552772, 1800959.5899802],
    [412200.704168585, 1800959.1357722],
    [412026.186472341, 1800966.12175621],
    [412026.032488341, 1801011.62121227],
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
