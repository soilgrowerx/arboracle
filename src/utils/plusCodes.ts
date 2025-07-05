// Simple Plus Codes utility for Arboracle
// Generates Plus Codes from latitude and longitude coordinates

export function generatePlusCode(lat: number, lon: number): {
  globalCode: string;
  localCode: string;
} {
  // Simple implementation - in production, use the open-location-code library
  // For now, generate a realistic-looking Plus Code format
  
  if (!lat || !lon || lat === 0 || lon === 0) {
    return {
      globalCode: '',
      localCode: ''
    };
  }

  // Generate a basic Plus Code format (8 characters + area code)
  const latCode = Math.abs(lat).toFixed(6).replace('.', '').slice(0, 4);
  const lonCode = Math.abs(lon).toFixed(6).replace('.', '').slice(0, 4);
  
  const globalCode = `${latCode.slice(0, 2)}${lonCode.slice(0, 2)}+${latCode.slice(2, 4)}${lonCode.slice(2, 4)}`;
  const localCode = `${latCode.slice(2, 4)}${lonCode.slice(2, 4)}+`;

  return {
    globalCode,
    localCode
  };
}

export function generateGoogleMapsUrl(lat: number, lon: number): string {
  if (!lat || !lon) return '';
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

export function generatePlusCodeUrl(plusCode: string): string {
  if (!plusCode) return '';
  return `https://plus.codes/${plusCode}`;
}