// Main interactive map component with clustering support
import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { LocationMarker } from './LocationMarker';
import { CoordinatePicker } from './CoordinatePicker';
import type { DutyStation, MapCoordinates } from '../../types/dutyStation';
import type { TileLayer as TileLayerType } from './MapControls';

// Fix for default marker icons
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.prototype.options.iconUrl = iconUrl;
L.Icon.Default.prototype.options.iconRetinaUrl = iconRetinaUrl;
L.Icon.Default.prototype.options.iconShadow = shadowUrl;

// Tile layer URLs
const TILE_LAYERS = {
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
};

const TILE_ATTRIBUTIONS = {
  osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  satellite: '&copy; <a href="https://www.esri.com/">Esri</a>',
  terrain: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
};

interface MarkerClusterGroupProps {
  stations: DutyStation[];
  showClustering: boolean;
  onStationClick?: (station: DutyStation) => void;
}

// Component to handle marker clustering
const MarkerClusterGroup = ({ stations, showClustering, onStationClick }: MarkerClusterGroupProps) => {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    if (showClustering) {
      // Create marker cluster group
      const clusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
      });

      // Add markers to cluster group
      stations.forEach(station => {
        const isObsolete = station.OBSOLETE === '1';
        const iconSize = isObsolete ? [20, 33] : [25, 41];
        const iconAnchor = isObsolete ? [10, 33] : [12, 41];
        
        const icon = L.icon({
          iconUrl,
          iconRetinaUrl,
          shadowUrl,
          iconSize: iconSize as [number, number],
          iconAnchor: iconAnchor as [number, number],
          popupAnchor: [1, isObsolete ? -28 : -34],
          shadowSize: isObsolete ? [33, 33] : [41, 41],
          className: isObsolete ? 'obsolete-marker' : ''
        });

        const marker = L.marker([station.LATITUDE, station.LONGITUDE], { icon });
        
        // Create popup content
        const popupContent = `
          <div style="min-width: 200px; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">${station.NAME}</h3>
            <div style="margin-bottom: 8px;">
              <div style="font-size: 11px; color: #666; margin-bottom: 2px;">Code:</div>
              <div style="font-size: 13px; font-weight: bold;">${station.DS}</div>
            </div>
            ${station.COUNTRY ? `
              <div style="margin-bottom: 8px;">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px;">Country:</div>
                <div style="font-size: 13px;">${station.COUNTRY} (${station.CTY})</div>
              </div>
            ` : ''}
            ${station.COMMONNAME && station.COMMONNAME !== station.NAME ? `
              <div style="margin-bottom: 8px;">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px;">Common Name:</div>
                <div style="font-size: 13px;">${station.COMMONNAME}</div>
              </div>
            ` : ''}
            <div style="margin-bottom: 8px;">
              <div style="font-size: 11px; color: #666; margin-bottom: 2px;">Coordinates:</div>
              <div style="font-size: 12px; font-family: monospace;">${station.LATITUDE.toFixed(6)}, ${station.LONGITUDE.toFixed(6)}</div>
            </div>
            ${isObsolete ? '<div style="display: inline-block; padding: 2px 8px; background: #d32f2f; color: white; border-radius: 12px; font-size: 11px;">Obsolete</div>' : ''}
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onStationClick) {
          marker.on('click', () => onStationClick(station));
        }

        clusterGroup.addLayer(marker);
      });

      clusterGroupRef.current = clusterGroup;
      map.addLayer(clusterGroup);
    } else {
      // Add individual markers without clustering
      const markers = stations.map(station => {
        const isObsolete = station.OBSOLETE === '1';
        const iconSize = isObsolete ? [20, 33] : [25, 41];
        const iconAnchor = isObsolete ? [10, 33] : [12, 41];
        
        const icon = L.icon({
          iconUrl,
          iconRetinaUrl,
          shadowUrl,
          iconSize: iconSize as [number, number],
          iconAnchor: iconAnchor as [number, number],
          popupAnchor: [1, isObsolete ? -28 : -34],
          shadowSize: isObsolete ? [33, 33] : [41, 41],
          className: isObsolete ? 'obsolete-marker' : ''
        });

        const marker = L.marker([station.LATITUDE, station.LONGITUDE], { icon });
        
        const popupContent = `
          <div style="min-width: 200px; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">${station.NAME}</h3>
            <div style="margin-bottom: 8px;">
              <div style="font-size: 11px; color: #666; margin-bottom: 2px;">Code:</div>
              <div style="font-size: 13px; font-weight: bold;">${station.DS}</div>
            </div>
            ${station.COUNTRY ? `
              <div style="margin-bottom: 8px;">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px;">Country:</div>
                <div style="font-size: 13px;">${station.COUNTRY} (${station.CTY})</div>
              </div>
            ` : ''}
            ${station.COMMONNAME && station.COMMONNAME !== station.NAME ? `
              <div style="margin-bottom: 8px;">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px;">Common Name:</div>
                <div style="font-size: 13px;">${station.COMMONNAME}</div>
              </div>
            ` : ''}
            <div style="margin-bottom: 8px;">
              <div style="font-size: 11px; color: #666; margin-bottom: 2px;">Coordinates:</div>
              <div style="font-size: 12px; font-family: monospace;">${station.LATITUDE.toFixed(6)}, ${station.LONGITUDE.toFixed(6)}</div>
            </div>
            ${isObsolete ? '<div style="display: inline-block; padding: 2px 8px; background: #d32f2f; color: white; border-radius: 12px; font-size: 11px;">Obsolete</div>' : ''}
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onStationClick) {
          marker.on('click', () => onStationClick(station));
        }

        marker.addTo(map);
        return marker;
      });

      markersRef.current = markers;
    }

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
      markersRef.current.forEach(marker => map.removeLayer(marker));
    };
  }, [map, stations, showClustering, onStationClick]);

  return null;
};

interface InteractiveMapProps {
  stations: DutyStation[];
  center?: MapCoordinates;
  zoom?: number;
  height?: string | number;
  tileLayer?: TileLayerType;
  showClustering?: boolean;
  enableCoordinatePicker?: boolean;
  onStationClick?: (station: DutyStation) => void;
  onLocationPicked?: (coordinates: MapCoordinates, address?: string) => void;
}

export const InteractiveMap = ({
  stations,
  center = { latitude: 20, longitude: 0 },
  zoom = 2,
  height = '600px',
  tileLayer = 'osm',
  showClustering = true,
  enableCoordinatePicker = false,
  onStationClick,
  onLocationPicked
}: InteractiveMapProps) => {
  const tileUrl = TILE_LAYERS[tileLayer];
  const attribution = TILE_ATTRIBUTIONS[tileLayer];

  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: 8 }}
      scrollWheelZoom={true}
    >
      <TileLayer url={tileUrl} attribution={attribution} />
      
      <MarkerClusterGroup
        stations={stations}
        showClustering={showClustering}
        onStationClick={onStationClick}
      />

      {enableCoordinatePicker && (
        <CoordinatePicker onLocationPicked={onLocationPicked} />
      )}
    </MapContainer>
  );
};


