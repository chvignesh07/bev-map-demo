import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
// Import components
import EtaWidget from './components/EtaWidget';
import LaneGuidance from './components/LaneGuidance';
import Compass from './components/Compass';
import SpeedLimit from './components/SpeedLimit';
import ExitInfo from './components/ExitInfo';

// AI Integration Points - Future enhancement 
// TODO: Import vehicle perception module
// TODO: Import privacy filter for location data

// Mapbox access token - For demo purposes, using public token
// In production, this should be in environment variables
mapboxgl.accessToken = 'pk.eyJ1IjoiYmV2LWRlbW8iLCJhIjoiY2tyNTRjaGNpMGRoejJ3bnZ6MXlxbzZ6YiJ9.demo-token-for-bev-map';

function MapView({ scenario, isPlaying, playbackTime, onTimeUpdate }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(-122.4194);
  const [lat] = useState(37.7749);
  const [zoom] = useState(15);
  const [bearing] = useState(0);
  const [pitch] = useState(60); // Bird's eye view angle

  // AI/Privacy integration points
  const processVehicleData = (rawVehicleData) => {
    // TODO: Apply AI decision engine processing
    // TODO: Apply privacy filters to sensitive location data
    return rawVehicleData;
  };

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark Apple Maps style
      center: [lng, lat],
      zoom: zoom,
      bearing: bearing,
      pitch: pitch,
      antialias: true
    });

    map.current.on('load', () => {
      // Add custom styling for BEV appearance
      map.current.addLayer({
        id: 'road-glow',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#00ff88',
          'line-width': 4,
          'line-blur': 2
        }
      });

      // Initialize vehicle markers
      addVehicleMarkers();
      
      // Add field of view polygons
      addFieldOfViewLayers();
    });
  }, [lng, lat, zoom, bearing, pitch]);

  const addVehicleMarkers = () => {
    if (!scenario?.vehicles || !map.current) return;

    scenario.vehicles.forEach((vehicle) => {
      const processedVehicle = processVehicleData(vehicle);
      
      // Create vehicle marker
      const el = document.createElement('div');
      el.className = `vehicle-marker ${vehicle.type}`;
      
      if (vehicle.type === 'ego') {
        el.innerHTML = `
          <div class="ego-vehicle">
            <div class="vehicle-body"></div>
            <div class="turn-signal ${vehicle.turnSignal || ''}">
              ${vehicle.turnSignal === 'left' ? '⬅️' : vehicle.turnSignal === 'right' ? '➡️' : ''}
            </div>
            <div class="speed-indicator">${vehicle.speed} mph</div>
          </div>
        `;
      } else {
        el.innerHTML = `
          <div class="other-vehicle">
            <div class="vehicle-body"></div>
            <div class="vehicle-info">${vehicle.speed} mph</div>
          </div>
        `;
      }
      
      new mapboxgl.Marker(el)
        .setLngLat(vehicle.position)
        .addTo(map.current);
    });
  };

  const addFieldOfViewLayers = () => {
    if (!scenario?.fieldOfView || !map.current) return;

    const ego = scenario.vehicles.find(v => v.type === 'ego');
    if (!ego) return;

    // Front field of view
    const frontFovData = createFieldOfViewPolygon(
      ego.position,
      ego.heading,
      scenario.fieldOfView.front.angle,
      scenario.fieldOfView.front.distance,
      'front'
    );

    map.current.addSource('front-fov', {
      type: 'geojson',
      data: frontFovData
    });

    map.current.addLayer({
      id: 'front-fov-fill',
      type: 'fill',
      source: 'front-fov',
      paint: {
        'fill-color': '#00ff88',
        'fill-opacity': 0.1
      }
    });

    map.current.addLayer({
      id: 'front-fov-outline',
      type: 'line',
      source: 'front-fov',
      paint: {
        'line-color': '#00ff88',
        'line-width': 2,
        'line-opacity': 0.6
      }
    });

    // Rear field of view
    const rearFovData = createFieldOfViewPolygon(
      ego.position,
      ego.heading + 180, // Opposite direction
      scenario.fieldOfView.rear.angle,
      scenario.fieldOfView.rear.distance,
      'rear'
    );

    map.current.addSource('rear-fov', {
      type: 'geojson',
      data: rearFovData
    });

    map.current.addLayer({
      id: 'rear-fov-fill',
      type: 'fill',
      source: 'rear-fov',
      paint: {
        'fill-color': '#ff6b00',
        'fill-opacity': 0.1
      }
    });

    map.current.addLayer({
      id: 'rear-fov-outline',
      type: 'line',
      source: 'rear-fov',
      paint: {
        'line-color': '#ff6b00',
        'line-width': 2,
        'line-opacity': 0.6
      }
    });
  };

  const createFieldOfViewPolygon = (center, heading, angle, distance, type) => {
    // Convert to radians
    const headingRad = (heading * Math.PI) / 180;
    const halfAngleRad = ((angle / 2) * Math.PI) / 180;

    // Calculate polygon points
    const points = [center]; // Start from vehicle position

    // Left edge of FOV
    const leftAngle = headingRad - halfAngleRad;
    const leftPoint = [
      center[0] + (distance / 111320) * Math.cos(leftAngle) / Math.cos(center[1] * Math.PI / 180),
      center[1] + (distance / 111320) * Math.sin(leftAngle)
    ];
    
    // Right edge of FOV  
    const rightAngle = headingRad + halfAngleRad;
    const rightPoint = [
      center[0] + (distance / 111320) * Math.cos(rightAngle) / Math.cos(center[1] * Math.PI / 180),
      center[1] + (distance / 111320) * Math.sin(rightAngle)
    ];

    points.push(leftPoint);
    points.push(rightPoint);
    points.push(center); // Close the polygon

    return {
      type: 'Feature',
      properties: { type },
      geometry: {
        type: 'Polygon',
        coordinates: [points]
      }
    };
  };

  // Playback animation effects
  useEffect(() => {
    if (!isPlaying || !scenario) return;

    const interval = setInterval(() => {
      onTimeUpdate((prev) => {
        if (prev >= scenario.duration) {
          return 0; // Loop back to start
        }
        return prev + 100; // Increment by 100ms
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, scenario, onTimeUpdate]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
      
      {/* CarPlay-style UI overlays */}
      <div className="ui-overlays">
        <div className="top-overlay">
          <EtaWidget eta={scenario?.route?.eta} />
          <ExitInfo info={scenario?.route?.nextTurn} />
        </div>
        
        <div className="left-overlay">
          <LaneGuidance guidance={scenario?.route?.laneGuidance} />
        </div>
        
        <div className="right-overlay">
          <Compass bearing={bearing} />
          <SpeedLimit limit={scenario?.route?.speedLimit} />
        </div>
        
        <div className="bottom-overlay">
          <div className="playback-indicator">
            {isPlaying && (
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(playbackTime / (scenario?.duration || 1)) * 100}%` 
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Privacy notice - AI integration point */}
      <div className="privacy-notice">
        🔒 Demo Mode - Location data anonymized
      </div>
    </div>
  );
}

export default MapView;
