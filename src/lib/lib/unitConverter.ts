export const convertLength = (value: number, fromUnit: 'cm' | 'm' | 'in' | 'ft', toUnit: 'cm' | 'm' | 'in' | 'ft'): number => {
  if (fromUnit === toUnit) {
    return value;
  }

  // Convert to a base unit (e.g., cm) first
  let valueInCm: number;
  switch (fromUnit) {
    case 'cm':
      valueInCm = value;
      break;
    case 'm':
      valueInCm = value * 100;
      break;
    case 'in':
      valueInCm = value * 2.54;
      break;
    case 'ft':
      valueInCm = value * 30.48;
      break;
    default:
      throw new Error(`Unsupported fromUnit: ${fromUnit}`);
  }

  // Convert from base unit to target unit
  switch (toUnit) {
    case 'cm':
      return valueInCm;
    case 'm':
      return valueInCm / 100;
    case 'in':
      return valueInCm / 2.54;
    case 'ft':
      return valueInCm / 30.48;
    default:
      throw new Error(`Unsupported toUnit: ${toUnit}`);
  }
};

export const getUnitLabels = (unitPreference: 'metric' | 'imperial') => {
  if (unitPreference === 'imperial') {
    return {
      height: 'Height (ft)',
      dbh: 'DBH (in)',
      canopyNS: 'Canopy Spread N-S (ft)',
      canopyEW: 'Canopy Spread E-W (ft)',
      stemDiameters: 'Individual Stem Diameters (in)'
    };
  }
  return {
    height: 'Height (cm)',
    dbh: 'DBH (cm)',
    canopyNS: 'Canopy Spread N-S (m)',
    canopyEW: 'Canopy Spread E-W (m)',
    stemDiameters: 'Individual Stem Diameters (cm)'
  };
};