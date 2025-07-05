import { encode, decode } from 'open-location-code';

export function generatePlusCode(lat: number, lng: number): { global: string; local: string } {
  try {
    const global = encode(lat, lng);
    const local = encode(lat, lng, 10); // 10-character code for local precision
    
    return {
      global,
      local: local.substring(4) // Remove the area code for local
    };
  } catch (error) {
    console.error('Error generating Plus Code:', error);
    return {
      global: '',
      local: ''
    };
  }
}

export function parsePlusCode(code: string): { lat: number; lng: number } | null {
  try {
    const decoded = decode(code);
    return {
      lat: decoded.latitudeCenter,
      lng: decoded.longitudeCenter
    };
  } catch (error) {
    console.error('Error parsing Plus Code:', error);
    return null;
  }
}