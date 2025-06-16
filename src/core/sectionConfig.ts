// Configuration-driven section detection system
import { TokenType } from "./pipeline"

export interface SectionRule {
  name: string
  priority: number
  patterns: SectionPattern[]
  dataExpectations?: DataExpectation[]
  endConditions?: EndCondition[]
}

export interface SectionPattern {
  type: "exact" | "startsWith" | "contains" | "regex" | "keyValue"
  value: string | RegExp
  caseSensitive?: boolean
  metadata?: Record<string, any>
}

export interface DataExpectation {
  type: "coordinates" | "numbers" | "keyValue" | "table" | "multiline"
  lineCount?: number | { min?: number; max?: number }
  valueCount?: number | { min?: number; max?: number }
  format?: string // Additional format constraints
}

export interface EndCondition {
  type: "emptyLine" | "newSection" | "lineCount" | "pattern"
  value?: string | RegExp | number
  allowPartial?: boolean // Whether to accept partial matches
}

export class SectionDetector {
  constructor(private rules: SectionRule[]) {
    // Sort rules by priority (highest first)
    this.rules.sort((a, b) => b.priority - a.priority)
  }

  detectSection(
    line: string,
    context: DetectionContext = {},
  ): SectionMatch | null {
    for (const rule of this.rules) {
      const match = this.testRule(rule, line, context)
      if (match) {
        return {
          rule,
          confidence: match.confidence,
          metadata: match.metadata,
        }
      }
    }
    return null
  }

  private testRule(
    rule: SectionRule,
    line: string,
    context: DetectionContext,
  ): { confidence: number; metadata: Record<string, any> } | null {
    let totalConfidence = 0
    let matchCount = 0
    const metadata: Record<string, any> = {}

    for (const pattern of rule.patterns) {
      const patternMatch = this.testPattern(pattern, line)
      if (patternMatch) {
        totalConfidence += patternMatch.confidence
        matchCount++
        Object.assign(metadata, patternMatch.metadata)
      }
    }

    if (matchCount === 0) return null

    // Calculate average confidence
    const confidence = totalConfidence / matchCount

    // Boost confidence if multiple patterns match
    const boostedConfidence = Math.min(1.0, confidence + (matchCount - 1) * 0.1)

    return {
      confidence: boostedConfidence,
      metadata,
    }
  }

  private testPattern(
    pattern: SectionPattern,
    line: string,
  ): { confidence: number; metadata: Record<string, any> } | null {
    const testLine = pattern.caseSensitive ? line : line.toLowerCase()
    const metadata = pattern.metadata || {}

    switch (pattern.type) {
      case "exact":
        const exactValue = pattern.caseSensitive
          ? (pattern.value as string)
          : (pattern.value as string).toLowerCase()
        return testLine.trim() === exactValue
          ? { confidence: 1.0, metadata }
          : null

      case "startsWith":
        const startsValue = pattern.caseSensitive
          ? (pattern.value as string)
          : (pattern.value as string).toLowerCase()
        return testLine.trim().startsWith(startsValue)
          ? { confidence: 0.9, metadata }
          : null

      case "contains":
        const containsValue = pattern.caseSensitive
          ? (pattern.value as string)
          : (pattern.value as string).toLowerCase()
        return testLine.includes(containsValue)
          ? { confidence: 0.8, metadata }
          : null

      case "regex":
        const regexMatch = (pattern.value as RegExp).exec(line)
        if (regexMatch) {
          // Add regex groups to metadata
          metadata.regexGroups = regexMatch.slice(1)
          return { confidence: 0.9, metadata }
        }
        return null

      case "keyValue":
        const kvMatch = line.match(/^([^=:]+)[=:](.*)$/)
        if (kvMatch) {
          const key = kvMatch[1].trim()
          const value = kvMatch[2].trim()
          const expectedKey = pattern.caseSensitive
            ? (pattern.value as string)
            : (pattern.value as string).toLowerCase()
          const actualKey = pattern.caseSensitive ? key : key.toLowerCase()

          if (actualKey === expectedKey || actualKey.includes(expectedKey)) {
            metadata.key = key
            metadata.value = value
            return { confidence: 0.95, metadata }
          }
        }
        return null

      default:
        return null
    }
  }
}

export interface DetectionContext {
  previousSections?: string[]
  lineNumber?: number
  totalLines?: number
  metadata?: Record<string, any>
}

export interface SectionMatch {
  rule: SectionRule
  confidence: number
  metadata: Record<string, any>
}

// Pre-defined configurations for common HECRAS file types
export class HECRASConfigurations {
  static getGeometryConfig(): SectionRule[] {
    return [
      {
        name: "file_header",
        priority: 100,
        patterns: [
          { type: "keyValue", value: "Geom Title" },
          { type: "keyValue", value: "Program Version" },
          { type: "keyValue", value: "Viewing Rectangle" },
        ],
      },
      {
        name: "geometry_description",
        priority: 90,
        patterns: [{ type: "exact", value: "BEGIN GEOM DESCRIPTION:" }],
        endConditions: [{ type: "pattern", value: /^END GEOM DESCRIPTION:/ }],
      },
      {
        name: "river_reach",
        priority: 85,
        patterns: [{ type: "keyValue", value: "River Reach" }],
        dataExpectations: [
          { type: "keyValue", lineCount: { min: 1, max: 20 } },
        ],
      },
      {
        name: "cross_section",
        priority: 80,
        patterns: [{ type: "keyValue", value: "Type RM Length L Ch R" }],
        dataExpectations: [
          { type: "coordinates", lineCount: { min: 1, max: 100 } },
          { type: "numbers", lineCount: { min: 1, max: 50 } },
        ],
      },
      {
        name: "storage_area",
        priority: 75,
        patterns: [{ type: "keyValue", value: "Storage Area" }],
        dataExpectations: [
          { type: "coordinates", lineCount: { min: 1, max: 200 } },
          { type: "keyValue", lineCount: { min: 5, max: 50 } },
        ],
      },
      {
        name: "connection",
        priority: 70,
        patterns: [{ type: "keyValue", value: "Connection" }],
        dataExpectations: [
          { type: "keyValue", lineCount: { min: 10, max: 200 } },
          { type: "coordinates", lineCount: { min: 1, max: 50 } },
          { type: "table", lineCount: { min: 0, max: 100 } },
        ],
      },
      {
        name: "boundary_condition",
        priority: 65,
        patterns: [{ type: "keyValue", value: "BC Line Name" }],
        dataExpectations: [
          { type: "keyValue", lineCount: { min: 3, max: 10 } },
          { type: "coordinates", lineCount: { min: 1, max: 20 } },
        ],
      },
      {
        name: "manning_data",
        priority: 60,
        patterns: [
          { type: "contains", value: "Mann" },
          { type: "contains", value: "manning" },
        ],
        dataExpectations: [{ type: "numbers", lineCount: { min: 1, max: 10 } }],
      },
      {
        name: "gis_info",
        priority: 55,
        patterns: [
          { type: "keyValue", value: "Geom Raster" },
          { type: "contains", value: "GIS" },
        ],
      },
      {
        name: "coordinate_data",
        priority: 50,
        patterns: [{ type: "regex", value: /^\s*[\d\.\-\s]+$/ }],
        dataExpectations: [
          { type: "coordinates", lineCount: { min: 1, max: 1000 } },
        ],
      },
      {
        name: "culvert_data",
        priority: 45,
        patterns: [
          { type: "contains", value: "Culv" },
          { type: "contains", value: "Connection Culv" },
        ],
        dataExpectations: [
          { type: "keyValue", lineCount: { min: 2, max: 20 } },
        ],
      },
      {
        name: "bridge_data",
        priority: 40,
        patterns: [
          { type: "contains", value: "BR:" },
          { type: "contains", value: "Bridge" },
        ],
        dataExpectations: [
          { type: "table", lineCount: { min: 1, max: 50 } },
          { type: "keyValue", lineCount: { min: 1, max: 20 } },
        ],
      },
    ]
  }

  static getFlowConfig(): SectionRule[] {
    return [
      {
        name: "flow_title",
        priority: 100,
        patterns: [{ type: "keyValue", value: "Flow Title" }],
      },
      {
        name: "flow_data",
        priority: 80,
        patterns: [
          { type: "keyValue", value: "River Rch & RM" },
          { type: "keyValue", value: "Boundary Location" },
        ],
      },
      // Add more flow-specific sections
    ]
  }

  static getPlanConfig(): SectionRule[] {
    return [
      {
        name: "plan_title",
        priority: 100,
        patterns: [{ type: "keyValue", value: "Plan Title" }],
      },
      // Add more plan-specific sections
    ]
  }

  static getUnsteadyConfig(): SectionRule[] {
    return [
      {
        name: "unsteady_title",
        priority: 100,
        patterns: [{ type: "keyValue", value: "Unsteady Title" }],
      },
      // Add more unsteady-specific sections
    ]
  }
}

// Factory for creating section detectors
export class SectionDetectorFactory {
  private static configs = new Map<string, SectionRule[]>()

  static {
    // Register built-in configurations
    this.configs.set("geometry", HECRASConfigurations.getGeometryConfig())
    this.configs.set("flow", HECRASConfigurations.getFlowConfig())
    this.configs.set("plan", HECRASConfigurations.getPlanConfig())
    this.configs.set("unsteady", HECRASConfigurations.getUnsteadyConfig())
  }

  static register(fileType: string, config: SectionRule[]): void {
    this.configs.set(fileType, config)
  }

  static create(fileType: string): SectionDetector | null {
    const config = this.configs.get(fileType)
    return config ? new SectionDetector(config) : null
  }

  static createCustom(rules: SectionRule[]): SectionDetector {
    return new SectionDetector(rules)
  }

  static getAvailableTypes(): string[] {
    return Array.from(this.configs.keys())
  }
}
