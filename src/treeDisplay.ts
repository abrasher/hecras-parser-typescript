// treeDisplay.ts
import type { HECRASGeometry } from "./models/geometry"

interface TreeNode {
  label: string
  children?: TreeNode[]
  value?: any
  expanded?: boolean
}

export class TreeDisplay {
  private container: HTMLElement

  constructor(containerId: string) {
    const element = document.getElementById(containerId)
    if (!element) {
      throw new Error(`Element with id '${containerId}' not found`)
    }
    this.container = element
  }

  private createTreeNode(node: TreeNode, level: number = 0): HTMLDivElement {
    const nodeDiv = document.createElement("div")
    nodeDiv.className = "tree-node"
    nodeDiv.style.marginLeft = `${level * 20}px`

    const nodeContent = document.createElement("div")
    nodeContent.className = "tree-node-content"
    nodeContent.style.cursor = "pointer"
    nodeContent.style.padding = "2px 0"
    nodeContent.style.userSelect = "none"

    if (node.children && node.children.length > 0) {
      const expandIcon = document.createElement("span")
      expandIcon.className = "expand-icon"
      expandIcon.textContent = node.expanded ? "▼ " : "▶ "
      expandIcon.style.fontSize = "12px"
      expandIcon.style.marginRight = "5px"
      nodeContent.appendChild(expandIcon)

      const labelSpan = document.createElement("span")
      labelSpan.textContent = node.label
      labelSpan.style.fontWeight = "bold"
      nodeContent.appendChild(labelSpan)

      // Create children div first
      const childrenDiv = document.createElement("div")
      childrenDiv.className = "tree-children"
      childrenDiv.style.display = node.expanded ? "block" : "none"

      for (const child of node.children) {
        childrenDiv.appendChild(this.createTreeNode(child, level + 1))
      }

      // Now add the click event listener after childrenDiv is defined
      nodeContent.addEventListener("click", () => {
        node.expanded = !node.expanded
        expandIcon.textContent = node.expanded ? "▼ " : "▶ "
        childrenDiv.style.display = node.expanded ? "block" : "none"
      })

      nodeDiv.appendChild(nodeContent)
      nodeDiv.appendChild(childrenDiv)
    } else {
      const labelSpan = document.createElement("span")
      labelSpan.textContent = node.label
      labelSpan.style.marginLeft = "17px" // Align with expanded items
      nodeContent.appendChild(labelSpan)
      nodeDiv.appendChild(nodeContent)
    }

    return nodeDiv
  }

  private convertGeometryToTree(geometry: HECRASGeometry): TreeNode {
    const rootNode: TreeNode = {
      label: `HEC-RAS Geometry: ${geometry.title || "Untitled"}`,
      expanded: true,
      children: [],
    }

    // Add basic info
    const infoNode: TreeNode = {
      label: "Basic Information",
      expanded: true,
      children: [
        { label: `Title: ${geometry.title || "N/A"}` },
        { label: `Program Version: ${geometry.programVersion || "N/A"}` },
      ],
    }

    if (geometry.viewingRectangle) {
      infoNode.children!.push({
        label: "Viewing Rectangle",
        children: [
          { label: `Min X: ${geometry.viewingRectangle.minX}` },
          { label: `Max X: ${geometry.viewingRectangle.maxX}` },
          { label: `Min Y: ${geometry.viewingRectangle.minY}` },
          { label: `Max Y: ${geometry.viewingRectangle.maxY}` },
        ],
      })
    }

    rootNode.children!.push(infoNode)

    // Add reaches
    if (geometry.reaches && geometry.reaches.length > 0) {
      const reachesNode: TreeNode = {
        label: `Reaches (${geometry.reaches.length})`,
        expanded: true,
        children: [],
      }

      for (const reach of geometry.reaches) {
        const reachNode: TreeNode = {
          label: `${reach.riverName} - ${reach.reachName}`,
          expanded: false,
          children: [],
        }

        // Add reach info
        reachNode.children!.push({
          label: `Centerline Points: ${reach.centerline.length}`,
        })

        if (reach.textPosition) {
          reachNode.children!.push({
            label: `Text Position: (${reach.textPosition.x}, ${reach.textPosition.y})`,
          })
        }

        // Add cross sections
        if (reach.crossSections && reach.crossSections.length > 0) {
          const xsNode: TreeNode = {
            label: `Cross Sections (${reach.crossSections.length})`,
            expanded: false,
            children: [],
          }

          for (const xs of reach.crossSections) {
            const xsItemNode: TreeNode = {
              label: `Station ${xs.riverMile}`,
              expanded: false,
              children: [
                { label: `Station/Elevation Points: ${xs.staElevData.length}` },
                { label: `GIS Cut Line Points: ${xs.gisCutLine.length}` },
                { label: `Manning Segments: ${xs.manningSegments.length}` },
                {
                  label: `Ineffective Flow Areas: ${xs.ineffectiveFlowAreas.length}`,
                },
              ],
            }

            if (xs.bankStations) {
              xsItemNode.children!.push({
                label: `Bank Stations: L=${xs.bankStations.left}, R=${xs.bankStations.right}`,
              })
            }

            if (xs.lastEditedTime) {
              xsItemNode.children!.push({
                label: `Last Edited: ${xs.lastEditedTime}`,
              })
            }

            xsNode.children!.push(xsItemNode)
          }

          reachNode.children!.push(xsNode)
        }

        // Add lateral structures
        if (reach.lateralStructures && reach.lateralStructures.length > 0) {
          const lsNode: TreeNode = {
            label: `Lateral Structures (${reach.lateralStructures.length})`,
            expanded: false,
            children: [],
          }

          for (const ls of reach.lateralStructures) {
            lsNode.children!.push({
              label: `Station ${ls.riverMile}`,
              children: [
                { label: `Weir Width: ${ls.weirWidth}` },
                { label: `Weir Coefficient: ${ls.weirCoefficient}` },
                {
                  label: `Station/Elevation Points: ${ls.stationElevationData.length}`,
                },
              ],
            })
          }

          reachNode.children!.push(lsNode)
        }

        reachesNode.children!.push(reachNode)
      }

      rootNode.children!.push(reachesNode)
    }

    // Add storage areas
    if (geometry.storageAreas && geometry.storageAreas.length > 0) {
      const storageNode: TreeNode = {
        label: `Storage Areas (${geometry.storageAreas.length})`,
        expanded: false,
        children: [],
      }

      for (const sa of geometry.storageAreas) {
        const saNode: TreeNode = {
          label: `Storage Area ${sa.id}`,
          expanded: false,
          children: [
            { label: `Position: (${sa.x}, ${sa.y})` },
            { label: `Surface Line Points: ${sa.surfaceLine.length}` },
            {
              label: `Volume/Elevation Points: ${sa.volumeElevationData.length}`,
            },
            { label: `Manning's N: ${sa.manningsN}` },
          ],
        }

        storageNode.children!.push(saNode)
      }

      rootNode.children!.push(storageNode)
    }

    // Add connections
    if (geometry.connections && geometry.connections.length > 0) {
      const connectionsNode: TreeNode = {
        label: `Connections (${geometry.connections.length})`,
        expanded: false,
        children: [],
      }

      for (const conn of geometry.connections) {
        const connNode: TreeNode = {
          label: `Connection ${conn.id}${conn.description ? ` - ${conn.description}` : ""}`,
          expanded: false,
          children: [
            { label: `Line Points: ${conn.line.length}` },
            { label: `Upstream SA: ${conn.upSA || "N/A"}` },
            { label: `Downstream SA: ${conn.dnSA || "N/A"}` },
            { label: `Weir Width: ${conn.weirWidth}` },
            { label: `Weir Coefficient: ${conn.weirCoefficient}` },
            {
              label: `Weir Station/Elevation Points: ${conn.weirStationElevation.length}`,
            },
          ],
        }

        connectionsNode.children!.push(connNode)
      }

      rootNode.children!.push(connectionsNode)
    }

    // Add GIS info if available
    if (geometry.gisInfo && Object.keys(geometry.gisInfo).length > 0) {
      const gisNode: TreeNode = {
        label: "GIS Information",
        expanded: false,
        children: [],
      }

      for (const [key, value] of Object.entries(geometry.gisInfo)) {
        if (value) {
          gisNode.children!.push({
            label: `${key}: ${value}`,
          })
        }
      }

      if (gisNode.children!.length > 0) {
        rootNode.children!.push(gisNode)
      }
    }

    return rootNode
  }

  public displayGeometry(geometry: HECRASGeometry): void {
    // Clear previous content
    this.container.innerHTML = ""

    // Add some basic styling
    this.container.style.fontFamily = "monospace"
    this.container.style.fontSize = "14px"
    this.container.style.lineHeight = "1.4"
    this.container.style.border = "1px solid #ccc"
    this.container.style.padding = "10px"
    this.container.style.backgroundColor = "#f8f8f8"
    this.container.style.maxHeight = "600px"
    this.container.style.overflowY = "auto"

    // Convert geometry to tree structure
    const treeRoot = this.convertGeometryToTree(geometry)

    // Create and append tree
    const treeElement = this.createTreeNode(treeRoot)
    this.container.appendChild(treeElement)
  }

  public clear(): void {
    this.container.innerHTML = ""
    this.container.style.border = "none"
    this.container.style.backgroundColor = "transparent"
  }
}
