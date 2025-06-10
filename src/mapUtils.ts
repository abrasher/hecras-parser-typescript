// mapUtils.ts
import proj4 from "proj4"

// Define NAD 1983 State Plane Indiana East FIPS 1301 Feet projection from projection.prj
const indianaEast =
  "+proj=tmerc +lat_0=37.5 +lon_0=-85.6666666666667 +k=0.999966667 +x_0=99999.9998983998 +y_0=249999.9998984 +datum=NAD83 +units=us-ft +no_defs +type=crs"
const wgs84 = "+proj=longlat +datum=WGS84 +no_defs +type=crs"

// Configure proj4 with the projection
proj4.defs("EPSG:2965", indianaEast) // EPSG code for Indiana East State Plane
proj4.defs("EPSG:4326", wgs84)

export interface LatLng {
  lat: number
  lng: number
}

export function statePlaneToLatLng(x: number, y: number): LatLng {
  const [lng, lat] = proj4("EPSG:2965", "EPSG:4326", [x, y])
  return { lat, lng }
}

export function coordinateArrayToLatLng(
  coords: { x: number; y: number }[],
): LatLng[] {
  return coords.map((coord) => statePlaneToLatLng(coord.x, coord.y))
}
