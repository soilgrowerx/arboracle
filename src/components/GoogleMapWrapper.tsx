'use client';

import React, { useCallback, useRef } from 'react';
import { GoogleMap, Marker, StandaloneSearchBox, InfoWindow, useLoadScript } from '@react-google-maps/api';

interface GoogleMapWrapperProps {
  formData: any; // Replace 'any' with your actual FormData type
  setFormData: React.Dispatch<React.SetStateAction<any>>; // Replace 'any'
  toast: any; // Replace 'any' with your actual toast type
  showLocationMap: boolean;
  mapOptions: google.maps.MapOptions;
  selectedMarker: any; // Replace 'any'
  setSelectedMarker: React.Dispatch<React.SetStateAction<any>>; // Replace 'any'
  onTreeSelect?: (tree: any) => void; // Replace 'any'
}

const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({
  formData,
  setFormData,
  toast,
  showLocationMap,
  mapOptions,
  selectedMarker,
  setSelectedMarker,
  onTreeSelect,
}) => {
  const { isLoaded } = useLoadScript({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const onMapLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = null;
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setFormData((prev: any) => ({
        ...prev,
        location: { lat: e.latLng!.lat(), lng: e.latLng!.lng() }
      }));
      toast({
        title: "Location Selected",
        description: `Coordinates set to ${e.latLng!.lat().toFixed(6)}, ${e.latLng!.lng().toFixed(6)}`,
      });
    }
  }, [setFormData, toast]);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setFormData((prev: any) => ({
        ...prev,
        location: { ...prev.location, lat: e.latLng!.lat(), lng: e.latLng!.lng() }
      }));
      toast({
        title: "Location Updated",
        description: `Coordinates updated to ${e.latLng!.lat().toFixed(6)}, ${e.latLng!.lng().toFixed(6)}`,
      });
    }
  }, [setFormData, toast]);

  const onPlacesChanged = useCallback(() => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          setFormData((prev: any) => ({
            ...prev,
            location: { lat: place.geometry!.location!.lat(), lng: place.geometry!.location!.lng() }
          }));
          if (mapRef.current) {
            mapRef.current.panTo(place.geometry.location);
            mapRef.current.setZoom(15);
          }
          toast({
            title: "Location Found",
            description: `Map centered on ${place.name || place.formatted_address}`,
          });
        }
      }
    }
  }, [setFormData, toast]);

  const defaultCenter = React.useMemo(() => ({
    lat: formData.location.lat !== 0 ? formData.location.lat : 40.7128,
    lng: formData.location.lng !== 0 ? formData.location.lng : -74.0060,
  }), [formData.location]);

  if (!isLoaded) {
    return (
      <div className="h-48 sm:h-64 w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Loading Map...</p>
      </div>
    );
  }

  return (
    <div className="mt-3 sm:mt-4 border border-green-200 rounded-lg overflow-hidden">
      <div className="bg-green-50 px-3 sm:px-4 py-2 border-b border-green-200">
        <p className="text-xs sm:text-sm text-green-700 font-medium">📍 Click on the map to set tree location or use search</p>
      </div>
      <div className="h-48 sm:h-64 w-full relative">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={defaultCenter}
          zoom={13}
          onLoad={onMapLoad}
          onUnmount={onMapUnmount}
          onClick={onMapClick}
          options={mapOptions}
        >
          {formData.location.lat !== 0 && formData.location.lng !== 0 && (
            <Marker
              position={{ lat: formData.location.lat, lng: formData.location.lng }}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
            />
          )}
          <StandaloneSearchBox
            onLoad={ref => searchBoxRef.current = ref}
            onPlacesChanged={onPlacesChanged}
          >
            <input
              type="text"
              placeholder="Search for a location..."
              className="box-border border border-gray-300 shadow-md rounded-md px-3 py-2 w-full absolute top-2 left-1/2 -translate-x-1/2 z-10 focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ width: 'calc(100% - 20px)', maxWidth: '400px' }}
            />
          </StandaloneSearchBox>
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2">
                <h2 className="font-bold text-lg">{selectedMarker.commonName || selectedMarker.species}</h2>
                <p>{selectedMarker.scientificName}</p>
                <button
                  onClick={() => onTreeSelect && onTreeSelect(selectedMarker)}
                  className="text-blue-500 hover:underline mt-2"
                >
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
      <div className="bg-green-50 px-3 sm:px-4 py-2 border-t border-green-200">
        <p className="text-xs text-green-600">
          💡 Tip: You can also enter coordinates manually in the fields above
        </p>
      </div>
    </div>
  );
};

export default GoogleMapWrapper;
