// main.ts
import { HecRasGeometryParser } from "./HECRASGeometryParser"
import { MapRenderer } from "./mapRenderer"
import { TreeDisplay } from "./treeDisplay"

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput") as HTMLInputElement
  const outputDiv = document.getElementById("output") as HTMLDivElement
  const mapDiv = document.getElementById("map") as HTMLDivElement
  const treeDiv = document.getElementById("treeDisplay") as HTMLDivElement

  let parsedGeometryData: any = null // Store parsed data
  let mapRenderer: MapRenderer | null = null
  let treeDisplay: TreeDisplay | null = null

  if (!fileInput || !outputDiv || !mapDiv || !treeDiv) {
    console.error("Required HTML elements not found.")
    return
  }

  // Initialize tree display
  treeDisplay = new TreeDisplay("treeDisplay")

  fileInput.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    parsedGeometryData = null // Reset on new file

    // Hide map and tree, destroy previous instances
    mapDiv.style.display = "none"
    treeDiv.style.display = "none"
    if (mapRenderer) {
      mapRenderer.destroy()
      mapRenderer = null
    }
    if (treeDisplay) {
      treeDisplay.clear()
    }

    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileContent = e.target?.result as string
        if (fileContent) {
          try {
            const parser = new HecRasGeometryParser()
            parsedGeometryData = parser.parse(fileContent)

            // Show parsed data summary
            outputDiv.textContent = `Parsed HEC-RAS Geometry:
- Title: ${parsedGeometryData.title || "N/A"}
- Reaches: ${parsedGeometryData.reaches?.length || 0}
- Storage Areas: ${parsedGeometryData.storageAreas?.length || 0}
- Cross Sections: ${parsedGeometryData.reaches?.reduce((total: number, reach: any) => total + (reach.crossSections?.length || 0), 0) || 0}`

            // Show tree display
            treeDiv.style.display = "block"
            if (treeDisplay) {
              treeDisplay.displayGeometry(parsedGeometryData)
            }

            // Show map
            mapDiv.style.display = "block"
            mapRenderer = new MapRenderer("map")
            mapRenderer.renderGeometry(parsedGeometryData)

            console.log("Parsed Geometry:", parsedGeometryData)
          } catch (error) {
            console.error("Error parsing file:", error)
            outputDiv.textContent = `Error parsing file: ${error instanceof Error ? error.message : String(error)}`
          }
        }
      }
      reader.onerror = (e) => {
        console.error("Error reading file:", e)
        outputDiv.textContent = "Error reading file."
      }
      reader.readAsText(file)
    }
  })
})
