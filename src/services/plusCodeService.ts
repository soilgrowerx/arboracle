import * as OpenLocationCodeLib from 'open-location-code';
const { OpenLocationCode } = OpenLocationCodeLib;

export interface PlusCodeResult {
  global: string;
  local: string;
}

export class PlusCodeService {
  private static olc = new OpenLocationCode();

  static encode(latitude: number, longitude: number): PlusCodeResult {
    const global = this.olc.encode(latitude, longitude);
    const local = this.olc.shorten(global, latitude, longitude);
    
    return {
      global,
      local: local || global
    };
  }

  static decode(code: string): { latitude: number; longitude: number; } {
    const decoded = this.olc.decode(code);
    return {
      latitude: decoded.latitudeCenter,
      longitude: decoded.longitudeCenter
    };
  }

  static isValid(code: string): boolean {
    return this.olc.isValid(code);
  }

  static isFull(code: string): boolean {
    return this.olc.isFull(code);
  }

  static isShort(code: string): boolean {
    return this.olc.isShort(code);
  }

  static recover(shortCode: string, referenceLatitude: number, referenceLongitude: number): string {
    return this.olc.recoverNearest(shortCode, referenceLatitude, referenceLongitude);
  }
}