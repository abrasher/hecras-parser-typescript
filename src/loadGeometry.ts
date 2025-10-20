import { parseGeometry } from "./parseGeometry"
import { HECRASGeometry } from "./HECRASGeometry"

export type GeometrySource = string | File

/**
 * Load and parse a HEC-RAS geometry file from various sources
 * @param source Can be:
 *   - File path (Node.js): string starting with '/' or './' or '../'
 *   - File object (browser): File object from input[type="file"]
 *   - Raw content: string content of the geometry file
 * @returns Promise<HECRASGeometry> - Enhanced geometry object with built-in methods
 */
export async function loadGeometry(source: GeometrySource): Promise<HECRASGeometry> {
  let content: string

  if (typeof source === "string") {
    // Check if it looks like a file path (starts with /, ./, ../, contains path separators, or has file extension)
    if (
      source.startsWith("/") ||
      source.startsWith("./") ||
      source.startsWith("../") ||
      /^[A-Za-z]:[/\\]/.test(source) ||
      source.includes("/") ||
      source.includes("\\") ||
      /\.[a-zA-Z0-9]+$/.test(source)
    ) {
      // File path - Node.js only
      if (typeof window !== "undefined") {
        throw new Error("File path loading is only supported in Node.js environment")
      }

      try {
        const { readFile } = await import("fs/promises")
        content = await readFile(source, "utf-8")
      } catch (error) {
        throw new Error(
          `Failed to read file '${source}': ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      // Raw content string
      content = source
    }
  } else if (source instanceof File) {
    // Browser File object
    if (typeof window === "undefined") {
      throw new Error("File object loading is only supported in browser environment")
    }

    try {
      content = await source.text()
    } catch (error) {
      throw new Error(
        `Failed to read File object: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  } else {
    throw new Error("Invalid source type. Expected string (file path or content) or File object")
  }

  // Parse the content and return enhanced geometry object
  try {
    const geometryData = parseGeometry(content)
    return new HECRASGeometry(geometryData)
  } catch (error) {
    throw new Error(
      `Failed to parse geometry: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * Synchronous version of loadGeometry for string content only
 * @param content Raw HEC-RAS geometry file content
 * @returns HECRASGeometry object with built-in methods
 */
export function loadGeometrySync(content: string): HECRASGeometry {
  if (typeof content !== "string") {
    throw new Error("loadGeometrySync only accepts string content")
  }

  try {
    const geometryData = parseGeometry(content)
    return new HECRASGeometry(geometryData)
  } catch (error) {
    throw new Error(
      `Failed to parse geometry: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
