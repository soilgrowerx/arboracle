'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { Tree } from '@/types/tree';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LeafletMapProps {
  trees: Tree[];
  onTreeSelect?: (tree: Tree) => void;
}

export default function LeafletMap({ trees, onTreeSelect }: LeafletMapProps) {
  useEffect(() => {
    // Initialize map
    const map = L.map('map').setView([37.7749, -122.4194], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add markers for trees
    const markers: L.Marker[] = [];
    trees.forEach((tree) => {
      if (tree.lat && tree.lng) {
        const marker = L.marker([tree.lat, tree.lng])
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${tree.species}</h3>
              ${tree.commonName ? `<p style="margin: 4px 0; color: #666;">${tree.commonName}</p>` : ''}
              <p style="margin: 4px 0;">Health: ${tree.health_status || 'Not assessed'}</p>
              <p style="margin: 4px 0;">Planted: ${new Date(tree.date_planted).toLocaleDateString()}</p>
            </div>
          `);
        
        marker.on('click', () => {
          if (onTreeSelect) {
            onTreeSelect(tree);
          }
        });
        
        markers.push(marker);
      }
    });

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Cleanup
    return () => {
      map.remove();
    };
  }, [trees, onTreeSelect]);

  return <div id="map" style={{ height: '600px', width: '100%', borderRadius: '8px' }} />;
}