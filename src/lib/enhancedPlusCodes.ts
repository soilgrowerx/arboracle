import { encode, decode } from 'open-location-code';

export interface PlusCodeData {
  global: string;
  local: string;
  precise: string; // Up to 15 characters for extreme accuracy
  treeAddress: string; // Human-readable tree address
  soilResponsibilityArea: number; // Area in square meters
}

export function generateEnhancedPlusCode(lat: number, lng: number, precision: number = 11): PlusCodeData {
  try {
    // Generate codes at different precision levels
    const global = encode(lat, lng, 10); // Standard global code
    const local = encode(lat, lng, 10).substring(4); // Local code without area prefix
    const precise = encode(lat, lng, Math.min(precision, 15)); // Up to 15 characters for extreme accuracy
    
    // Calculate soil responsibility area based on precision
    const soilResponsibilityArea = calculateSoilArea(precision);
    
    // Generate human-readable tree address
    const treeAddress = generateTreeAddress(global, precise);
    
    return {
      global,
      local,
      precise,
      treeAddress,
      soilResponsibilityArea
    };
  } catch (error) {
    console.error('Error generating Plus Code:', error);
    return {
      global: '',
      local: '',
      precise: '',
      treeAddress: '',
      soilResponsibilityArea: 0
    };
  }
}

export function calculateSoilArea(precision: number): number {
  // Plus code precision to area mapping (approximate square meters)
  const precisionToArea: { [key: number]: number } = {
    8: 196000000, // ~196 km squared
    10: 196, // ~196 m squared
    11: 9.8, // ~9.8 m squared
    12: 0.39, // ~0.39 m squared
    13: 0.015, // ~0.015 m squared
    14: 0.0006, // ~0.0006 m squared
    15: 0.000025 // ~0.000025 m squared
  };
  
  return precisionToArea[precision] || precisionToArea[11];
}

export function generateTreeAddress(globalCode: string, preciseCode: string): string {
  // Create a human-readable address for the tree
  const areaCode = globalCode.substring(0, 4);
  const localCode = globalCode.substring(4);
  const extraPrecision = preciseCode.substring(globalCode.length);
  
  return `Tree Address: ${areaCode}+${localCode}${extraPrecision}`;
}

export function getPrecisionForTreeSize(dbh_cm: number): number {
  // Adjust precision based on tree size - larger trees get larger soil responsibility areas
  if (dbh_cm < 10) return 13; // Young tree - very precise area
  if (dbh_cm < 30) return 12; // Small tree
  if (dbh_cm < 60) return 11; // Medium tree
  if (dbh_cm < 100) return 10; // Large tree
  return 9; // Massive tree - larger responsibility area
}

export function formatSoilArea(area: number): string {
  if (area >= 1000000) {
    return `${(area / 1000000).toFixed(2)} km²`;
  } else if (area >= 1) {
    return `${area.toFixed(2)} m²`;
  } else {
    return `${(area * 10000).toFixed(2)} cm²`;
  }
}