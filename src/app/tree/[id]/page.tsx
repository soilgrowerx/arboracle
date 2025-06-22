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
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Calendar, StickyNote, CheckCircle, Clock, Shield, Sprout, ExternalLink, Edit, Leaf, TreePine, Database, Microscope, Copy, MessageCircle, ThumbsUp, ThumbsDown, Send, User } from 'lucide-react';
import Link from 'next/link';

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

export default function TreeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const loadTree = () => {
      try {
        if (params.id) {
          const foundTree = TreeService.getTreeById(params.id as string);
          setTree(foundTree || null);
          
          // Load comments for this tree
          const savedComments = localStorage.getItem(`comments_${params.id}`);
          if (savedComments) {
            setComments(JSON.parse(savedComments));
          }
        }
      } catch (error) {
        console.error('Error loading tree:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTree();
  }, [params.id]);

  const saveComments = (updatedComments: Comment[]) => {
    if (params.id) {
      localStorage.setItem(`comments_${params.id}`, JSON.stringify(updatedComments));
      setComments(updatedComments);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !params.id) return;
    
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
    
    const updatedComments = [comment, ...comments];
    saveComments(updatedComments);
    setNewComment('');
  };

  const handleVote = (commentId: string, voteType: 'up' | 'down') => {
    const updatedComments = comments.map(comment => {
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
    });
    saveComments(updatedComments);
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
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Top Row - Back button */}
            <div className="flex items-center justify-between">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-100 text-xs sm:text-sm px-2 sm:px-3">
                  <ArrowLeft size={14} className="mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Back to Dashboard</span>
                  <span className="xs:hidden">Back</span>
                </Button>
              </Link>
              <div className="flex items-center gap-1 sm:gap-2">
                {tree.iNaturalist_link && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(tree.iNaturalist_link, '_blank')}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
                  >
                    <ExternalLink size={14} className="mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">iNaturalist</span>
                    <span className="sm:hidden">iNat</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="border-green-200 text-green-700 hover:bg-green-50 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
                >
                  <Edit size={14} className="mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Edit Tree</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              </div>
            </div>
            
            {/* Tree Info Row */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl flex-shrink-0">🌳</div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-800 leading-tight">
                  {tree.commonName || tree.species}
                </h1>
                {tree.scientificName && (
                  <p className="text-sm sm:text-base lg:text-lg italic text-green-600 mt-1">{tree.scientificName}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 sm:gap-2">
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
                      🌍 {ecosystemStats.totalSpecies}
                      <span className="hidden sm:inline"> ecosystem species</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Quick Stats Banner */}
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-lg sm:text-xl lg:text-2xl">📍</div>
              <div className="text-xs sm:text-sm font-medium text-green-700">Location Verified</div>
              <div className="text-xs text-green-600 hidden sm:block">Plus Code System</div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="text-lg sm:text-xl lg:text-2xl">🕐</div>
              <div className="text-xs sm:text-sm font-medium text-green-700">Age: {treeAge.displayText}</div>
              <div className="text-xs text-green-600 hidden sm:block">Since {formatDate(tree.date_planted)}</div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="text-lg sm:text-xl lg:text-2xl">{getVerificationStatusIcon()}</div>
              <div className="text-xs sm:text-sm font-medium text-green-700">
                <span className="hidden sm:inline">{getVerificationStatusText()}</span>
                <span className="sm:hidden">
                  {tree.verification_status === 'verified' ? 'Verified' : 
                   tree.verification_status === 'manual' ? 'Manual' : 'Pending'}
                </span>
              </div>
              <div className="text-xs text-green-600 hidden sm:block">Data Quality</div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="text-lg sm:text-xl lg:text-2xl">🌍</div>
              <div className="text-xs sm:text-sm font-medium text-green-700">Ecosystem</div>
              <div className="text-xs text-green-600 hidden sm:block">
                {ecosystemStats.totalSpecies > 0 ? `${ecosystemStats.totalSpecies} species documented` : 'No species yet'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-4 sm:mb-6 bg-green-50 border border-green-200 h-auto p-1">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white py-2 px-2 sm:px-3 text-xs sm:text-sm">
              <TreePine size={14} />
              <span className="hidden xs:inline">Overview</span>
              <span className="xs:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="ecosystem" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold py-2 px-2 sm:px-3 text-xs sm:text-sm">
              <Leaf size={14} />
              <span className="hidden sm:inline">🌍 Tree Ecosystem</span>
              <span className="sm:hidden">🌍 Eco</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white py-2 px-2 sm:px-3 text-xs sm:text-sm col-span-1 lg:col-span-1">
              <Database size={14} />
              <span className="hidden sm:inline">Management</span>
              <span className="sm:hidden">Manage</span>
            </TabsTrigger>
            <TabsTrigger value="scientific" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white py-2 px-2 sm:px-3 text-xs sm:text-sm col-span-1 lg:col-span-1">
              <Microscope size={14} />
              <span className="hidden sm:inline">Scientific</span>
              <span className="sm:hidden">Science</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white py-2 px-2 sm:px-3 text-xs sm:text-sm col-span-2 sm:col-span-1">
              <MessageCircle size={14} />
              <span className="hidden sm:inline">💬 Community ({comments.length})</span>
              <span className="sm:hidden">💬 ({comments.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <MapPin size={18} className="text-green-600" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Coordinates</p>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <p className="font-mono text-xs sm:text-sm bg-green-50 border border-green-200 p-2 sm:p-3 rounded-lg flex-1 text-green-800 break-all">
                        {tree.lat.toFixed(6)}, {tree.lng.toFixed(6)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const coords = `${tree.lat.toFixed(6)}, ${tree.lng.toFixed(6)}`;
                          await PlusCodeService.copyToClipboard(coords);
                        }}
                        className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-green-100 flex-shrink-0"
                        title="Copy coordinates"
                      >
                        <Copy size={12} className="sm:size-14 text-green-600" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Plus Code (Global)</p>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <p className="font-mono text-xs sm:text-sm bg-green-50 border border-green-200 p-2 sm:p-3 rounded-lg flex-1 text-green-800 break-all">
                        {tree.plus_code_global}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await PlusCodeService.copyToClipboard(tree.plus_code_global);
                        }}
                        className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-green-100 flex-shrink-0"
                        title="Copy global Plus Code"
                      >
                        <Copy size={12} className="sm:size-14 text-green-600" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Plus Code (Local)</p>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <p className="font-mono text-xs sm:text-sm bg-green-50 border border-green-200 p-2 sm:p-3 rounded-lg flex-1 text-green-800 break-all">
                        {tree.plus_code_local}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await PlusCodeService.copyToClipboard(tree.plus_code_local);
                        }}
                        className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-green-100 flex-shrink-0"
                        title="Copy local Plus Code"
                      >
                        <Copy size={12} className="sm:size-14 text-green-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Calendar size={18} className="text-green-600" />
                    Timeline Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Date Planted</p>
                    <p className="text-xs sm:text-sm text-gray-600">{formatDate(tree.date_planted)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Tree Age</p>
                    <div className="flex items-center gap-2">
                      <Sprout size={14} className="text-emerald-600" />
                      <span className="text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 px-2 sm:px-3 py-1 rounded-full">
                        {treeAge.displayText}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Added to System</p>
                    <p className="text-xs sm:text-sm text-gray-600">{formatDate(tree.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Updated</p>
                    <p className="text-xs sm:text-sm text-gray-600">{formatDate(tree.updated_at)}</p>
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

          <TabsContent value="community" className="space-y-6">
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
                          Helpful to {Math.max(comment.votes.up - comment.votes.down, 0)} people
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
        </Tabs>
      </main>
    </div>
  );
}