# HEC-RAS Geometry Viewer Demo

A standalone web application for visualizing parsed HEC-RAS geometry data on an interactive map.

## Features

- **Interactive Map**: Leaflet-based map with OpenStreetMap tiles
- **UTM 17N Support**: Automatic coordinate transformation from UTM 17N to WGS84
- **Layer Visualization**:
  - **Storage Areas**: Blue polygons and points representing 2D grid areas
  - **Connections**: Red lines showing culverts, bridges, and other connections with labels
  - **Boundary Conditions**: Orange dashed lines showing flow boundaries with labels
- **Feature Inspection**: Click any map feature to view its full JSON properties
- **Layer Controls**: Toggle visibility of different geometry types
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. **Install dependencies** (if not already installed):

   ```bash
   npm install
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

## Data Source

The demo uses `parsed-geometry.json` which contains:

- 1 storage area (2D_Grid) with surface lines and 2D points
- 8 connections (culverts and bridges)
- 21 boundary conditions

## Usage

1. **View the Map**: The map automatically zooms to fit all geometry data
2. **Toggle Layers**: Use the sidebar controls to show/hide different geometry types
3. **Inspect Features**: Click on any map feature to view its detailed properties
4. **Navigate**: Use standard map controls to zoom and pan

## Technical Details

- **Coordinate System**: Converts UTM Zone 17N coordinates to WGS84 for display
- **Mapping Library**: Leaflet v1.9.4
- **Coordinate Transformation**: Proj4 for UTM to WGS84 conversion
- **Build Tool**: Vite for fast development and building
- **TypeScript**: Full type safety for geometry data structures

## File Structure

```
demo/
├── public/
│   ├── index.html          # Main HTML file
│   └── parsed-geometry.json # Geometry data
├── src/
│   └── main.ts            # Main application code
├── package.json           # Dependencies
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory and can be served by any static file server.
