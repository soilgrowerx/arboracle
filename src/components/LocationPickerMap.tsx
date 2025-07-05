'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

interface LocationPickerMapProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = {
  lat: 34.052235, // Default to Los Angeles
  lng: -118.243683,
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialLat,
  initialLng,
  onLocationSelect,
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ["places"],
  });

  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: initialLat || defaultCenter.lat,
    lng: initialLng || defaultCenter.lng,
  });

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setMarkerPosition({ lat: newLat, lng: newLng });
        onLocationSelect(newLat, newLng);
      }
    },
    [onLocationSelect]
  );

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={markerPosition.lat && markerPosition.lng ? markerPosition : defaultCenter}
      zoom={10}
      onClick={onMapClick}
    >
      {markerPosition.lat && markerPosition.lng && (
        <Marker position={markerPosition} />
      )}
    </GoogleMap>
  );
};
