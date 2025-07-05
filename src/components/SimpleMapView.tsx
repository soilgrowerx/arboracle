import React from 'react';

interface SimpleMapViewProps {
  lat: number;
  lng: number;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export const SimpleMapView: React.FC<SimpleMapViewProps> = ({ lat, lng, onLocationSelect }) => {
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=14&output=embed`;

  const handleMapClick = (event: React.MouseEvent<HTMLIFrameElement>) => {
    // This is a simplified approach. A real interactive map would use a library
    // that provides click events with lat/lng. For an iframe, we can't directly
    // get the clicked coordinates. This is just a placeholder for the prop.
    console.log("Map clicked, but cannot get precise coordinates from iframe.");
    // If we had a way to get coordinates, we would call:
    // onLocationSelect?.(newLat, newLng);
  };

  return (
    <div style={{ width: '100%', height: '400px', overflow: 'hidden', position: 'relative' }}>
      <iframe
        width="100%"
        height="100%"
        src={mapUrl}
        frameBorder="0"
        style={{ border: 0 }}
        allowFullScreen={false}
        aria-hidden="false"
        tabIndex={0}
        onClick={handleMapClick}
      ></iframe>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0)', // Transparent overlay to capture clicks if needed
        zIndex: 1 // Ensure it's above the iframe if you want to capture clicks on this div
      }} onClick={handleMapClick}></div>
    </div>
  );
};
