// Validation stage for parsed HECRAS data
import type {
  PipelineStage,
  ParseContext,
  ParseResult,
  ParseError,
  ParseWarning,
} from "./pipeline"

export interface ValidationRule<T> {
  name: string
  severity: "error" | "warning" | "info"
  validate(data: T, context: ParseContext): ValidationResult
}

export interface ValidationResult {
  valid: boolean
  message?: string
  code?: string
  line?: number
  column?: number
}

export interface ValidationSchema<T> {
  rules: ValidationRule<T>[]
  allowPartialValidation?: boolean
}

export class DataValidator<T> implements PipelineStage<T, T> {
  name = "Data_Validator"

  constructor(private schema: ValidationSchema<T>) {}

  async process(input: T, context: ParseContext): Promise<ParseResult<T>> {
    const errors: ParseError[] = []
    const warnings: ParseWarning[] = []
    let hasErrors = false

    for (const rule of this.schema.rules) {
      try {
        const result = rule.validate(input, context)

        if (!result.valid) {
          const issue = {
            message:
              result.message || `Validation failed for rule: ${rule.name}`,
            line: result.line,
            column: result.column,
            code: result.code || rule.name,
          }

          if (rule.severity === "error") {
            errors.push({ ...issue, severity: "error" })
            hasErrors = true
          } else if (rule.severity === "warning") {
            warnings.push(issue)
          }
        }
      } catch (error) {
        errors.push({
          message: `Validation rule "${rule.name}" threw an error: ${error instanceof Error ? error.message : String(error)}`,
          severity: "error",
          code: "VALIDATION_RULE_ERROR",
        })
        hasErrors = true
      }
    }

    const success = !hasErrors || (this.schema.allowPartialValidation ?? false)

    return {
      success,
      data: success ? input : undefined,
      errors,
      warnings,
    }
  }
}

// Common validation rules for HECRAS data
export class CommonValidationRules {
  static required<T>(
    fieldName: string,
    getter: (data: T) => any,
  ): ValidationRule<T> {
    return {
      name: `required_${fieldName}`,
      severity: "error",
      validate: (data: T) => {
        const value = getter(data)
        return {
          valid: value !== null && value !== undefined && value !== "",
          message: `Required field "${fieldName}" is missing or empty`,
        }
      },
    }
  }

  static positiveNumber<T>(
    fieldName: string,
    getter: (data: T) => number | null | undefined,
  ): ValidationRule<T> {
    return {
      name: `positive_${fieldName}`,
      severity: "error",
      validate: (data: T) => {
        const value = getter(data)
        if (value === null || value === undefined) return { valid: true } // Let required rule handle this

        return {
          valid: typeof value === "number" && value > 0,
          message: `Field "${fieldName}" must be a positive number, got: ${value}`,
        }
      },
    }
  }

  static validCoordinates<T>(
    fieldName: string,
    getter: (data: T) => Array<{ x: number; y: number }> | null | undefined,
  ): ValidationRule<T> {
    return {
      name: `valid_coordinates_${fieldName}`,
      severity: "error",
      validate: (data: T) => {
        const coords = getter(data)
        if (!coords) return { valid: true }

        for (let i = 0; i < coords.length; i++) {
          const coord = coords[i]
          if (
            typeof coord.x !== "number" ||
            typeof coord.y !== "number" ||
            isNaN(coord.x) ||
            isNaN(coord.y)
          ) {
            return {
              valid: false,
              message: `Invalid coordinate at index ${i} in "${fieldName}": x=${coord.x}, y=${coord.y}`,
            }
          }
        }

        return { valid: true }
      },
    }
  }

  static arrayLength<T>(
    fieldName: string,
    getter: (data: T) => any[] | null | undefined,
    min?: number,
    max?: number,
  ): ValidationRule<T> {
    return {
      name: `array_length_${fieldName}`,
      severity: "warning",
      validate: (data: T) => {
        const array = getter(data)
        if (!array) return { valid: true }

        const length = array.length

        if (min !== undefined && length < min) {
          return {
            valid: false,
            message: `Array "${fieldName}" has ${length} items, minimum required: ${min}`,
          }
        }

        if (max !== undefined && length > max) {
          return {
            valid: false,
            message: `Array "${fieldName}" has ${length} items, maximum allowed: ${max}`,
          }
        }

        return { valid: true }
      },
    }
  }

  static enumValue<T>(
    fieldName: string,
    getter: (data: T) => any,
    validValues: any[],
  ): ValidationRule<T> {
    return {
      name: `enum_${fieldName}`,
      severity: "error",
      validate: (data: T) => {
        const value = getter(data)
        if (value === null || value === undefined) return { valid: true }

        return {
          valid: validValues.includes(value),
          message: `Field "${fieldName}" has invalid value "${value}". Valid values: ${validValues.join(", ")}`,
        }
      },
    }
  }

  static customRule<T>(
    name: string,
    severity: "error" | "warning" | "info",
    validator: (data: T) => boolean | string,
  ): ValidationRule<T> {
    return {
      name,
      severity,
      validate: (data: T) => {
        const result = validator(data)

        if (typeof result === "boolean") {
          return { valid: result }
        }

        return {
          valid: false,
          message: result,
        }
      },
    }
  }
}
