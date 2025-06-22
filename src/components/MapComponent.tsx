'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Tree } from '@/types';
import { calculateTreeAge } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom tree marker icon
const treeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="11" fill="#10b981" stroke="#065f46" stroke-width="1"/>
      <text x="12" y="16" text-anchor="middle" fill="white" font-size="14" font-weight="bold">🌳</text>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapComponentProps {
  trees: Tree[];
  onTreeSelect?: (tree: Tree) => void;
}

// Component to fit map bounds to show all trees
function MapBounds({ trees }: { trees: Tree[] }) {
  const map = useMap();

  useEffect(() => {
    if (trees.length > 0) {
      const bounds = L.latLngBounds(trees.map(tree => [tree.location.lat, tree.location.lng]));
      
      if (trees.length === 1) {
        // If only one tree, center on it with a reasonable zoom
        map.setView([trees[0].location.lat, trees[0].location.lng], 15);
      } else {
        // Fit all trees in view with padding
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } else {
      // Default view if no trees
      map.setView([37.7749, -122.4194], 10); // San Francisco
    }
  }, [trees, map]);

  return null;
}

export default function MapComponent({ trees, onTreeSelect }: MapComponentProps) {
  const mapRef = useRef<L.Map>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getTreeDisplayName = (tree: Tree) => {
    return tree.commonName || tree.species || 'Unknown Species';
  };

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-green-200 shadow-lg">
      <MapContainer
        ref={mapRef}
        center={[37.7749, -122.4194]} // Default center (San Francisco)
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds trees={trees} />
        
        {trees.map((tree) => (
          <Marker
            key={tree.id}
            position={[tree.location.lat, tree.location.lng]}
            icon={treeIcon}
            eventHandlers={{
              click: () => {
                onTreeSelect?.(tree);
              },
            }}
          >
            <Popup className="tree-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🌳</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-800 text-lg leading-tight">
                      {getTreeDisplayName(tree)}
                    </h3>
                    {tree.scientificName && tree.scientificName !== tree.species && (
                      <p className="text-sm italic text-green-600 mt-1">
                        {tree.scientificName}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">📅</span>
                    <span className="font-medium">Planted:</span>
                    <span>{formatDate(tree.date_planted)}</span>
                  </div>
                  
                  {tree.date_planted && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">🕐</span>
                      <span className="font-medium">Age:</span>
                      <span>{calculateTreeAge(tree.date_planted).displayText}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">📍</span>
                    <span className="font-medium">Location:</span>
                    <span className="text-xs font-mono">
                      {tree.location.lat.toFixed(4)}, {tree.location.lng.toFixed(4)}
                    </span>
                  </div>
                  
                  {tree.plus_code_local && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">🔗</span>
                      <span className="font-medium">Plus Code:</span>
                      <span className="text-xs font-mono bg-green-50 px-1 rounded">
                        {tree.plus_code_local}
                      </span>
                    </div>
                  )}
                  
                  {tree.notes && (
                    <div className="mt-3 pt-2 border-t border-green-100">
                      <p className="text-xs text-green-700">
                        <span className="font-medium">Notes:</span> {tree.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-green-100">
                  <button
                    onClick={() => onTreeSelect?.(tree)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}