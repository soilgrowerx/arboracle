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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, StickyNote, CheckCircle, Clock, Shield, Sprout, ExternalLink, Edit, Leaf, TreePine, Database, Microscope, X, Copy, MessageCircle, ThumbsUp, ThumbsDown, Send, User } from 'lucide-react';
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

interface Comment {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: string;
  votes: { up: number; down: number };
  userVote: 'up' | 'down' | null;
  type: 'identification' | 'general';
}

// Mock comments data - in real implementation, this would come from an API
const mockComments: Comment[] = [
  {
    id: '1',
    author: 'Dr. Sarah Chen',
    authorRole: 'Forest Ecologist',
    content: 'This is a beautiful specimen! The bark characteristics and leaf shape strongly confirm this is Quercus alba. The age estimation looks accurate based on trunk diameter.',
    timestamp: '2024-03-20T10:30:00Z',
    votes: { up: 12, down: 1 },
    userVote: 'up' as const,
    type: 'identification' as const
  },
  {
    id: '2', 
    author: 'Mike Rodriguez',
    authorRole: 'Community Member',
    content: 'I have a similar oak in my backyard. Have you noticed any acorn production yet? Mine started producing around year 8.',
    timestamp: '2024-03-19T15:45:00Z',
    votes: { up: 5, down: 0 },
    userVote: null,
    type: 'general' as const
  },
  {
    id: '3',
    author: 'TreeBot AI',
    authorRole: 'AI Assistant',
    content: 'Based on the provided data, this tree shows excellent health indicators. Consider monitoring for oak wilt symptoms and maintain proper soil drainage for optimal growth.',
    timestamp: '2024-03-18T09:15:00Z', 
    votes: { up: 8, down: 2 },
    userVote: null,
    type: 'general' as const
  }
];

export function TreeDetailModal({ tree, isOpen, onClose, onEdit }: TreeDetailModalProps) {
  const [activeTab, setActiveTab] = useState('ecosystem');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(mockComments);

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

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      authorRole: 'Community Member',
      content: newComment,
      timestamp: new Date().toISOString(),
      votes: { up: 0, down: 0 },
      userVote: null,
      type: 'general'
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleVote = (commentId: string, voteType: 'up' | 'down') => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const newVotes = { ...comment.votes };
        const oldVote = comment.userVote;
        
        // Remove old vote if exists
        if (oldVote) {
          newVotes[oldVote]--;
        }
        
        // Add new vote if different from old vote
        if (oldVote !== voteType) {
          newVotes[voteType]++;
          return { ...comment, votes: newVotes, userVote: voteType };
        } else {
          return { ...comment, votes: newVotes, userVote: null };
        }
      }
      return comment;
    }));
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

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
            <TabsList className="grid w-full grid-cols-5 mb-4 flex-shrink-0 bg-green-50 border border-green-200">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <TreePine size={16} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="ecosystem" className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold">
                <Leaf size={16} />
                🌍 Ecosystem
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Database size={16} />
                Management
              </TabsTrigger>
              <TabsTrigger value="scientific" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Microscope size={16} />
                Scientific
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <MessageCircle size={16} />
                Comments ({comments.length})
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

              <TabsContent value="scientific" className="space-y-6 mt-0">
                {/* Enhanced Taxonomic Display */}
                {tree.taxonomy ? (
                  <TaxonomicDisplay taxonomy={tree.taxonomy} variant="full" />
                ) : (
                  /* Fallback for trees without full taxonomy */
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
                )}
                
                {/* Additional Scientific Information */}
                {tree.iNaturalistId && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🏷️ iNaturalist Integration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">iNaturalist ID</p>
                        <p className="text-sm text-gray-600 font-mono">{tree.iNaturalistId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Species Verification</p>
                        <div className="flex items-center gap-2">
                          {tree.verification_status === 'verified' && (
                            <Badge className="bg-green-100 text-green-800">
                              ✅ iNaturalist Verified
                            </Badge>
                          )}
                          {tree.verification_status === 'manual' && (
                            <Badge className="bg-blue-100 text-blue-800">
                              🔵 Manually Verified
                            </Badge>
                          )}
                          {tree.verification_status === 'pending' && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              🟡 Pending Verification
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

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

              {/* Comments Tab */}
              <TabsContent value="comments" className="space-y-6 mt-0">
                {/* Add Comment Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle size={20} className="text-blue-600" />
                      Add Comment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Share your thoughts about this tree, ask questions, or provide identification help..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="border-blue-200 focus:border-blue-400"
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Help improve tree identification by sharing your expertise!
                      </div>
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        <Send size={16} className="mr-2" />
                        Post Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No comments yet</h3>
                        <p className="text-gray-500 mb-4">Be the first to share your thoughts about this tree!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    comments.map((comment) => (
                      <Card key={comment.id} className="border-l-4 border-l-blue-200">
                        <CardContent className="p-4">
                          {/* Comment Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                <User size={16} className="text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-800">{comment.author}</span>
                                  {comment.type === 'identification' && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                      🔬 Species ID
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>{comment.authorRole}</span>
                                  <span>•</span>
                                  <span>{formatCommentDate(comment.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Comment Content */}
                          <p className="text-gray-700 mb-4 leading-relaxed">{comment.content}</p>

                          {/* Voting Section */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVote(comment.id, 'up')}
                                className={`h-8 px-2 hover:bg-green-100 ${
                                  comment.userVote === 'up' ? 'bg-green-100 text-green-700' : 'text-gray-600'
                                }`}
                              >
                                <ThumbsUp size={14} className="mr-1" />
                                {comment.votes.up}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVote(comment.id, 'down')}
                                className={`h-8 px-2 hover:bg-red-100 ${
                                  comment.userVote === 'down' ? 'bg-red-100 text-red-700' : 'text-gray-600'
                                }`}
                              >
                                <ThumbsDown size={14} className="mr-1" />
                                {comment.votes.down}
                              </Button>
                            </div>
                            <div className="text-sm text-gray-500">
                              Helpful to {comment.votes.up - comment.votes.down > 0 ? comment.votes.up - comment.votes.down : 0} people
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Community Guidelines */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Community Guidelines</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Share helpful insights about tree identification, care, or ecological relationships</li>
                      <li>• Be respectful and constructive in your feedback</li>
                      <li>• Vote up helpful comments to promote quality contributions</li>
                      <li>• Include scientific sources when making identification claims</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}