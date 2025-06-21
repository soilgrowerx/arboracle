import { OpenLocationCode } from 'open-location-code';

export interface PlusCodeResult {
  global: string;
  local: string;
}

const olc = new OpenLocationCode();

export class PlusCodeService {
  static encode(latitude: number, longitude: number): PlusCodeResult {
    const global = olc.encode(latitude, longitude);
    const local = olc.encode(latitude, longitude, 10); // 10-character code for local use
    
    return {
      global,
      local
    };
  }

  static decode(code: string): { latitude: number; longitude: number; } {
    const decoded = olc.decode(code);
    return {
      latitude: decoded.latitudeCenter,
      longitude: decoded.longitudeCenter
    };
  }

  static isValid(code: string): boolean {
    return olc.isValid(code);
  }

  static isFull(code: string): boolean {
    return olc.isFull(code);
  }

  static isShort(code: string): boolean {
    return olc.isShort(code);
  }

  static recover(shortCode: string, referenceLatitude: number, referenceLongitude: number): string {
    return olc.recoverNearest(shortCode, referenceLatitude, referenceLongitude);
  }
}