'use client';

import React from 'react';
import { Tree } from '@/types/tree';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { calculateTreeAge } from '@/lib/utils';
import { UnitService } from '@/services/unitService';
import { Edit, Info } from 'lucide-react';

interface TreeCardProps {
  tree: Tree;
  onClick: (tree: Tree) => void; // For viewing details
  onEdit: (tree: Tree) => void; // For editing
}

export const TreeCard: React.FC<TreeCardProps> = ({ tree, onClick, onEdit }) => {
  const treeAge = calculateTreeAge(tree.date_planted);

  return (
    <Card className="dashboard-card-enhanced flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-800 text-xl font-bold truncate">
          {tree.commonName || tree.species}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          {tree.scientificName || 'No scientific name'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm text-gray-700">
        <p><strong>Age:</strong> {treeAge.displayText}</p>
        <p><strong>Location:</strong> {tree.lat.toFixed(4)}, {tree.lng.toFixed(4)}</p>
        <p><strong>DBH:</strong> {tree.dbh_cm ? `${UnitService.getPreferredUnitSystem() === 'imperial' ? UnitService.convertCmToIn(tree.dbh_cm).toFixed(2) + ' in' : tree.dbh_cm + ' cm'}` : 'N/A'}</p>
        <p><strong>Health:</strong> {tree.condition_assessment?.health_status || 'N/A'}</p>
        <p><strong>Status:</strong> {tree.verification_status}</p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onClick(tree)}
          className="flex-1 btn-outline-enhanced border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
        >
          <Info className="h-4 w-4 mr-2" /> Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(tree)}
          className="flex-1 btn-outline-enhanced border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
        >
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TreeCard;
