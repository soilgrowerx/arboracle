'use client';

import { Tree } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, StickyNote, CheckCircle, Info, Copy, Check, Sprout, Pencil, ExternalLink, AlertTriangle, Clock, Shield, Leaf, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCodeService } from '@/services/plusCodeService';
import { EcosystemService } from '@/services/ecosystemService';
import { calculateTreeAge } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

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

  const handleOpenINaturalist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tree.iNaturalist_link) {
      window.open(tree.iNaturalist_link, '_blank', 'noopener,noreferrer');
    }
  };

  const getVerificationStatusIcon = () => {
    switch (tree.verification_status) {
      case 'verified':
        return <CheckCircle size={14} className="text-green-600" />;
      case 'manual':
        return <Shield size={14} className="text-blue-600" />;
      case 'pending':
        return <Clock size={14} className="text-amber-600" />;
      default:
        return <AlertTriangle size={14} className="text-gray-600" />;
    }
  };

  const getVerificationStatusText = () => {
    switch (tree.verification_status) {
      case 'verified':
        return 'iNaturalist Verified';
      case 'manual':
        return 'Manually Verified';
      case 'pending':
        return 'Pending Verification';
      default:
        return 'Unknown Status';
    }
  };

  const getVerificationStatusColor = () => {
    switch (tree.verification_status) {
      case 'verified':
        return 'text-green-600';
      case 'manual':
        return 'text-blue-600';
      case 'pending':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get enhanced Plus Code info
  const plusCodeInfo = PlusCodeService.encode(tree.lat, tree.lng, 12);
  const displayCode = showFullCode ? tree.plus_code_global : tree.plus_code_local;
  
  // Calculate tree age
  const treeAge = calculateTreeAge(tree.date_planted);
  
  // Get ecosystem species count and statistics
  const ecosystemSpeciesCount = EcosystemService.getEcosystemSpeciesCount(tree.id);
  const ecosystemStats = EcosystemService.getEcosystemStatistics(tree.id);

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
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {getVerificationStatusIcon()}
                  <span className={`text-xs font-medium ${getVerificationStatusColor()}`}>
                    {getVerificationStatusText()}
                  </span>
                </div>
                {tree.iNaturalist_link && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenINaturalist}
                    className="h-6 px-2 text-xs hover:bg-blue-50"
                  >
                    <ExternalLink size={12} className="mr-1 text-blue-600" />
                    <span className="text-blue-600">View on iNaturalist</span>
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {tree.iNaturalist_link && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenINaturalist}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                  title="Open on iNaturalist"
                >
                  <ExternalLink size={14} className="text-blue-600" />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0 hover:bg-green-100"
                  title="Edit tree"
                >
                  <Pencil size={14} className="text-green-600" />
                </Button>
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
        <div className="tree-info-item flex items-start gap-3 px-2">
          <MapPin size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            {/* Coordinates Display */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-green-700 font-medium">Coordinates:</span>
              <span className="text-xs font-mono bg-green-50 px-2 py-1 rounded border text-green-800">
                {tree.lat.toFixed(6)}°, {tree.lng.toFixed(6)}°
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleCopyCode(`${tree.lat.toFixed(6)}, ${tree.lng.toFixed(6)}`, e)}
                className="h-6 w-6 p-0 hover:bg-green-100"
                title="Copy coordinates"
              >
                {copied ? (
                  <Check size={10} className="text-green-600" />
                ) : (
                  <Copy size={10} className="text-green-600" />
                )}
              </Button>
            </div>
            
            {/* Plus Code Display */}
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

        {/* Forestry Management Data */}
        {(tree.seed_source || tree.nursery_stock_id || tree.condition_notes || (tree.management_actions && tree.management_actions.length > 0)) && (
          <div className="border-t border-green-100 pt-3 mt-3 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🌲</span>
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Management Data</span>
            </div>
            
            {tree.seed_source && (
              <div className="text-xs text-green-600">
                <span className="font-medium">Seed Source:</span> {tree.seed_source}
              </div>
            )}
            
            {tree.nursery_stock_id && (
              <div className="text-xs text-green-600">
                <span className="font-medium">Stock ID:</span> {tree.nursery_stock_id}
              </div>
            )}
            
            {tree.condition_notes && (
              <div className="text-xs text-green-600">
                <span className="font-medium">Condition:</span> <span className="line-clamp-1">{tree.condition_notes}</span>
              </div>
            )}
            
            {tree.management_actions && tree.management_actions.length > 0 && (
              <div className="text-xs text-green-600">
                <span className="font-medium">Actions:</span> {tree.management_actions.slice(0, 3).join(', ')}
                {tree.management_actions.length > 3 && <span className="text-green-500"> +{tree.management_actions.length - 3} more</span>}
              </div>
            )}
          </div>
        )}

        {/* Ecosystem Species Indicator */}
        {ecosystemSpeciesCount > 0 && (
          <div className="border-t border-green-100 pt-3 mt-3 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Leaf size={16} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Ecosystem Species</span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 px-3 py-1">
                🌍 {ecosystemSpeciesCount} species
              </Badge>
              {ecosystemStats.verifiedCount > 0 && (
                <Badge variant="outline" className="border-emerald-300 text-emerald-600 px-2 py-1 text-xs">
                  ✓ {ecosystemStats.verifiedCount} verified
                </Badge>
              )}
            </div>
            
            {Object.keys(ecosystemStats.categoryCounts).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {Object.entries(ecosystemStats.categoryCounts).map(([category, count]) => {
                  const categoryInfo = EcosystemService.getCategoryDisplayInfo(category);
                  return (
                    <div
                      key={category}
                      className={`text-xs ${categoryInfo.color} bg-opacity-10 px-2 py-1 rounded-full border border-current border-opacity-20`}
                    >
                      {categoryInfo.emoji} {count}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {tree.images.length > 0 && (
            <Badge variant="secondary" className="tree-badge-enhanced bg-emerald-100 text-emerald-700 px-3 py-1.5">
              <span className="mr-1">📸</span>
              {tree.images.length} photo{tree.images.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {tree.verification_status === 'verified' && (
            <Badge variant="secondary" className="tree-badge-enhanced bg-green-100 text-green-700 text-xs px-3 py-1.5">
              <CheckCircle size={12} className="mr-1" />
              Verified
            </Badge>
          )}
          {tree.verification_status === 'manual' && (
            <Badge variant="secondary" className="tree-badge-enhanced bg-blue-100 text-blue-700 text-xs px-3 py-1.5">
              <Shield size={12} className="mr-1" />
              Manual
            </Badge>
          )}
          {tree.verification_status === 'pending' && (
            <Badge variant="secondary" className="tree-badge-enhanced bg-amber-100 text-amber-700 text-xs px-3 py-1.5">
              <Clock size={12} className="mr-1" />
              Pending
            </Badge>
          )}
          <Badge variant="outline" className="tree-badge-enhanced text-xs border-green-300 text-green-600 px-3 py-1.5">
            Added {formatDate(tree.created_at)}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-green-100">
          <Link href={`/tree/${tree.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300">
              <Eye size={14} className="mr-2" />
              View Details & Ecosystem
            </Button>
          </Link>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(tree)} className="text-green-600 hover:bg-green-50">
              <Pencil size={14} className="mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}