import L from "leaflet"
import proj4 from "proj4"

// Define coordinate systems
const utm17n = "+proj=utm +zone=17 +datum=WGS84 +units=m +no_defs"
const wgs84 = "+proj=longlat +datum=WGS84 +no_defs"

// Initialize coordinate transformation
const transformUtmToWgs84 = proj4(utm17n, wgs84)

// Types for our geometry data
interface Coordinate {
  x: number
  y: number
}

interface StorageArea {
  id: string
  surfaceLine: Coordinate[]
  points2D: Coordinate[]
  mannings: number
  type: number
  area: number | null
  minElevation: number | null
  is2D: number
  locked: number
}

interface Connection {
  name: string
  connectionLine: Coordinate[]
  upstreamStorageArea: string
  downstreamStorageArea: string
  description: string
  routingType: number
  weirWD: number
  weirCoefficient: number
}

interface BoundaryCondition {
  name: string
  storageArea: string
  startPosition: Coordinate
  endPosition: Coordinate
  arc: number
  arcCoordinates: Coordinate[]
}

interface GeometryData {
  geomTitle: string
  programVersion: string
  viewingRectangle: {
    left: number
    right: number
    top: number
    bottom: number
  }
  storageAreas: StorageArea[]
  connections: Connection[]
  boundaryConditions: BoundaryCondition[]
  description: string
}

class GeometryViewer {
  private map!: L.Map
  private storageAreaLayer!: L.LayerGroup
  private connectionLayer!: L.LayerGroup
  private boundaryConditionLayer!: L.LayerGroup
  private data: GeometryData | null = null

  constructor() {
    this.initializeMap()
    this.initializeLayers()
    this.setupEventListeners()
    this.loadData()
  }

  private initializeMap() {
    // Initialize the map
    this.map = L.map("map", {
      center: [0, 0], // Will be set after data loads
      zoom: 13,
      zoomControl: true,
    })

    // Add base map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map)
  }

  private initializeLayers() {
    this.storageAreaLayer = L.layerGroup().addTo(this.map)
    this.connectionLayer = L.layerGroup().addTo(this.map)
    this.boundaryConditionLayer = L.layerGroup().addTo(this.map)
  }

  private setupEventListeners() {
    // Layer toggle controls
    const storageAreasCheckbox = document.getElementById("storage-areas") as HTMLInputElement
    const connectionsCheckbox = document.getElementById("connections") as HTMLInputElement
    const boundaryConditionsCheckbox = document.getElementById("boundary-conditions") as HTMLInputElement

    storageAreasCheckbox?.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement
      if (target.checked) {
        this.map.addLayer(this.storageAreaLayer)
      } else {
        this.map.removeLayer(this.storageAreaLayer)
      }
    })

    connectionsCheckbox?.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement
      if (target.checked) {
        this.map.addLayer(this.connectionLayer)
      } else {
        this.map.removeLayer(this.connectionLayer)
      }
    })

    boundaryConditionsCheckbox?.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement
      if (target.checked) {
        this.map.addLayer(this.boundaryConditionLayer)
      } else {
        this.map.removeLayer(this.boundaryConditionLayer)
      }
    })
  }

  private async loadData() {
    try {
      const response = await fetch("./parsed-geometry.json")
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`)
      }
      this.data = await response.json()
      this.renderGeometry()
      this.hideLoading()
    } catch (error) {
      this.showError(`Error loading geometry data: ${error}`)
      this.hideLoading()
    }
  }

  private renderGeometry() {
    if (!this.data) return

    // Clear existing layers
    this.storageAreaLayer.clearLayers()
    this.connectionLayer.clearLayers()
    this.boundaryConditionLayer.clearLayers()

    // Render storage areas
    this.renderStorageAreas()

    // Render connections
    this.renderConnections()

    // Render boundary conditions
    this.renderBoundaryConditions()

    // Fit map to data bounds
    this.fitMapToBounds()
  }

  private renderStorageAreas() {
    if (!this.data) return

    this.data.storageAreas.forEach((area) => {
      // Convert surface line to WGS84 and create polygon
      if (area.surfaceLine && area.surfaceLine.length > 0) {
        const latLngs = area.surfaceLine.map((coord) => {
          const [lng, lat] = transformUtmToWgs84.forward([coord.x, coord.y])
          return [lat, lng] as [number, number]
        })

        const polygon = L.polygon(latLngs, {
          color: "#3498db",
          fillColor: "#3498db",
          fillOpacity: 0.3,
          weight: 2,
        })

        polygon.bindTooltip(`Storage Area: ${area.id}`, {
          permanent: false,
          direction: "center",
        })

        polygon.on("click", () => {
          this.showFeatureDetails(area, "Storage Area")
        })

        this.storageAreaLayer.addLayer(polygon)
      }

      // Add 2D points as markers
      if (area.points2D && area.points2D.length > 0) {
        area.points2D.forEach((point, index) => {
          const [lng, lat] = transformUtmToWgs84.forward([point.x, point.y])
          const marker = L.circleMarker([lat, lng], {
            radius: 3,
            color: "#2980b9",
            fillColor: "#3498db",
            fillOpacity: 0.8,
          })

          marker.bindTooltip(`${area.id} - Point ${index + 1}`, {
            permanent: false,
          })

          this.storageAreaLayer.addLayer(marker)
        })
      }
    })
  }

  private renderConnections() {
    if (!this.data) return

    this.data.connections.forEach((connection) => {
      if (connection.connectionLine && connection.connectionLine.length > 0) {
        const latLngs = connection.connectionLine.map((coord) => {
          const [lng, lat] = transformUtmToWgs84.forward([coord.x, coord.y])
          return [lat, lng] as [number, number]
        })

        const polyline = L.polyline(latLngs, {
          color: "#e74c3c",
          weight: 4,
          opacity: 0.8,
        })

        polyline.bindTooltip(`Connection: ${connection.name}`, {
          permanent: true,
          direction: "center",
          className: "connection-label",
        })

        polyline.on("click", () => {
          this.showFeatureDetails(connection, "Connection")
        })

        this.connectionLayer.addLayer(polyline)
      }
    })
  }

  private renderBoundaryConditions() {
    if (!this.data) return

    this.data.boundaryConditions.forEach((bc) => {
      if (bc.arcCoordinates && bc.arcCoordinates.length > 0) {
        const latLngs = bc.arcCoordinates.map((coord) => {
          const [lng, lat] = transformUtmToWgs84.forward([coord.x, coord.y])
          return [lat, lng] as [number, number]
        })

        const polyline = L.polyline(latLngs, {
          color: "#f39c12",
          weight: 3,
          opacity: 0.8,
          dashArray: "5, 5",
        })

        polyline.bindTooltip(`Boundary: ${bc.name}`, {
          permanent: true,
          direction: "center",
          className: "boundary-label",
        })

        polyline.on("click", () => {
          this.showFeatureDetails(bc, "Boundary Condition")
        })

        this.boundaryConditionLayer.addLayer(polyline)
      }
    })
  }

  private fitMapToBounds() {
    if (!this.data) return

    const allCoords: Coordinate[] = []

    // Collect all coordinates
    this.data.storageAreas.forEach((area) => {
      if (area.surfaceLine) allCoords.push(...area.surfaceLine)
      if (area.points2D) allCoords.push(...area.points2D)
    })

    this.data.connections.forEach((connection) => {
      if (connection.connectionLine) allCoords.push(...connection.connectionLine)
    })

    this.data.boundaryConditions.forEach((bc) => {
      if (bc.arcCoordinates) allCoords.push(...bc.arcCoordinates)
    })

    if (allCoords.length > 0) {
      const bounds = allCoords.map((coord) => {
        const [lng, lat] = transformUtmToWgs84.forward([coord.x, coord.y])
        return [lat, lng] as [number, number]
      })

      this.map.fitBounds(bounds, { padding: [20, 20] })
    }
  }

  private showFeatureDetails(feature: any, type: string) {
    const detailsDiv = document.getElementById("feature-details")
    if (!detailsDiv) return

    const jsonString = JSON.stringify(feature, null, 2)
    detailsDiv.innerHTML = `
      <h4>${type}: ${feature.name || feature.id}</h4>
      <div class="json-viewer">${jsonString}</div>
    `
  }

  private hideLoading() {
    const loadingDiv = document.getElementById("loading")
    if (loadingDiv) {
      loadingDiv.style.display = "none"
    }
  }

  private showError(message: string) {
    const mapContainer = document.querySelector(".map-container")
    if (mapContainer) {
      const errorDiv = document.createElement("div")
      errorDiv.className = "error"
      errorDiv.textContent = message
      mapContainer.insertBefore(errorDiv, mapContainer.firstChild)
    }
  }
}

// Initialize the viewer when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new GeometryViewer()
})
