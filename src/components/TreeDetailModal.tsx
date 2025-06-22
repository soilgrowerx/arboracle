'use client';

import { useState } from 'react';
import { Tree } from '@/types';
import { EcosystemManagement } from '@/components/EcosystemManagement';
import { EcosystemService } from '@/services/ecosystemService';
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
import { MapPin, Calendar, StickyNote, CheckCircle, Clock, Shield, Sprout, ExternalLink, Edit, Leaf, TreePine, Database, Microscope, X, Copy } from 'lucide-react';
import { PlusCodeService } from '@/services/plusCodeService';
import { calculateTreeAge } from '@/lib/utils';
import Image from 'next/image';
import { TaxonomicDisplay, BinomialNomenclature } from '@/components/TaxonomicDisplay';

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
  const ecosystemStats = EcosystemService.getEcosystemStatistics(tree.id);


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
      <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] sm:w-full overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="text-3xl sm:text-4xl flex-shrink-0">🌳</span>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-green-800 leading-tight">
                  {tree.commonName || tree.species}
                </DialogTitle>
                {/* Enhanced Taxonomic Display in Header */}
                {tree.taxonomy ? (
                  <div className="mt-2">
                    <BinomialNomenclature taxonomy={tree.taxonomy} />
                  </div>
                ) : tree.scientificName ? (
                  <p className="text-base sm:text-lg italic text-green-600 mt-1">{tree.scientificName}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    {getVerificationStatusIcon()}
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      <span className="hidden sm:inline">{getVerificationStatusText()}</span>
                      <span className="sm:hidden">
                        {tree.verification_status === 'verified' ? 'Verified' : 
                         tree.verification_status === 'manual' ? 'Manual' : 'Pending'}
                      </span>
                    </span>
                  </div>
                  {tree.taxonomicRank && (
                    <Badge variant="outline" className="text-xs">
                      {tree.taxonomicRank}
                    </Badge>
                  )}
                  {ecosystemStats.totalSpecies > 0 && (
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-300">
                      🌍 {ecosystemStats.totalSpecies} ecosystem species
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
            <TabsList className="grid w-full grid-cols-4 mb-6 flex-shrink-0 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-xl p-1">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md text-green-600 hover:text-green-700 hover:bg-white/50"
              >
                <TreePine size={18} />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="taxonomy" 
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md text-blue-600 hover:text-blue-700 hover:bg-white/50"
              >
                <Microscope size={18} />
                <span className="hidden sm:inline">Taxonomy</span>
              </TabsTrigger>
              <TabsTrigger 
                value="management" 
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md text-amber-600 hover:text-amber-700 hover:bg-white/50"
              >
                <Database size={18} />
                <span className="hidden sm:inline">Management</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ecosystem" 
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-md text-emerald-600 hover:text-emerald-700 hover:bg-white/50"
              >
                <Leaf size={18} />
                <span className="hidden sm:inline">Ecosystem</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Quick Stats Banner */}
                <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="text-2xl">📍</div>
                      <div className="text-sm font-medium text-green-700">Location Verified</div>
                      <div className="text-xs text-green-600">Plus Code System</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl">🕐</div>
                      <div className="text-sm font-medium text-green-700">Age: {treeAge.displayText}</div>
                      <div className="text-xs text-green-600">Since {formatDate(tree.date_planted)}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl">{getVerificationStatusIcon()}</div>
                      <div className="text-sm font-medium text-green-700">{getVerificationStatusText()}</div>
                      <div className="text-xs text-green-600">Data Quality</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl">🌍</div>
                      <div className="text-sm font-medium text-green-700">Ecosystem</div>
                      <div className="text-xs text-green-600">
                        {ecosystemStats.totalSpecies > 0 ? `${ecosystemStats.totalSpecies} species documented` : 'No species yet'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin size={20} className="text-green-600" />
                        Location Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Coordinates</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm bg-green-50 border border-green-200 p-3 rounded-lg flex-1 text-green-800">
                            {tree.lat.toFixed(6)}, {tree.lng.toFixed(6)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const coords = `${tree.lat.toFixed(6)}, ${tree.lng.toFixed(6)}`;
                              await PlusCodeService.copyToClipboard(coords);
                            }}
                            className="h-10 w-10 p-0 hover:bg-green-100"
                            title="Copy coordinates"
                          >
                            <Copy size={14} className="text-green-600" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Plus Code (Global)</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm bg-green-50 border border-green-200 p-3 rounded-lg flex-1 text-green-800">
                            {tree.plus_code_global}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await PlusCodeService.copyToClipboard(tree.plus_code_global);
                            }}
                            className="h-10 w-10 p-0 hover:bg-green-100"
                            title="Copy global Plus Code"
                          >
                            <Copy size={14} className="text-green-600" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Plus Code (Local)</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm bg-green-50 border border-green-200 p-3 rounded-lg flex-1 text-green-800">
                            {tree.plus_code_local}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await PlusCodeService.copyToClipboard(tree.plus_code_local);
                            }}
                            className="h-10 w-10 p-0 hover:bg-green-100"
                            title="Copy local Plus Code"
                          >
                            <Copy size={14} className="text-green-600" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Precision</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
                            {plusCodeInfo.areaSize} area
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border">
                            {plusCodeInfo.precision} characters
                          </span>
                        </div>
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
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-2xl">🌲</span>
                      <span>Forestry Management Data</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tree.seed_source && (
                        <div>
                          <p className="text-sm font-semibold text-amber-700 mb-2">Seed Source</p>
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                            <p className="text-base text-gray-800">{tree.seed_source}</p>
                          </div>
                        </div>
                      )}
                      
                      {tree.nursery_stock_id && (
                        <div>
                          <p className="text-sm font-semibold text-amber-700 mb-2">Nursery Stock ID</p>
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                            <p className="text-base text-gray-800 font-mono">{tree.nursery_stock_id}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {tree.condition_notes && (
                      <div>
                        <p className="text-sm font-semibold text-amber-700 mb-2">Condition Notes</p>
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <p className="text-base text-gray-800 leading-relaxed">{tree.condition_notes}</p>
                        </div>
                      </div>
                    )}
                    
                    {tree.management_actions && tree.management_actions.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-amber-700 mb-3">Management Actions</p>
                        <div className="flex flex-wrap gap-3">
                          {tree.management_actions.map((action, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="bg-amber-100 text-amber-800 border border-amber-300 text-sm px-4 py-2"
                            >
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {!tree.seed_source && !tree.nursery_stock_id && !tree.condition_notes && (!tree.management_actions || tree.management_actions.length === 0) && (
                      <div className="text-center py-12 text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="text-4xl mb-4">🌱</div>
                        <p className="text-lg font-medium mb-2">No management data recorded</p>
                        <p className="text-sm">Click &quot;Edit Tree&quot; to add forestry management information</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ecosystem" className="mt-0">
                <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-emerald-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">🌍</div>
                    <div>
                      <h3 className="text-xl font-bold text-emerald-800">Tree Ecosystem Management</h3>
                      <p className="text-emerald-600 text-sm">Manage species interactions and ecological relationships</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-emerald-200">
                      <div className="text-2xl mb-2">🤝</div>
                      <div className="text-sm font-medium text-emerald-700">Symbiotic Relations</div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-emerald-200">
                      <div className="text-2xl mb-2">🌺</div>
                      <div className="text-sm font-medium text-emerald-700">Pollinators & Dispersers</div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-emerald-200">
                      <div className="text-2xl mb-2">🔬</div>
                      <div className="text-sm font-medium text-emerald-700">Scientific Documentation</div>
                    </div>
                  </div>
                </div>
                <EcosystemManagement 
                  treeId={tree.id} 
                  treeName={tree.commonName || tree.species}
                />
              </TabsContent>

              <TabsContent value="taxonomy" className="space-y-6 mt-0">
                {/* Enhanced Taxonomic Display */}
                {tree.taxonomy ? (
                  <TaxonomicDisplay taxonomy={tree.taxonomy} variant="full" />
                ) : (
                  /* Fallback for trees without full taxonomy */
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl">🔬</span>
                        <span>Scientific Classification</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-2">Scientific Name</p>
                          <p className="text-base text-gray-800 italic font-serif bg-blue-50 p-3 rounded-lg border border-blue-200">
                            {tree.scientificName || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-2">Common Name</p>
                          <p className="text-base text-gray-800 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            {tree.commonName || tree.species}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-2">Taxonomic Rank</p>
                        <p className="text-base text-gray-800 bg-blue-50 p-3 rounded-lg border border-blue-200">
                          {tree.taxonomicRank || 'Not specified'}
                        </p>
                      </div>
                      {tree.iNaturalistId && (
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-2">iNaturalist ID</p>
                          <p className="text-base text-gray-800 font-mono bg-blue-50 p-3 rounded-lg border border-blue-200">
                            {tree.iNaturalistId}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Additional Scientific Information */}
                {tree.iNaturalistId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl">🏷️</span>
                        <span>iNaturalist Integration</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-2">Database ID</p>
                          <p className="text-base text-gray-800 font-mono bg-blue-50 p-3 rounded-lg border border-blue-200">
                            {tree.iNaturalistId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-2">Verification Status</p>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            {tree.verification_status === 'verified' && (
                              <Badge className="bg-green-100 text-green-800 text-sm px-4 py-2">
                                ✅ iNaturalist Verified
                              </Badge>
                            )}
                            {tree.verification_status === 'manual' && (
                              <Badge className="bg-blue-100 text-blue-800 text-sm px-4 py-2">
                                🔵 Manually Verified
                              </Badge>
                            )}
                            {tree.verification_status === 'pending' && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-sm px-4 py-2">
                                🟡 Pending Verification
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {tree.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl">📖</span>
                        <span>Species Description</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-gray-700 leading-relaxed">{tree.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {tree.distribution_info && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl">🌍</span>
                        <span>Distribution Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-gray-700 leading-relaxed">{tree.distribution_info}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {tree.conservation_status && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl">🛡️</span>
                        <span>Conservation Status</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <Badge variant="outline" className="text-base px-4 py-2 bg-white border-blue-300 text-blue-700">
                          {tree.conservation_status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {tree.photos && tree.photos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl">📷</span>
                        <span>Scientific Photos from iNaturalist</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {tree.photos.slice(0, 6).map((photo) => (
                          <div key={photo.id} className="space-y-2">
                            <div className="aspect-square bg-blue-50 rounded-lg overflow-hidden relative border border-blue-200">
                              <Image
                                src={photo.size_variants?.medium || photo.url}
                                alt="Species photo"
                                className="w-full h-full object-cover"
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                              />
                            </div>
                            {photo.attribution && (
                              <p className="text-xs text-blue-600 truncate">© {photo.attribution}</p>
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