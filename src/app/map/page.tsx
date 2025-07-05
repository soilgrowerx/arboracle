'use client';

import React, { useState, useEffect } from 'react';
import { LocationPickerMap } from '@/components/LocationPickerMap';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';

export default function FullScreenMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLat = parseFloat(searchParams.get('lat') || '0');
  const initialLng = parseFloat(searchParams.get('lng') || '0');

  const [selectedLocation, setSelectedLocation] = useState({
    lat: initialLat,
    lng: initialLng,
  });

  useEffect(() => {
    setSelectedLocation({ lat: initialLat, lng: initialLng });
  }, [initialLat, initialLng]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleConfirmLocation = () => {
    // Pass the selected location back to the previous page (AddTreeModal)
    // This can be done via localStorage, a global state management, or URL params
    // For simplicity, we'll use localStorage for now.
    localStorage.setItem('selectedMapLocation', JSON.stringify(selectedLocation));
    router.back(); // Go back to the previous page
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="flex items-center justify-between p-4 bg-white shadow-md z-10">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Pick Location on Map</h1>
        <Button onClick={handleConfirmLocation} className="flex items-center gap-2">
          <Check className="h-4 w-4" /> Confirm
        </Button>
      </div>
      <div className="flex-grow">
        <LocationPickerMap
          initialLat={selectedLocation.lat}
          initialLng={selectedLocation.lng}
          onLocationSelect={handleLocationSelect}
        />
      </div>
    </div>
  );
}
