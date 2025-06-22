'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tree } from '@/types';
import { TreeService } from '@/services/treeService';
import { EcosystemManagement } from '@/components/EcosystemManagement';
import { EcosystemService } from '@/services/ecosystemService';
import { PlusCodeService } from '@/services/plusCodeService';
import { calculateTreeAge } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Calendar, StickyNote, CheckCircle, Clock, Shield, Sprout, ExternalLink, Edit, Leaf, TreePine, Database, Microscope, Copy } from 'lucide-react';
import Link from 'next/link';

export default function TreeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadTree = () => {
      try {
        if (params.id) {
          const foundTree = TreeService.getTreeById(params.id as string);
          setTree(foundTree || null);
        }
      } catch (error) {
        console.error('Error loading tree:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTree();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-green-700 flex items-center gap-2">
          <span className="animate-spin text-2xl">🌱</span>
          <span className="text-lg">Loading tree details...</span>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌳</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Tree Not Found</h1>
          <p className="text-green-600 mb-6">The tree you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft size={16} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="enhanced-header-gradient backdrop-blur-md border-b border-green-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-100">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-4xl">🌳</div>
                <div>
                  <h1 className="text-3xl font-bold text-green-800">
                    {tree.commonName || tree.species}
                  </h1>
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
                    {ecosystemStats.totalSpecies > 0 && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-300">
                        🌍 {ecosystemStats.totalSpecies} ecosystem species
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tree.iNaturalist_link && (
                <Button
                  variant="outline"
                  onClick={() => window.open(tree.iNaturalist_link, '_blank')}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <ExternalLink size={16} className="mr-2" />
                  iNaturalist
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Edit size={16} className="mr-2" />
                Edit Tree
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Quick Stats Banner */}
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-lg p-6 mb-8">
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-green-50 border border-green-200">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <TreePine size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ecosystem" className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold">
              <Leaf size={16} />
              🌍 Tree Ecosystem
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Database size={16} />
              Management
            </TabsTrigger>
            <TabsTrigger value="scientific" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Microscope size={16} />
              Scientific
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="ecosystem">
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

          <TabsContent value="management" className="space-y-6">
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

          <TabsContent value="scientific" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}