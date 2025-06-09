// mapRenderer.ts
import L from 'leaflet';
import type { HECRASGeometry } from './models/geometry';
import { coordinateArrayToLatLng, statePlaneToLatLng } from './mapUtils';

export class MapRenderer {
    private map: L.Map | null = null;
    private geometryLayer: L.LayerGroup | null = null;

    constructor(private containerId: string) {}

    public renderGeometry(geometry: HECRASGeometry): void {
        this.initializeMap();
        this.clearGeometry();
        
        if (!this.map) return;

        this.geometryLayer = L.layerGroup().addTo(this.map);
        
        // Render reaches (centerlines and cross sections)
        this.renderReaches(geometry);
        
        // Render storage areas if any
        this.renderStorageAreas(geometry);
        
        // Fit map to geometry bounds
        this.fitMapToBounds();
    }

    private initializeMap(): void {
        if (this.map) return;

        this.map = L.map(this.containerId, {
            center: [39.0, -86.0], // Approximate center for Indiana
            zoom: 10
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    private renderReaches(geometry: HECRASGeometry): void {
        if (!this.geometryLayer) return;

        geometry.reaches.forEach((reach, reachIndex) => {
            const color = this.getReachColor(reachIndex);
            
            // Render centerline
            if (reach.centerline.length > 0) {
                const centerlineLatLngs = coordinateArrayToLatLng(reach.centerline);
                const centerline = L.polyline(centerlineLatLngs, {
                    color: color,
                    weight: 3,
                    opacity: 0.8
                }).bindPopup(`${reach.riverName} - ${reach.reachName}`);
                
                this.geometryLayer!.addLayer(centerline);
            }

            // Render cross sections
            reach.crossSections.forEach(xs => {
                if (xs.gisCutLine.length > 0) {
                    const xsLatLngs = coordinateArrayToLatLng(xs.gisCutLine);
                    const xsLine = L.polyline(xsLatLngs, {
                        color: color,
                        weight: 1,
                        opacity: 0.6,
                        dashArray: '5, 5'
                    }).bindPopup(`XS ${xs.riverStation}`);
                    
                    this.geometryLayer!.addLayer(xsLine);
                }
            });
        });
    }

    private renderStorageAreas(geometry: HECRASGeometry): void {
        if (!this.geometryLayer) return;

        geometry.storageAreas.forEach(storage => {
            if (storage.surfaceLine.length > 0) {
                const surfaceLineLatLngs = coordinateArrayToLatLng(storage.surfaceLine);
                const storagePolygon = L.polygon(surfaceLineLatLngs, {
                    color: '#0066cc',
                    fillColor: '#0066cc',
                    fillOpacity: 0.3,
                    weight: 2
                }).bindPopup(`Storage Area: ${storage.id}`);
                
                this.geometryLayer!.addLayer(storagePolygon);
            } else if (storage.centroid) {
                // If no surface line, show centroid as a marker
                const centroidLatLng = statePlaneToLatLng(storage.centroid.x, storage.centroid.y);
                const marker = L.circleMarker([centroidLatLng.lat, centroidLatLng.lng], {
                    color: '#0066cc',
                    fillColor: '#0066cc',
                    fillOpacity: 0.6,
                    radius: 8
                }).bindPopup(`Storage Area: ${storage.id}`);
                
                this.geometryLayer!.addLayer(marker);
            }
        });
    }

    private getReachColor(index: number): string {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e67e22'];
        return colors[index % colors.length];
    }

    private clearGeometry(): void {
        if (this.geometryLayer) {
            this.geometryLayer.clearLayers();
        }
    }

    private fitMapToBounds(): void {
        if (!this.map || !this.geometryLayer) return;

        const group = this.geometryLayer;
        if (group.getLayers().length > 0) {
            // Create a feature group to get bounds
            const featureGroup = L.featureGroup(group.getLayers());
            const bounds = featureGroup.getBounds();
            this.map.fitBounds(bounds, { padding: [20, 20] });
        }
    }

    public destroy(): void {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.geometryLayer = null;
    }
}
