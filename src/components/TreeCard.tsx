'use client';

import { Tree } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, StickyNote, CheckCircle, Info, Copy, Check, Sprout, Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCodeService } from '@/services/plusCodeService';
import { calculateTreeAge } from '@/lib/utils';
import { useState } from 'react';

interface TreeCardProps {
  tree: Tree;
  onClick?: () => void;
  onEdit?: (tree: Tree) => void;
}

export function TreeCard({ tree, onClick, onEdit }: TreeCardProps) {
  const [showFullCode, setShowFullCode] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCopyCode = async (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await PlusCodeService.copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleCodeFormat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFullCode(!showFullCode);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(tree);
  };

  // Get enhanced Plus Code info
  const plusCodeInfo = PlusCodeService.encode(tree.lat, tree.lng, 11);
  const displayCode = showFullCode ? tree.plus_code_global : tree.plus_code_local;
  
  // Calculate tree age
  const treeAge = calculateTreeAge(tree.date_planted);

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
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0 hover:bg-green-100"
              >
                <Pencil size={14} className="text-green-600" />
              </Button>
            )}
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-green-700 font-medium">Plus Code:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleCodeFormat}
                className="tree-plus-code font-mono text-xs px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors cursor-pointer border border-transparent hover:border-green-200"
              >
                {displayCode}
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleCopyCode(displayCode, e)}
                className="h-7 w-7 p-0 hover:bg-green-100"
              >
                {copied ? (
                  <Check size={12} className="text-green-600" />
                ) : (
                  <Copy size={12} className="text-green-600" />
                )}
              </Button>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="text-green-500 hover:text-green-700 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p><strong>Area:</strong> {plusCodeInfo.areaSize}</p>
                    <p><strong>Precision:</strong> {plusCodeInfo.precision} characters</p>
                    <p className="text-xs text-gray-600 mt-1">Click code to toggle full/local format</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="tree-info-item flex items-center gap-3 px-2">
          <Calendar size={18} className="text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700 font-medium">Planted: {formatDate(tree.date_planted)}</span>
        </div>
        
        <div className="tree-info-item flex items-center gap-3 px-2">
          <Sprout size={18} className="text-emerald-600 flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-emerald-700 font-medium">Age:</span>
            <span className="text-sm font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-full">
              {treeAge.displayText}
            </span>
          </div>
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