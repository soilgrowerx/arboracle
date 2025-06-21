'use client';

import { Tree } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, StickyNote, CheckCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TreeCardProps {
  tree: Tree;
  onClick?: () => void;
}

export function TreeCard({ tree, onClick }: TreeCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card 
      className="cursor-pointer tree-card-enhanced"
      onClick={onClick}
    >
      <CardHeader className="pb-4 tree-card-header">
        <CardTitle className="text-lg font-semibold text-green-800">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl tree-icon-enhanced">🌳</span>
            <div className="flex-1">
              <div className="text-lg font-bold text-green-800 mb-1">
                {tree.commonName || tree.species}
              </div>
              {tree.iNaturalistId && (
                <div className="flex items-center gap-1">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Verified</span>
                </div>
              )}
            </div>
          </div>
          {tree.scientificName && (
            <div className="tree-scientific-name rounded-md">
              <div className="text-sm font-medium text-green-700 italic">
                {tree.scientificName}
                {tree.taxonomicRank && (
                  <span className="text-xs text-green-500 not-italic ml-2 bg-green-100 px-2 py-0.5 rounded-full">
                    {tree.taxonomicRank}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="tree-info-item flex items-center gap-3 px-2">
          <MapPin size={18} className="text-green-600 flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-700 font-medium">Plus Code:</span>
            <span className="tree-plus-code font-mono text-xs px-3 py-1.5 rounded-md">
              {tree.plus_code_local}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="text-green-500 hover:text-green-700 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Precise location code for satellite tracking and ecosystem monitoring</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="tree-info-item flex items-center gap-3 px-2">
          <Calendar size={18} className="text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700 font-medium">Planted: {formatDate(tree.date_planted)}</span>
        </div>

        {tree.notes && (
          <div className="tree-info-item flex items-start gap-3 px-2">
            <StickyNote size={18} className="mt-0.5 flex-shrink-0 text-green-600" />
            <span className="text-sm text-green-700 line-clamp-2 leading-relaxed">{tree.notes}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {tree.images.length > 0 && (
            <Badge variant="secondary" className="tree-badge-enhanced bg-emerald-100 text-emerald-700 px-3 py-1.5">
              <span className="mr-1">📸</span>
              {tree.images.length} photo{tree.images.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {tree.iNaturalistId && (
            <Badge variant="secondary" className="tree-badge-enhanced bg-blue-100 text-blue-700 text-xs px-3 py-1.5">
              <span className="mr-1">🔬</span>
              iNaturalist verified
            </Badge>
          )}
          <Badge variant="outline" className="tree-badge-enhanced text-xs border-green-300 text-green-600 px-3 py-1.5">
            Added {formatDate(tree.created_at)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}