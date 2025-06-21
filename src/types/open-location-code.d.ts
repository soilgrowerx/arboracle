declare module 'open-location-code' {
  export class OpenLocationCode {
    static encode(latitude: number, longitude: number, codeLength?: number): string;
    static decode(code: string): {
      latitudeLo: number;
      longitudeLo: number;
      latitudeHi: number;
      longitudeHi: number;
      latitudeCenter: number;
      longitudeCenter: number;
      codeLength: number;
    };
    static shorten(code: string, latitude: number, longitude: number): string;
    static recoverNearest(shortCode: string, referenceLatitude: number, referenceLongitude: number): string;
    static isValid(code: string): boolean;
    static isFull(code: string): boolean;
    static isShort(code: string): boolean;
  }
}