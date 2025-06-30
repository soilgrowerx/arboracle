// src/components/SimpleMapView.tsx
import React from 'react';

interface SimpleMapViewProps {
  latitude: number;
  longitude: number;
  onMapClick: (lat: number, lng: number) => void;
}

export function SimpleMapView({ latitude, longitude, onMapClick }: SimpleMapViewProps) {
  // This is a placeholder component.
  // In a real application, you would integrate a map library here (e.g., Leaflet, OpenLayers, or a simplified Google Maps setup).
  // For now, it just displays the coordinates and simulates a clickable map.

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Simulate a click on the map by using the current center coordinates
    // In a real map, you would get the clicked coordinates from the event
    onMapClick(latitude, longitude);
  };

  return (
    <div
      className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-center cursor-pointer"
      style={{
        backgroundImage: 'url("https://via.placeholder.com/400x250?text=Simple+Map+View")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={handleClick}
    >
      <div>
        <p className="font-bold text-lg">Map Placeholder</p>
        <p>Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}</p>
        <p className="text-sm mt-2">(Click to simulate location selection)</p>
      </div>
    </div>
  );
}
