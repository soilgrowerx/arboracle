'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tree } from '@/types/tree';
import { TreeService } from '@/services/treeService';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, GroundOverlayF } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EcosystemService } from '@/services/ecosystemService';
import { calculateTreeAge } from '@/lib/utils';
import { SkyFiService } from '@/services/skyfiService';

interface TreeMapViewProps {
  onTreeSelect?: (tree: Tree) => void;
  filteredTrees?: Tree[];
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultMapOptions = {
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
};

export function TreeMapView({ onTreeSelect, filteredTrees: externalFilteredTrees }: TreeMapViewProps) {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [filteredTrees, setFilteredTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [overlayImageUrl, setOverlayImageUrl] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Tree | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const getTreeIcon = (age: number) => {
    if (age < 5) return '/images/tree-icon-young.png';
    if (age >= 5 && age < 20) return '/images/tree-icon-medium.png';
    return '/images/tree-icon-mature.png';
  };

  const handleMarkerClick = (tree: Tree) => {
    setSelectedMarker(tree);
    if (onTreeSelect) {
      onTreeSelect(tree);
    }
  };

  const handleMapClick = () => {
    setSelectedMarker(null);
  };

  useEffect(() => {
    setIsClient(true);
    const loadTrees = () => {
      try {
        const allTrees = TreeService.getAllTrees();
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

  useEffect(() => {
    if (externalFilteredTrees) {
      setFilteredTrees(externalFilteredTrees);
      return;
    }

    let filtered = trees;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tree => tree.verification_status === statusFilter);
    }

    if (speciesFilter !== 'all') {
      filtered = filtered.filter(tree => 
        (tree.commonName || tree.species).toLowerCase().includes(speciesFilter.toLowerCase())
      );
    }

    setFilteredTrees(filtered);
  }, [trees, statusFilter, speciesFilter, externalFilteredTrees]);

  useEffect(() => {
    if (selectedOverlay && filteredTrees.length > 0) {
      const centerTree = filteredTrees[0]; // Use the first filtered tree as center for overlay fetch
      SkyFiService.fetchOverlay(centerTree.lat, centerTree.lng, selectedOverlay)
        .then(url => {
          setOverlayImageUrl(url);
        })
        .catch(error => {
          console.error('Error fetching overlay:', error);
          setOverlayImageUrl(null);
        });
    } else {
      setOverlayImageUrl(null);
    }
  }, [selectedOverlay, filteredTrees]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isLoaded || !isClient || loading) {
    return (
      <div className="h-96 bg-green-50 rounded-lg flex items-center justify-center">
        <div className="text-green-700 flex items-center gap-2">
          <span className="animate-spin">🌱</span>
          Loading map...
        </div>
      </div>
    );
  }

  const showEmptyState = trees.length === 0;

  const uniqueSpecies = [...new Set(trees.map(tree => tree.commonName || tree.species))];

  const defaultCenter = useMemo(() => ({
    lat: filteredTrees.length > 0 ? filteredTrees[0].lat : (trees.length > 0 ? trees[0].lat : 40.7128),
    lng: filteredTrees.length > 0 ? filteredTrees[0].lng : (trees.length > 0 ? trees[0].lng : -74.0060),
  }), [filteredTrees, trees]);

  return (
    <div className="space-y-4">
      {!externalFilteredTrees && (
      <div className="bg-white rounded-lg border border-green-200 mobile-card-content shadow-sm">
        <div className="map-controls-mobile mb-3">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <span className="mobile-header font-semibold text-green-800">🗺️ Map View</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700 mobile-text">
              {filteredTrees.length} of {trees.length} trees
            </Badge>
          </div>
        </div>
        
        <div className="map-controls-mobile">
          <div className="flex items-center mobile-gap">
            <span className="mobile-text text-gray-700 min-w-fit">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="map-filter-mobile touch-target">
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
          <div className="flex items-center mobile-gap">
            <span className="mobile-text text-gray-700 min-w-fit">Species:</span>
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger className="map-filter-mobile touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                {uniqueSpecies.slice(0, 10).map(species => (
                  <SelectItem key={species} value={species} className="mobile-text">{species}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Overlay Selection */}
          <div className="flex items-center mobile-gap">
            <span className="mobile-text text-gray-700 min-w-fit">Overlay:</span>
            <Select value={selectedOverlay || 'none'} onValueChange={setSelectedOverlay}>
              <SelectTrigger className="map-filter-mobile touch-target">
                <SelectValue placeholder="Select Overlay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="canopy_coverage">Canopy Coverage</SelectItem>
                <SelectItem value="heat_stress">Heat Stress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          
        </div>
      </div>
      )}

      <div className="bg-white rounded-lg border border-green-200 mobile-card-content shadow-sm">
        <div className="map-legend-mobile">
          <div className="map-legend-mobile">
            <span className="mobile-text font-semibold text-green-800">Legend:</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-600 border-2 border-white shadow-sm"></div>
              <span className="mobile-text text-gray-700">Verified</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
              <span className="mobile-text text-gray-700">Manual</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-600 border-2 border-white shadow-sm"></div>
              <span className="mobile-text text-gray-700">Pending</span>
            </div>
          </div>
          <div className="map-legend-mobile border-t sm:border-t-0 sm:border-l border-gray-200 pt-2 sm:pt-0 sm:pl-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-sm sm:text-lg">🌱</span>
              <span className="mobile-text text-gray-600">Young</span>
              <span className="text-sm sm:text-lg">🌲</span>
              <span className="mobile-text text-gray-600">Medium</span>
              <span className="text-sm sm:text-lg">🌳</span>
              <span className="mobile-text text-gray-600">Mature</span>
            </div>
          </div>
          <div className="map-legend-mobile border-t sm:border-t-0 pt-2 sm:pt-0">
            <div className="flex items-center gap-1 sm:gap-2 mobile-text text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-lg border border-blue-200">
              <span className="text-sm sm:text-lg">🛰️</span>
              <span className="font-medium hidden sm:inline">High-res satellite imagery & terrain maps - use</span>
              <span className="font-medium sm:hidden">Use</span>
              <span className="inline-flex items-center gap-1 bg-green-600 text-white px-1 sm:px-2 py-1 rounded text-xs font-semibold">
                📋 <span className="hidden xs:inline">Layer Control</span>
              </span>
              <span className="font-medium hidden sm:inline">for layers</span>
              <span className="font-medium sm:hidden">for layers</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`map-container-mobile w-full rounded-lg overflow-hidden border border-green-200 shadow-sm relative ${externalFilteredTrees ? 'sm:h-[600px]' : 'sm:h-[500px]'}`}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={defaultMapOptions}
          onClick={handleMapClick}
        >
          {filteredTrees.map((tree) => (
            <MarkerF
              key={tree.id}
              position={{ lat: tree.lat, lng: tree.lng }}
              onClick={() => handleMarkerClick(tree)}
              icon={{
                url: getTreeIcon(calculateTreeAge(tree.date_planted).years),
                scaledSize: new google.maps.Size(32, 32),
              }}
            />
          ))}

          {selectedMarker && (
            <InfoWindowF
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2">
                <h2 className="font-bold text-lg">{selectedMarker.commonName || selectedMarker.species}</h2>
                <p>{selectedMarker.scientificName}</p>
                <p>Age: {calculateTreeAge(selectedMarker.date_planted).displayText}</p>
                <button
                  onClick={() => onTreeSelect && onTreeSelect(selectedMarker)}
                  className="text-blue-500 hover:underline mt-2"
                >
                  View Details
                </button>
              </div>
            </InfoWindowF>
          )}

          {overlayImageUrl && (
            <GroundOverlayF
              url={overlayImageUrl}
              bounds={{
                north: defaultCenter.lat + 0.1, // Placeholder bounds, adjust as needed
                south: defaultCenter.lat - 0.1,
                east: defaultCenter.lng + 0.1,
                west: defaultCenter.lng - 0.1,
              }}
            />
          )}
        </GoogleMap>
      
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