'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tree } from '@/types/tree';
import { format } from 'date-fns';
import { calculateTreeAge } from '@/lib/utils';
import { UnitService, UnitSystem } from '@/services/unitService';

interface TreeDetailModalProps {
  tree: Tree | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TreeDetailModal: React.FC<TreeDetailModalProps> = ({
  tree,
  isOpen,
  onClose,
}) => {
  if (!tree) return null;

  const treeAge = calculateTreeAge(tree.date_planted);
  const unitSystem = UnitService.getPreferredUnitSystem();
  const unitLabels = UnitService.getUnitLabels(unitSystem);

  const displayValue = (valueCm: number | undefined, unitType: 'height' | 'dbh' | 'canopy') => {
    if (valueCm === undefined || valueCm === null) return 'N/A';
    if (unitSystem === 'imperial') {
      if (unitType === 'height' || unitType === 'canopy') {
        return `${UnitService.convertCmToIn(valueCm).toFixed(2)} ft`;
      } else if (unitType === 'dbh') {
        return `${UnitService.convertCmToIn(valueCm).toFixed(2)} in`;
      }
    }
    return `${valueCm} cm`;
  };

  const displayStemDiameters = (diametersCm: string | undefined) => {
    if (!diametersCm) return 'N/A';
    if (unitSystem === 'imperial') {
      return diametersCm.split(',').map(s => `${UnitService.convertCmToIn(parseFloat(s.trim())).toFixed(2)} in`).join(', ');
    }
    return `${diametersCm} cm`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tree.commonName || tree.species}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p><strong>Scientific Name:</strong> {tree.scientificName || 'N/A'}</p>
          <p><strong>Species:</strong> {tree.species}</p>
          <p><strong>Latitude:</strong> <a href={`https://www.google.com/maps/search/?api=1&query=${tree.lat},${tree.lng}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tree.lat}</a></p>
          <p><strong>Longitude:</strong> <a href={`https://www.google.com/maps/search/?api=1&query=${tree.lat},${tree.lng}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tree.lng}</a></p>
          <p><strong>Plus Code (Global):</strong> <a href={`https://plus.codes/${tree.plus_code_global}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tree.plus_code_global}</a></p>
          <p><strong>Plus Code (Local):</strong> <a href={`https://plus.codes/${tree.plus_code_local}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tree.plus_code_local}</a></p>
          <p><strong>Date Planted:</strong> {format(new Date(tree.date_planted), 'PPP')}</p>
          <p><strong>Age:</strong> {treeAge.displayText}</p>
          <p><strong>Height:</strong> {displayValue(tree.height_cm, 'height')}</p>
          <p><strong>DBH:</strong> {displayValue(tree.dbh_cm, 'dbh')}</p>
          {tree.is_multi_stem && (
            <p><strong>Individual Stem Diameters:</strong> {displayStemDiameters(tree.individual_stem_diameters_cm)}</p>
          )}
          <p><strong>Canopy Spread N-S:</strong> {displayValue(tree.canopy_spread_ns_cm, 'canopy')}</p>
          <p><strong>Canopy Spread E-W:</strong> {displayValue(tree.canopy_spread_ew_cm, 'canopy')}</p>
          <p><strong>Health Status:</strong> {tree.condition_assessment?.health_status || 'N/A'}</p>
          <p><strong>Verification Status:</strong> {tree.verification_status}</p>
          <p><strong>Notes:</strong> {tree.notes || 'N/A'}</p>

          {tree.images && tree.images.length > 0 && (
            <div className="grid gap-2">
              <h4 className="text-lg font-semibold text-green-700">Images</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tree.images.map((image, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden shadow-md">
                    <img src={image} alt={`Tree Image ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TreeDetailModal;
