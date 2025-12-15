import {
  contextual,
  fields,
  multiField,
  numberField,
  numberPart,
  schema,
  stringField,
  stringPart,
} from "../../schema"

export const dredgeEventSchema = schema([
  stringField("year", "Dredge Event=", { trim: true }),
  numberField("dredgeEventMethod", "Dredge Event Method=", { integer: true, pad: true }),
  numberField("dredgeTrigger", "Dredge Trigger=", { integer: true, pad: true }),
  stringField("dredgeEventDate", "Dredge Event Date=", { trim: true }),
  stringField("dredgeEventEndDate", "Dredge Event End Date=", { trim: true }),
  numberField("dredgeFateFlag", "Dredge Fate Flag=", { integer: true, pad: true }),
  numberField("dredgeFatePercentage", "Dredge Fate Percentage=", { nullOnBlank: true }),
  numberField("dredgeFateThreshold", "Dredge Fate Threshold=", { integer: true, pad: true }),
  stringField("dredgeFateLocation", "Dredge Fate Location=", { trim: false }),

  // Dredge River Reach and RS entries (contextual - complex nested repeating structure)
  contextual(
    "dredgeReaches",
    (lines, i) => {
      const reaches: Array<{
        river: string
        reach: string
        stations: Array<{ rs: string; value1: string; value2: string; value3: string }>
      }> = []

      while (i < lines.length) {
        const line = lines[i]

        // Stop at next major section
        if (!line.startsWith("Dredge River Reach=") && !line.startsWith("Dredge RS=")) {
          break
        }

        // Parse river reach
        if (line.startsWith("Dredge River Reach=")) {
          const content = line.slice("Dredge River Reach=".length)
          const parts = content.split(",")
          const river = parts[0]?.trim() || ""
          const reach = parts[1]?.trim() || ""

          const currentReach = {
            river,
            reach,
            stations: [] as Array<{ rs: string; value1: string; value2: string; value3: string }>,
          }

          i++

          // Parse following Dredge RS entries
          while (i < lines.length && lines[i].startsWith("Dredge RS=")) {
            const rsLine = lines[i]
            const rsContent = rsLine.slice("Dredge RS=".length)
            const rsParts = rsContent.split(",")

            currentReach.stations.push({
              rs: rsParts[0]?.trim() || "",
              value1: rsParts[1]?.trim() || "",
              value2: rsParts[2]?.trim() || "",
              value3: rsParts[3]?.trim() || "",
            })

            i++
          }

          reaches.push(currentReach)
        } else {
          i++
        }
      }

      if (reaches.length === 0) {
        return null
      }

      return {
        value: reaches,
        nextIndex: i,
      }
    },
    (value) => {
      if (!value || value.length === 0) {
        return []
      }

      const lines: string[] = []
      for (const reach of value) {
        lines.push(`Dredge River Reach=${reach.river},${reach.reach}`)
        for (const station of reach.stations) {
          lines.push(`Dredge RS=${station.rs},${station.value1},${station.value2},${station.value3}`)
        }
      }
      return lines
    },
  ),
])
