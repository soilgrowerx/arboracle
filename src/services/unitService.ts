export type UnitSystem = 'metric' | 'imperial';

const UNIT_SYSTEM_STORAGE_KEY = 'arboracle_unit_system';

export class UnitService {
  static getPreferredUnitSystem(): UnitSystem {
    if (typeof window === 'undefined') {
      return 'imperial'; // Default for SSR or non-browser environments
    }
    const storedUnitSystem = localStorage.getItem(UNIT_SYSTEM_STORAGE_KEY);
    return (storedUnitSystem as UnitSystem) || 'imperial';
  }

  static setPreferredUnitSystem(unitSystem: UnitSystem): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(UNIT_SYSTEM_STORAGE_KEY, unitSystem);
  }

  static convertCmToIn(cm: number): number {
    return cm / 2.54;
  }

  static convertInToCm(inch: number): number {
    return inch * 2.54;
  }

  static convertMToFt(m: number): number {
    return m * 3.28084;
  }

  static convertFtToM(ft: number): number {
    return ft / 3.28084;
  }

  static getUnitLabels(unitSystem: UnitSystem): {
    height: string;
    dbh: string;
    canopy: string;
  } {
    if (unitSystem === 'imperial') {
      return {
        height: 'Height (ft)',
        dbh: 'DBH (in)',
        canopy: 'Canopy Spread (ft)',
      };
    } else {
      return {
        height: 'Height (cm)',
        dbh: 'DBH (cm)',
        canopy: 'Canopy Spread (cm)',
      };
    }
  }
}
