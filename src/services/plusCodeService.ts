export interface PlusCodeResult {
  global: string;
  local: string;
}

export class PlusCodeService {
  static encode(latitude: number, longitude: number): PlusCodeResult {
    const global = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    const local = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    
    return {
      global,
      local
    };
  }

  static decode(code: string): { latitude: number; longitude: number; } {
    const [lat, lng] = code.split(',').map(Number);
    return {
      latitude: lat,
      longitude: lng
    };
  }

  static isValid(code: string): boolean {
    const parts = code.split(',');
    if (parts.length !== 2) return false;
    const [lat, lng] = parts.map(Number);
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  static isFull(code: string): boolean {
    return this.isValid(code);
  }

  static isShort(code: string): boolean {
    return false;
  }

  static recover(shortCode: string, referenceLatitude: number, referenceLongitude: number): string {
    return shortCode;
  }
}