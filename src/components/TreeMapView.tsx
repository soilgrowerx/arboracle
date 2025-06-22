'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Tree } from '@/types';
import { TreeService } from '@/services/treeService';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Custom tree icon - only create when on client
const createTreeIcon = () => {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  return L.divIcon({
    html: `
      <div style="
        width: 24px; 
        height: 24px; 
        background-color: #15803d; 
        border-radius: 50%; 
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        <span style="color: white; font-size: 12px;">🌳</span>
      </div>
    `,
    className: 'custom-tree-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Component to fit map bounds to show all trees
function MapBounds({ trees }: { trees: Tree[] }) {
  const { useMap } = require('react-leaflet');
  const map = useMap();

  useEffect(() => {
    if (trees.length > 0 && typeof window !== 'undefined') {
      const L = require('leaflet');
      const group = new L.FeatureGroup(
        trees.map(tree => 
          L.marker([tree.lat, tree.lng])
        )
      );
      
      if (trees.length === 1) {
        // If only one tree, center on it with a reasonable zoom
        map.setView([trees[0].lat, trees[0].lng], 15);
      } else {
        // Fit bounds to show all trees
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
  }, [trees, map]);

  return null;
}

interface TreeMapViewProps {
  onTreeSelect?: (tree: Tree) => void;
}

export function TreeMapView({ onTreeSelect }: TreeMapViewProps) {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const loadTrees = () => {
      try {
        const allTrees = TreeService.getAllTrees();
        // Filter trees that have valid coordinates (not 0,0)
        const treesWithCoords = allTrees.filter(
          tree => tree.lat !== 0 && tree.lng !== 0
        );
        setTrees(treesWithCoords);
      } catch (error) {
        console.error('Error loading trees:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrees();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isClient || loading) {
    return (
      <div className="h-96 bg-green-50 rounded-lg flex items-center justify-center">
        <div className="text-green-700 flex items-center gap-2">
          <span className="animate-spin">🌱</span>
          Loading map...
        </div>
      </div>
    );
  }

  if (trees.length === 0) {
    return (
      <div className="h-96 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
        <div className="text-center text-green-600">
          <div className="text-4xl mb-2">🗺️</div>
          <h3 className="text-lg font-medium mb-1">No Trees with Coordinates</h3>
          <p className="text-sm">Add trees with GPS coordinates to see them on the map</p>
        </div>
      </div>
    );
  }

  // Default center - use first tree's location or fallback
  const defaultCenter: [number, number] = trees.length > 0 
    ? [trees[0].lat, trees[0].lng]
    : [40.7128, -74.0060]; // New York as fallback

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-green-200 shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds trees={trees} />
        
        {trees.map((tree) => (
          <Marker
            key={tree.id}
            position={[tree.lat, tree.lng]}
            icon={createTreeIcon()}
          >
            <Popup className="tree-popup">
              <div className="p-2 min-w-48">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg">🌳</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800 text-base leading-tight">
                      {tree.species}
                    </h3>
                    {tree.scientificName && (
                      <p className="text-sm italic text-green-600 mt-1">
                        {tree.scientificName}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Planted: {formatDate(tree.date_planted)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                      {tree.plus_code_global}
                    </span>
                  </div>
                  
                  {tree.condition_notes && (
                    <div className="flex items-start gap-2 mt-2">
                      <span>🩺</span>
                      <span className="text-xs text-gray-500 line-clamp-2">
                        {tree.condition_notes}
                      </span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => onTreeSelect?.(tree)}
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded transition-colors duration-200"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
    </div>
  );
}