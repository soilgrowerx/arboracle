'use client';

import { useState } from 'react';
import { Tree } from '@/types';
import { EcosystemManagement } from '@/components/EcosystemManagement';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, StickyNote, CheckCircle, Clock, Shield, Sprout, ExternalLink, Edit, Leaf, TreePine, Database, Microscope, X } from 'lucide-react';
import { PlusCodeService } from '@/services/plusCodeService';
import { calculateTreeAge } from '@/lib/utils';
import Image from 'next/image';

interface TreeDetailModalProps {
  tree: Tree | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (tree: Tree) => void;
}

export function TreeDetailModal({ tree, isOpen, onClose, onEdit }: TreeDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!tree) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const treeAge = calculateTreeAge(tree.date_planted);
  const plusCodeInfo = PlusCodeService.encode(tree.lat, tree.lng, 11);

  const getVerificationStatusIcon = () => {
    switch (tree.verification_status) {
      case 'verified':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'manual':
        return <Shield size={20} className="text-blue-600" />;
      case 'pending':
        return <Clock size={20} className="text-amber-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌳</span>
              <div>
                <DialogTitle className="text-2xl font-bold text-green-800">
                  {tree.commonName || tree.species}
                </DialogTitle>
                {tree.scientificName && (
                  <p className="text-lg italic text-green-600 mt-1">{tree.scientificName}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    {getVerificationStatusIcon()}
                    <span className="text-sm font-medium text-gray-700">
                      {getVerificationStatusText()}
                    </span>
                  </div>
                  {tree.taxonomicRank && (
                    <Badge variant="outline" className="text-xs">
                      {tree.taxonomicRank}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(tree)}>
                  <Edit size={16} className="mr-2" />
                  Edit Tree
                </Button>
              )}
              {tree.iNaturalist_link && (
                <Button
                  variant="outline"
                  onClick={() => window.open(tree.iNaturalist_link, '_blank')}
                >
                  <ExternalLink size={16} className="mr-2" />
                  iNaturalist
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-4 flex-shrink-0">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TreePine size={16} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Database size={16} />
                Management
              </TabsTrigger>
              <TabsTrigger value="ecosystem" className="flex items-center gap-2">
                <Leaf size={16} />
                Ecosystem
              </TabsTrigger>
              <TabsTrigger value="scientific" className="flex items-center gap-2">
                <Microscope size={16} />
                Scientific Data
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin size={20} className="text-green-600" />
                        Location Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Coordinates</p>
                        <p className="text-sm text-gray-600">
                          {tree.lat.toFixed(6)}, {tree.lng.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Plus Code (Global)</p>
                        <p className="font-mono text-sm bg-gray-100 p-2 rounded">{tree.plus_code_global}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Plus Code (Local)</p>
                        <p className="font-mono text-sm bg-gray-100 p-2 rounded">{tree.plus_code_local}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Precision</p>
                        <p className="text-sm text-gray-600">{plusCodeInfo.areaSize} area</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar size={20} className="text-green-600" />
                        Timeline Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Date Planted</p>
                        <p className="text-sm text-gray-600">{formatDate(tree.date_planted)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Tree Age</p>
                        <div className="flex items-center gap-2">
                          <Sprout size={16} className="text-emerald-600" />
                          <span className="text-sm font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                            {treeAge.displayText}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Added to System</p>
                        <p className="text-sm text-gray-600">{formatDate(tree.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Last Updated</p>
                        <p className="text-sm text-gray-600">{formatDate(tree.updated_at)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {tree.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <StickyNote size={20} className="text-green-600" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 leading-relaxed">{tree.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {tree.images && tree.images.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📸 Photos ({tree.images.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {tree.images.map((image, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Image {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="management" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>🌲 Forestry Management Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tree.seed_source && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Seed Source</p>
                        <p className="text-sm text-gray-600">{tree.seed_source}</p>
                      </div>
                    )}
                    
                    {tree.nursery_stock_id && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Nursery Stock ID</p>
                        <p className="text-sm text-gray-600 font-mono">{tree.nursery_stock_id}</p>
                      </div>
                    )}
                    
                    {tree.condition_notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Condition Notes</p>
                        <p className="text-sm text-gray-600">{tree.condition_notes}</p>
                      </div>
                    )}
                    
                    {tree.management_actions && tree.management_actions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Management Actions</p>
                        <div className="flex flex-wrap gap-2">
                          {tree.management_actions.map((action, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {!tree.seed_source && !tree.nursery_stock_id && !tree.condition_notes && (!tree.management_actions || tree.management_actions.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No management data recorded for this tree.</p>
                        <p className="text-sm mt-2">Click &quot;Edit Tree&quot; to add forestry management information.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ecosystem" className="mt-0">
                <EcosystemManagement 
                  treeId={tree.id} 
                  treeName={tree.commonName || tree.species}
                />
              </TabsContent>

              <TabsContent value="scientific" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>🔬 Scientific Classification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Scientific Name</p>
                      <p className="text-sm text-gray-600 italic">{tree.scientificName || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Common Name</p>
                      <p className="text-sm text-gray-600">{tree.commonName || tree.species}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Taxonomic Rank</p>
                      <p className="text-sm text-gray-600">{tree.taxonomicRank || 'Not specified'}</p>
                    </div>
                    {tree.iNaturalistId && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">iNaturalist ID</p>
                        <p className="text-sm text-gray-600 font-mono">{tree.iNaturalistId}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {tree.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📖 Species Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 leading-relaxed">{tree.description}</p>
                    </CardContent>
                  </Card>
                )}

                {tree.distribution_info && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🌍 Distribution Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{tree.distribution_info}</p>
                    </CardContent>
                  </Card>
                )}

                {tree.conservation_status && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🛡️ Conservation Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="text-sm">
                        {tree.conservation_status}
                      </Badge>
                    </CardContent>
                  </Card>
                )}

                {tree.photos && tree.photos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📷 Scientific Photos from iNaturalist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {tree.photos.slice(0, 6).map((photo) => (
                          <div key={photo.id} className="space-y-2">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                              <Image
                                src={photo.size_variants?.medium || photo.url}
                                alt="Species photo"
                                className="w-full h-full object-cover"
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                              />
                            </div>
                            {photo.attribution && (
                              <p className="text-xs text-gray-500 truncate">© {photo.attribution}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}