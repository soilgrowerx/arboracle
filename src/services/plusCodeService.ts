import { OpenLocationCode } from 'open-location-code';

export interface PlusCodeResult {
  global: string;
  local: string;
}

export class PlusCodeService {
  static encode(latitude: number, longitude: number): PlusCodeResult {
    const global = OpenLocationCode.encode(latitude, longitude);
    const local = OpenLocationCode.shorten(global, latitude, longitude);
    
    return {
      global,
      local: local || global
    };
  }

  static decode(code: string): { latitude: number; longitude: number; } {
    const decoded = OpenLocationCode.decode(code);
    return {
      latitude: decoded.latitudeCenter,
      longitude: decoded.longitudeCenter
    };
  }

  static isValid(code: string): boolean {
    return OpenLocationCode.isValid(code);
  }

  static isFull(code: string): boolean {
    return OpenLocationCode.isFull(code);
  }

  static isShort(code: string): boolean {
    return OpenLocationCode.isShort(code);
  }

  static recover(shortCode: string, referenceLatitude: number, referenceLongitude: number): string {
    return OpenLocationCode.recoverNearest(shortCode, referenceLatitude, referenceLongitude);
  }
}