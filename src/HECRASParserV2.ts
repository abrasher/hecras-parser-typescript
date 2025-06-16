// New HECRAS Parser using the plugin architecture
import { HECRASParser } from "./core/plugins"
import { GeometryParserPlugin } from "./plugins/geometryPlugin"
import { HECRASGeometry } from "./models/geometry"

export class HECRASParserV2 extends HECRASParser {
  constructor() {
    super()

    // Register built-in plugins
    this.registerBuiltinPlugins()
  }

  protected registerBuiltinPlugins(): void {
    // Register the geometry parser plugin
    this.registerPlugin(new GeometryParserPlugin())

    // TODO: Register other file type plugins as they are implemented
    // this.registerPlugin(new FlowParserPlugin())
    // this.registerPlugin(new PlanParserPlugin())
    // this.registerPlugin(new UnsteadyParserPlugin())
  }

  // Convenience method for parsing geometry files specifically
  async parseGeometry(
    content: string,
    filePath?: string,
  ): Promise<HECRASGeometry> {
    const result = await this.parse<HECRASGeometry>(content, filePath)

    if (!result.success) {
      throw new Error(
        `Failed to parse geometry file: ${result.errors.map((e) => e.message).join(", ")}`,
      )
    }

    return result.data!
  }

  // Backward compatibility method to match the old API
  static create(): HECRASParserV2 {
    return new HECRASParserV2()
  }
}

// Export for backward compatibility
export { HECRASParserV2 as HecRasGeometryParser }

// Default export
export default HECRASParserV2
