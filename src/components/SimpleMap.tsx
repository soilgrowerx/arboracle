'use client';

import { useEffect, useRef } from 'react';

interface SimpleMapProps {
  trees?: any[];
  center?: [number, number];
  zoom?: number;
}

export function SimpleMap({ trees = [], center = [40.7128, -74.0060], zoom = 10 }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = await import('leaflet');
      
      // Create the map
      const map = L.map(mapRef.current!, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      // Add a basic tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add satellite tile layer option
      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Satellite &copy; Esri',
        maxZoom: 19,
      });

      // Layer control
      const baseLayers = {
        "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }),
        "Satellite": satellite
      };

      L.control.layers(baseLayers).addTo(map);

      // Add tree markers if any
      trees.forEach((tree) => {
        if (tree.lat && tree.lng && tree.lat !== 0 && tree.lng !== 0) {
          const marker = L.marker([tree.lat, tree.lng])
            .addTo(map)
            .bindPopup(`
              <div>
                <h4>${tree.species || tree.commonName || 'Unknown Species'}</h4>
                <p><strong>Location:</strong> ${tree.lat.toFixed(4)}, ${tree.lng.toFixed(4)}</p>
                ${tree.date_planted ? `<p><strong>Planted:</strong> ${new Date(tree.date_planted).toLocaleDateString()}</p>` : ''}
              </div>
            `);
        }
      });

      // Cleanup function
      return () => {
        map.remove();
      };
    };

    initMap();
  }, [trees, center, zoom]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] sm:h-[500px] rounded-lg border border-green-200 shadow-sm"
      style={{ height: '500px' }}
    />
  );
}