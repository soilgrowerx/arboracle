import { OpenLocationCode } from 'open-location-code';

export interface PlusCodeResult {
  global: string;
  local: string;
  short: string;
  areaSize: string;
  precision: number;
}

const olc = new OpenLocationCode();

export class PlusCodeService {
  static encode(latitude: number, longitude: number, precision: number = 12): PlusCodeResult {
    const global = olc.encode(latitude, longitude, precision);
    const local = olc.encode(latitude, longitude, 10); // 10-character code for local use
    const short = olc.shorten(global, latitude, longitude);
    const areaSize = this.getAreaSize(precision);
    
    return {
      global,
      local,
      short,
      areaSize,
      precision
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

  static getAreaSize(precision: number): string {
    const areaSizes: { [key: number]: string } = {
      2: '~2500 km × 2000 km',
      4: '~250 km × 200 km', 
      6: '~25 km × 20 km',
      8: '~2.5 km × 2 km',
      10: '~250 m × 200 m',
      11: '~125 m × 100 m',
      12: '~25 m × 20 m (Pinpoint Tree Accuracy)',
      13: '~12.5 m × 10 m',
      14: '~2.5 m × 2 m',
      15: '~1.25 m × 1 m'
    };
    return areaSizes[precision] || '~25 m × 20 m (Pinpoint Tree Accuracy)';
  }

  static getPrecisionInfo(precision: number): { level: string; description: string; suitable: string } {
    const precisionInfo: { [key: number]: { level: string; description: string; suitable: string } } = {
      10: { level: 'Standard', description: 'Building-level accuracy', suitable: 'General mapping' },
      11: { level: 'Enhanced', description: 'Room-level accuracy', suitable: 'Detailed location' },
      12: { level: 'Pinpoint', description: 'Individual tree accuracy', suitable: 'Tree identification' },
      13: { level: 'Ultra-precise', description: 'Sub-tree precision', suitable: 'Research applications' },
      14: { level: 'Meter-level', description: 'Exact positioning', suitable: 'Scientific studies' },
      15: { level: 'Sub-meter', description: 'Survey-grade precision', suitable: 'Professional surveying' }
    };
    return precisionInfo[precision] || { level: 'Pinpoint', description: 'Individual tree accuracy', suitable: 'Tree identification' };
  }

  static formatForDisplay(code: string, showFull: boolean = false): string {
    if (showFull) {
      return code;
    }
    // Show shortened version for display
    return code.length > 11 ? code.substring(0, 8) + '+' + code.substring(8) : code;
  }

  static copyToClipboard(code: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(code)
        .then(() => true)
        .catch(() => false);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return Promise.resolve(true);
      } catch (err) {
        document.body.removeChild(textArea);
        return Promise.resolve(false);
      }
    }
  }
}