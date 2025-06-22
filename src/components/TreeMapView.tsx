'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Tree } from '@/types';
import { TreeService } from '@/services/treeService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EcosystemService } from '@/services/ecosystemService';
import { calculateTreeAge } from '@/lib/utils';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Enhanced tree icon with status colors
const createTreeIcon = (tree: Tree) => {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  
  // Get color based on verification status
  const getStatusColor = () => {
    switch (tree.verification_status) {
      case 'verified': return '#15803d'; // Green
      case 'manual': return '#2563eb'; // Blue  
      case 'pending': return '#d97706'; // Orange
      default: return '#6b7280'; // Gray
    }
  };

  // Get icon based on tree age or species
  const getTreeIcon = () => {
    const age = new Date().getFullYear() - new Date(tree.date_planted).getFullYear();
    if (age >= 5) return '🌳'; // Mature tree
    if (age >= 2) return '🌲'; // Medium tree
    return '🌱'; // Young tree
  };

  return L.divIcon({
    html: `
      <div style="
        width: 28px; 
        height: 28px; 
        background-color: ${getStatusColor()}; 
        border-radius: 50%; 
        border: 3px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s;
      " 
      onmouseover="this.style.transform='scale(1.2)'"
      onmouseout="this.style.transform='scale(1)'">
        <span style="color: white; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${getTreeIcon()}</span>
      </div>
    `,
    className: 'custom-tree-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
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
  const [filteredTrees, setFilteredTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');

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
        setFilteredTrees(treesWithCoords);
      } catch (error) {
        console.error('Error loading trees:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrees();
  }, []);

  // Filter trees based on status and species
  useEffect(() => {
    let filtered = trees;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tree => tree.verification_status === statusFilter);
    }

    // Filter by species
    if (speciesFilter !== 'all') {
      filtered = filtered.filter(tree => 
        (tree.commonName || tree.species).toLowerCase().includes(speciesFilter.toLowerCase())
      );
    }

    setFilteredTrees(filtered);
  }, [trees, statusFilter, speciesFilter]);

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

  // Get unique species for filter
  const uniqueSpecies = [...new Set(trees.map(tree => tree.commonName || tree.species))];

  // Default center - use first tree's location or fallback
  const defaultCenter: [number, number] = filteredTrees.length > 0 
    ? [filteredTrees[0].lat, filteredTrees[0].lng]
    : trees.length > 0 
    ? [trees[0].lat, trees[0].lng]
    : [40.7128, -74.0060]; // New York as fallback

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="bg-white rounded-lg border border-green-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-green-800">🗺️ Map View</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {filteredTrees.length} of {trees.length} trees
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">✅ Verified</SelectItem>
                <SelectItem value="manual">🔵 Manual</SelectItem>
                <SelectItem value="pending">🟡 Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Species Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Species:</span>
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                {uniqueSpecies.slice(0, 10).map(species => (
                  <SelectItem key={species} value={species}>{species}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          {(statusFilter !== 'all' || speciesFilter !== 'all') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setSpeciesFilter('all');
              }}
              className="h-8"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Map Container */}
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
        
        <MapBounds trees={filteredTrees} />
        
        {filteredTrees.map((tree) => (
          <Marker
            key={tree.id}
            position={[tree.lat, tree.lng]}
            icon={createTreeIcon(tree)}
          >
            <Popup className="tree-popup">
              <div className="p-3 min-w-56">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-xl">{calculateTreeAge(tree.date_planted).totalDays >= 1825 ? '🌳' : calculateTreeAge(tree.date_planted).totalDays >= 730 ? '🌲' : '🌱'}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800 text-base leading-tight">
                      {tree.commonName || tree.species}
                    </h3>
                    {tree.scientificName && (
                      <p className="text-sm italic text-green-600 mt-1">
                        {tree.scientificName}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      {tree.verification_status === 'verified' && <span className="text-xs text-green-600">✅ Verified</span>}
                      {tree.verification_status === 'manual' && <span className="text-xs text-blue-600">🔵 Manual</span>}
                      {tree.verification_status === 'pending' && <span className="text-xs text-orange-600">🟡 Pending</span>}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Planted: {formatDate(tree.date_planted)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span>🌱</span>
                    <span>Age: {calculateTreeAge(tree.date_planted).displayText}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                      {tree.plus_code_local}
                    </span>
                  </div>

                  {(() => {
                    const ecosystemCount = EcosystemService.getEcosystemSpeciesCount(tree.id);
                    return ecosystemCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span>🌍</span>
                        <span>{ecosystemCount} ecosystem species</span>
                      </div>
                    );
                  })()}
                  
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
    </div>
  );
}