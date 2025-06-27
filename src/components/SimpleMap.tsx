'use client';

import { useEffect, useRef, useState } from 'react';

interface SimpleMapProps {
  trees?: any[];
  center?: [number, number];
  zoom?: number;
}

export function SimpleMap({ trees = [], center = [40.7128, -74.0060], zoom = 10 }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      try {
        const L = await import('leaflet');
        
        // Ensure container is completely clean
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
          // Remove any existing leaflet-container class
          mapRef.current.classList.remove('leaflet-container');
        }
        
        // Create a fresh map instance
        const map = L.map(mapRef.current!, {
          center: center,
          zoom: zoom,
          zoomControl: true,
        });
        
        mapInstanceRef.current = map;

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

      setIsMapReady(true);
      
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsMapReady(false);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initMap();
    }, 100);
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error cleaning up map:', e);
        }
        mapInstanceRef.current = null;
      }
      setIsMapReady(false);
    };
  }, [trees, center, zoom]);

  return (
    <div className="w-full h-[400px] sm:h-[500px] rounded-lg border border-green-200 shadow-sm relative">
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{ height: '500px' }}
      />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-50 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <div className="text-green-600">Loading map...</div>
          </div>
        </div>
      )}
    </div>
  );
}