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

// Extensible tile layer configuration for future Earth Engine integration
interface TileLayerConfig {
  name: string;
  url: string;
  attribution: string;
  maxZoom?: number;
  opacity?: number;
  className?: string;
  type: 'base' | 'overlay';
  checked?: boolean;
}

const TILE_LAYERS: TileLayerConfig[] = [
  {
    name: "🗺️ Street Map",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    type: 'base',
    checked: true
  },
  {
    name: "🛰️ Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
    type: 'base'
  },
  {
    name: "🏷️ Street Labels",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: 'Labels from OpenStreetMap',
    opacity: 0.6,
    className: 'labels-overlay',
    type: 'overlay'
  },
  {
    name: "🛣️ Transportation",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Transportation overlay from Esri',
    opacity: 0.8,
    className: 'transportation-overlay',
    type: 'overlay'
  }
  // Future Earth Engine layers can be added here:
  // {
  //   name: "🌍 NDVI Analysis",
  //   url: "https://earthengine.googleapis.com/v1alpha/projects/{projectId}/maps/{mapId}/tiles/{z}/{x}/{y}",
  //   attribution: 'Earth Engine NDVI Analysis',
  //   type: 'overlay'
  // }
];

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const LayersControl = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), { ssr: false });
const BaseLayer = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl.BaseLayer), { ssr: false });
const Overlay = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl.Overlay), { ssr: false });
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
  filteredTrees?: Tree[];
}

export function TreeMapView({ onTreeSelect, filteredTrees: externalFilteredTrees }: TreeMapViewProps) {
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

  // Filter trees based on status and species (only if external filtered trees not provided)
  useEffect(() => {
    if (externalFilteredTrees) {
      setFilteredTrees(externalFilteredTrees);
      return;
    }

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
  }, [trees, statusFilter, speciesFilter, externalFilteredTrees]);

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

  // Show empty state overlay if no trees, but still show the map
  const showEmptyState = trees.length === 0;

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
      {/* Map Controls - only show if no external filtering */}
      {!externalFilteredTrees && (
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
      )}

      {/* Map Legend & Controls */}
      <div className="bg-white rounded-lg border border-green-200 p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold text-green-800">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600 border-2 border-white shadow-sm"></div>
              <span className="text-sm text-gray-700">Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
              <span className="text-sm text-gray-700">Manual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-600 border-2 border-white shadow-sm"></div>
              <span className="text-sm text-gray-700">Pending</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-lg">🌱</span>
              <span className="text-sm text-gray-600">Young (&lt;2y)</span>
              <span className="text-lg">🌲</span>
              <span className="text-sm text-gray-600">Medium (2-5y)</span>
              <span className="text-lg">🌳</span>
              <span className="text-sm text-gray-600">Mature (5y+)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
            <span className="text-lg">🛰️</span>
            <span className="font-medium">Satellite view available - use layer control (top-right)</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className={`${externalFilteredTrees ? 'h-[600px]' : 'h-[500px]'} w-full rounded-lg overflow-hidden border border-green-200 shadow-sm relative`}>
        <MapContainer
          center={defaultCenter}
          zoom={showEmptyState ? 8 : 10}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-container"
        >
          <LayersControl position="topright">
            {/* Dynamically render base layers */}
            {TILE_LAYERS.filter(layer => layer.type === 'base').map((layer) => (
              <BaseLayer 
                key={layer.name}
                checked={layer.checked}
                name={layer.name}
              >
                <TileLayer
                  attribution={layer.attribution}
                  url={layer.url}
                  maxZoom={layer.maxZoom}
                  opacity={layer.opacity}
                  className={layer.className}
                />
              </BaseLayer>
            ))}
            
            {/* Dynamically render overlay layers */}
            {TILE_LAYERS.filter(layer => layer.type === 'overlay').map((layer) => (
              <Overlay 
                key={layer.name}
                name={layer.name}
              >
                <TileLayer
                  attribution={layer.attribution}
                  url={layer.url}
                  maxZoom={layer.maxZoom}
                  opacity={layer.opacity}
                  className={layer.className}
                />
              </Overlay>
            ))}
          </LayersControl>
          
          {!showEmptyState && <MapBounds trees={filteredTrees} />}
          
          {filteredTrees.map((tree) => (
            <Marker
              key={tree.id}
              position={[tree.lat, tree.lng]}
              icon={createTreeIcon(tree)}
            >
              <Popup className="enhanced-tree-popup" maxWidth={320} minWidth={280}>
              <div className="enhanced-popup-content">
                {/* Header Section with Gradient */}
                <div className="popup-header">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="tree-icon-large">
                      {calculateTreeAge(tree.date_planted).totalDays >= 1825 ? '🌳' : calculateTreeAge(tree.date_planted).totalDays >= 730 ? '🌲' : '🌱'}
                    </div>
                    <div className="flex-1">
                      <h3 className="popup-title">
                        {tree.commonName || tree.species}
                      </h3>
                      {tree.scientificName && (
                        <p className="popup-scientific-name">
                          {tree.scientificName}
                        </p>
                      )}
                    </div>
                    <div className="status-indicator">
                      {tree.verification_status === 'verified' && <span className="status-verified">✅</span>}
                      {tree.verification_status === 'manual' && <span className="status-manual">🔵</span>}
                      {tree.verification_status === 'pending' && <span className="status-pending">🟡</span>}
                    </div>
                  </div>
                  
                  {/* Health Status Indicator */}
                  {(() => {
                    const ecosystemCount = EcosystemService.getEcosystemSpeciesCount(tree.id);
                    const age = calculateTreeAge(tree.date_planted);
                    const hasScientificName = !!tree.scientificName;
                    const isVerified = tree.verification_status === 'verified';
                    
                    // Calculate simple health score
                    let healthScore = 0;
                    if (isVerified) healthScore += 30;
                    if (hasScientificName) healthScore += 20;
                    if (age.totalDays > 365) healthScore += 25;
                    if (ecosystemCount > 0) healthScore += 25;
                    
                    const getHealthStatus = () => {
                      if (healthScore >= 80) return { label: 'Excellent', emoji: '💚', color: 'text-green-600' };
                      if (healthScore >= 60) return { label: 'Good', emoji: '💛', color: 'text-yellow-600' };
                      if (healthScore >= 40) return { label: 'Fair', emoji: '🧡', color: 'text-orange-600' };
                      return { label: 'Basic', emoji: '❤️', color: 'text-red-600' };
                    };
                    
                    const health = getHealthStatus();
                    
                    return (
                      <div className="health-indicator">
                        <span className={`health-emoji ${health.color}`}>{health.emoji}</span>
                        <span className={`health-text ${health.color}`}>Data Quality: {health.label}</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Content Section */}
                <div className="popup-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-icon">📅</span>
                      <span className="info-text">Planted: {formatDate(tree.date_planted)}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-icon">🕐</span>
                      <span className="info-text">Age: {calculateTreeAge(tree.date_planted).displayText}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-icon">📍</span>
                      <div className="plus-code-container">
                        <div className="plus-code-label">Plus Code:</div>
                        <div className="plus-code-global">{tree.plus_code_global}</div>
                        <div className="plus-code-local">{tree.plus_code_local}</div>
                      </div>
                    </div>

                    {(() => {
                      const ecosystemCount = EcosystemService.getEcosystemSpeciesCount(tree.id);
                      return ecosystemCount > 0 && (
                        <div className="info-item">
                          <span className="info-icon">🌍</span>
                          <span className="info-text">{ecosystemCount} ecosystem species documented</span>
                        </div>
                      );
                    })()}
                    
                    {tree.condition_notes && (
                      <div className="info-item condition-notes">
                        <span className="info-icon">🩺</span>
                        <span className="info-text">{tree.condition_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="popup-footer">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onTreeSelect?.(tree)}
                      className="view-details-btn"
                    >
                      <span className="btn-icon">🔍</span>
                      <span className="btn-text">Details</span>
                    </button>
                    {tree.iNaturalist_link && (
                      <button
                        onClick={() => window.open(tree.iNaturalist_link, '_blank', 'noopener,noreferrer')}
                        className="view-details-btn bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        <span className="btn-icon">🔬</span>
                        <span className="btn-text">iNaturalist</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Empty State Overlay */}
      {showEmptyState && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center text-green-600 p-8">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Interactive Map Ready</h3>
            <p className="text-green-700 mb-4">
              Your map is ready! Add trees with GPS coordinates to see them plotted here.
            </p>
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              💡 <strong>Tip:</strong> Click &quot;Add Tree&quot; and use the map picker to place your first tree!
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}