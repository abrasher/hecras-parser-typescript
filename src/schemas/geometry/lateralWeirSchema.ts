import {
  schema,
  fields,
  multiField,
  numberField,
  countedArrayLengthPart,
  countedFixedWidthArray,
  numberPart,
  stringPart,
  booleanPart,
  type Infer,
  booleanField,
  stringField,
  blankLine,
  startsWith,
  repeat,
  contextual,
} from "../../schema"
import {
  parseBoolean,
  parseCommaSeparated,
  parseMaybeFloat,
  parseMaybeInt,
  parseMultilineArray,
} from "../../schema/parsingUtils"
import {
  formatCommaSeparated,
  formatChunkedLines,
  formatFixedWidth,
  formatBoolean,
} from "../../schema/serializationUtils"

const typePart = numberPart({ integer: true, pad: true })

const gateHeader =
  "LW Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings"
const gateOpeningPrefix = "LW Gate Opening="

export const lateralWeirSchema = schema([
  multiField(
    "Type RM Length L Ch R =",
    fields({
      type: typePart,
      riverMile: stringPart({ trim: true, width: 8 }),
      lengthLeft: numberPart({ nullOnBlank: true }),
      lengthChannel: numberPart({ nullOnBlank: true }),
      lengthRight: numberPart({ nullOnBlank: true }),
    }),
  ),
  stringField("lastEditedTime", "Node Last Edited Time=", { optional: true, trim: true }),
  numberField("position", "Lateral Weir Pos=", { integer: true, pad: true }),
  multiField(
    "Lateral Weir End=",
    fields({
      endRiver: stringPart({ trim: true, width: 16 }),
      endReach: stringPart({ trim: true, width: 16 }),
      endCrossSection: stringPart({ trim: true, width: 8 }),
      endStation: stringPart({ trim: true, width: 16 }),
    }),
  ),
  numberField("distance", "Lateral Weir Distance="),
  numberField("tailwaterMultipleCrossSections", "Lateral Weir TW Multiple XS=", {
    integer: true,
  }),
  numberField("weirWidth", "Lateral Weir WD="),
  numberField("weirCoefficient", "Lateral Weir Coef="),
  booleanField("isSharp", "Lateral Weir Is Sharp=", {
    mode: "-1,0",
    pad: true,
    optional: true,
  }),
  booleanField("overflow2DMethod", "LW OverFlow Method 2D=", {
    mode: "-1,0",
    pad: false,
    optional: true,
  }),
  booleanField("overflowUseVelocityInto2D", "LW OverFlow Use Velocity Into 2D=", {
    mode: "-1,0",
    pad: false,
    optional: true,
  }),
  booleanField("wsCriteria", "Lateral Weir WSCriteria=", { mode: "-1,0", pad: true }),
  numberField("flapGateCount", "Lateral Weir Flap Gates=", { integer: true, pad: true }),
  multiField(
    "Lateral Weir Hagers EQN=",
    fields({
      hagersEquation: numberPart({ integer: true, pad: true }),
      hagersCoefficient1: numberPart({ nullOnBlank: true }),
      hagersCoefficient2: numberPart({ nullOnBlank: true }),
      hagersCoefficient3: numberPart({ nullOnBlank: true }),
      hagersCoefficient4: numberPart({ nullOnBlank: true }),
      hagersCoefficient5: numberPart({ nullOnBlank: true }),
    }),
  ),
  multiField(
    "Lateral Weir SS=",
    fields({
      sideSlopeUpstream: numberPart(),
      sideSlopeDownstream: numberPart(),
      sideSlopeAdditional: numberPart({ nullOnBlank: true }),
    }),
  ),
  numberField("lateralWeirType", "Lateral Weir Type=", { integer: true, pad: true }),
  multiField(
    "Lateral Weir Connection Pos and Dist=",
    fields({
      connectionPosition: numberPart({ integer: true, pad: true }),
      connectionDistance: numberPart({ nullOnBlank: true }),
    }),
  ),
  multiField(
    "Lateral Weir SE=",
    fields({
      stageElevationCount: countedArrayLengthPart("stageElevationPairs", { pad: true }),
    }),
  ),
  countedFixedWidthArray("stageElevationPairs", {
    width: 8,
    maxWidth: 80,
    tuple: 2 as const,
    pad: true,
    formatter: "station",
  }),
  numberField("centerlineOption", "Lateral Weir Centerline=", { integer: true, pad: true }),

  repeat(
    "headwaterConnections",
    startsWith("Lateral Weir HW RS Station="),
    schema([
      multiField(
        "Lateral Weir HW RS Station=",
        fields({
          station: stringPart({ width: 8, trim: true }),
          elevation: stringPart(),
        }),
      ),
    ]),
  ),
  repeat(
    "tailwaterConnections",
    startsWith("Lateral Weir TW RS Station="),
    schema([
      multiField(
        "Lateral Weir TW RS Station=",
        fields({
          station: stringPart(),
          elevation: stringPart(),
        }),
      ),
    ]),
  ),

  contextual(
    "gate",
    (lines, startIndex) => {
      if (lines[startIndex] !== gateHeader) {
        return null
      }

      const gateLine = lines[startIndex + 1]
      if (gateLine === undefined) {
        throw new Error("Expected gate definition line after gate header")
      }

      const segments = parseCommaSeparated(gateLine)

      const [
        gateName,
        widthSegment,
        heightSegment,
        invertSegment,
        gCoefSegment,
        expTSegment,
        expOSegment,
        expHSegment,
        typeSegment,
        wCoefSegment,
        isOgeeSegment,
        spillwayHeightSegment,
        designHeadSegment,
        numberOfOpeningsSegment,
        unknown1Segment,
        unknown2Segment,
        unknown3Segment,
        unknown4Segment,
        unknown5Segment,
        unknown6Segment,
        unknown7Segment,
        unknown8Segment,
        unknown9Segment,
      ] = segments
      //gateName,width,height,invert,gateCoefficient,expT,expO,expH,type,wCoeff,isOgee,spillwayHeight,designHead, 12 ,unknown1,unknown2,unknown3,unknown4,unknown5,unknown6,unknown7,unknown8,unknown9

      const toBoolean = (segment: string) => {
        const value = segment.trim().toLowerCase()
        return value === "-1" || value === "1" || value === "true"
      }

      const numberOfOpenings = parseMaybeInt(numberOfOpeningsSegment) ?? 0

      const gatePositions: number[] = []
      let index = startIndex + 2

      if (numberOfOpenings > 0) {
        const { data, nextIndex } = parseMultilineArray({
          lines,
          width: 8,
          maxWidth: 80,
          numOfEntries: numberOfOpenings,
          currentIndex: index,
        })

        for (let i = 0; i < data.length; i++) {
          const parsed = parseMaybeFloat(data[i])
          if (parsed === null) {
            throw new Error(`Missing gate position at index ${i}`)
          }
          gatePositions.push(parsed)
        }

        index = nextIndex
      }

      const gateOpenings = []
      for (let i = 0; i < numberOfOpenings; i++) {
        const openingLine = lines[index + i]
        if (!openingLine?.startsWith(gateOpeningPrefix)) {
          throw new Error(`Expected gate opening line at index ${index + i} for opening ${i + 1}`)
        }
        const openingSegments = parseCommaSeparated(openingLine.slice(gateOpeningPrefix.length))
        const [idSegment, nameSegment = "", flagSegment = "0"] = openingSegments
        const openingId = parseMaybeInt(idSegment) ?? i + 1
        const gateFlag = toBoolean(flagSegment)
        gateOpenings.push({
          id: openingId,
          name: nameSegment,
          gateFlag,
        })
      }
      index += numberOfOpenings

      const gateValue = {
        gateName,
        width: parseMaybeFloat(widthSegment),
        height: parseMaybeFloat(heightSegment),
        invert: parseMaybeFloat(invertSegment),
        gCoef: parseMaybeFloat(gCoefSegment),
        expT: parseMaybeFloat(expTSegment),
        expO: parseMaybeFloat(expOSegment),
        expH: parseMaybeFloat(expHSegment),
        type: parseMaybeInt(typeSegment),
        wCoef: parseMaybeFloat(wCoefSegment),
        isOgee: parseBoolean(isOgeeSegment),
        spillwayHeight: parseMaybeFloat(spillwayHeightSegment),
        designHead: parseMaybeFloat(designHeadSegment),
        unknown1: parseMaybeFloat(unknown1Segment),
        unknown2: parseMaybeFloat(unknown2Segment),
        unknown3: parseBoolean(unknown3Segment),
        unknown4: parseMaybeFloat(unknown4Segment),
        unknown5: parseMaybeFloat(unknown5Segment),
        unknown6: parseMaybeFloat(unknown6Segment),
        unknown7: parseMaybeFloat(unknown7Segment),
        unknown8: parseMaybeFloat(unknown8Segment),
        unknown9: parseBoolean(unknown9Segment),
        gatePositions,
        gateOpenings,
      }

      return {
        value: gateValue,
        nextIndex: index,
      }
    },
    (gate) => {
      if (!gate) {
        return []
      }

      const baseSegments = [
        formatFixedWidth(gate.gateName, 12, { padDirection: "end" }),
        gate.width?.toString() ?? "",
        gate.height?.toString() ?? "",
        gate.invert?.toString() ?? "",
        gate.gCoef?.toString() ?? "",
        gate.expT?.toString() ?? "",
        gate.expO?.toString() ?? "",
        gate.expH?.toString() ?? "",
        ` ${gate.type?.toString() ?? ""} `,
        gate.wCoef?.toString() ?? "",
        formatBoolean(gate.isOgee, "-1,0", true),
        gate.spillwayHeight?.toString() ?? "",
        gate.designHead?.toString() ?? "",
        ` ${gate.gateOpenings?.length?.toString() ?? ""} `,
        gate.unknown1?.toString() ?? "",
        gate.unknown2?.toString() ?? "",
        formatBoolean(gate.unknown3, "-1,0", true),
        gate.unknown4?.toString() ?? "",
        gate.unknown5?.toString() ?? "",
        gate.unknown6?.toString() ?? "",
        gate.unknown7?.toString() ?? "",
        gate.unknown8?.toString() ?? "",
        formatBoolean(gate.unknown9, "-1,0", true),
      ]

      const lines: string[] = [gateHeader, formatCommaSeparated([...baseSegments])]

      if (gate.gatePositions.length > 0) {
        const formatPosition = (value: number) => {
          if (!Number.isFinite(value)) {
            throw new Error("Cannot serialize non-finite gate position")
          }
          const text = value.toString()
          return text.length >= 8 ? text.slice(0, 8) : text.padStart(8, " ")
        }
        lines.push(
          ...formatChunkedLines(gate.gatePositions, {
            width: 8,
            perLine: 10,
            formatter: formatPosition,
          }),
        )
      }

      const openings = (gate.gateOpenings ?? []) as Array<{
        id: number
        name: string
        gateFlag: boolean
      }>

      openings.forEach((opening) => {
        lines.push(
          `${gateOpeningPrefix}${opening.id},${opening.name},${formatBoolean(opening.gateFlag, "-1,0", false)}`,
        )
      })

      return lines
    },
  ),
  multiField(
    "LW Div RC=",
    fields({
      ratingCurveId: numberPart({ integer: true, pad: true }),
      useRatingCurve: booleanPart({ mode: "trueFalse" }),
      ratingCurveLabel: stringPart({ trim: true }),
      ratingCurveUnknown: stringPart({ trim: true }),
    }),
  ),
  blankLine(),
])

export type LateralWeirSchema = Infer<typeof lateralWeirSchema>
