declare module 'open-location-code' {
  export class OpenLocationCode {
    constructor();
    encode(latitude: number, longitude: number, codeLength?: number): string;
    decode(code: string): {
      latitudeLo: number;
      longitudeLo: number;
      latitudeHi: number;
      longitudeHi: number;
      latitudeCenter: number;
      longitudeCenter: number;
      codeLength: number;
    };
    shorten(code: string, latitude: number, longitude: number): string;
    recoverNearest(shortCode: string, referenceLatitude: number, referenceLongitude: number): string;
    isValid(code: string): boolean;
    isFull(code: string): boolean;
    isShort(code: string): boolean;
  }
}