'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Tree } from '@/types/tree';
import { getTreeIcon } from '@/lib/utils';

interface TreeMapViewProps {
  onTreeSelect: (tree: Tree) => void;
  trees?: Tree[]; // Assuming trees will be passed to display on the map
}

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100% - 80px)', // Adjust height to accommodate the info text below
};

const defaultCenter = {
  lat: 34.052235, // Default to Los Angeles for now
  lng: -118.243683,
};

export const TreeMapView: React.FC<TreeMapViewProps> = ({ onTreeSelect, trees = [] }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ["places"], // Add any necessary libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {trees.map((tree) => (
          <Marker
            key={tree.id}
            position={{ lat: tree.lat, lng: tree.lng }}
            onClick={() => onTreeSelect(tree)}
            icon={getTreeIcon(tree)}
          />
        ))}
      </GoogleMap>
      <div className="p-4 bg-white border-t">
        <p className="text-sm text-gray-600">
          This map now displays trees from your inventory. Click on a tree marker to view its details.
        </p>
      </div>
    </div>
  );
};

export default TreeMapView;