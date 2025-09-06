import type { JunctionProperties } from "../../models/geometry/junction"

export function serializeJunction(junction: JunctionProperties): string[] {
  const lines: string[] = []

  // Junction name line - with exact spacing (16 characters padded)
  const nameFormatted = junction.name.padEnd(16)
  lines.push(`Junct Name=${nameFormatted}`)

  // Junction description
  lines.push(`Junct Desc=${junction.description}`)

  // Coordinates line
  const [px, py] = junction.coordinates.position
  const [tx, ty] = junction.coordinates.textPosition
  const coordLine = `Junct X Y & Text X Y=${px},${py},${tx},${ty}`
  lines.push(coordLine)

  // Upstream connections - with exact spacing
  for (const upstream of junction.upstreamConnections) {
    const riverFormatted = upstream.river.padEnd(16)
    lines.push(`Up River,Reach=${riverFormatted},${upstream.reach}`)
  }

  // Downstream connection - with exact spacing
  const downstreamRiverFormatted = junction.downstreamConnection.river.padEnd(16)
  lines.push(`Dn River,Reach=${downstreamRiverFormatted},${junction.downstreamConnection.reach}`)

  // Length and area pairs
  for (const lengthArea of junction.lengthAndAreas) {
    lines.push(`Junc L&A=${lengthArea.length},${lengthArea.area}`)
  }

  return lines
}
