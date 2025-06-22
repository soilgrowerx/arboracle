'use client';

import { useState, useEffect } from 'react';
import { KnowledgeArticle, UserVote } from '@/types/knowledge';
import { KnowledgeService } from '@/services/knowledgeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ThumbsUp, ThumbsDown, Eye, Clock, Award, BookOpen, ExternalLink, Share2, Bookmark } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface KnowledgeArticleReaderProps {
  article: KnowledgeArticle;
  onBack: () => void;
}

export function KnowledgeArticleReader({ article, onBack }: KnowledgeArticleReaderProps) {
  const [currentArticle, setCurrentArticle] = useState<KnowledgeArticle>(article);
  const [userVote, setUserVote] = useState<UserVote | null>(null);
  const [voting, setVoting] = useState(false);
  const { toast } = useToast();

  // Mock user ID for demo purposes
  const userId = 'demo_user_123';

  useEffect(() => {
    // Load user's existing vote for this article
    const existingVote = KnowledgeService.getUserVoteForArticle(userId, article.id);
    setUserVote(existingVote);
  }, [article.id, userId]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    setVoting(true);
    
    try {
      const success = KnowledgeService.voteOnArticle(userId, article.id, voteType);
      
      if (success) {
        // Refresh article data to get updated counts
        const updatedArticle = KnowledgeService.getArticleById(article.id);
        if (updatedArticle) {
          setCurrentArticle(updatedArticle);
        }

        // Update user vote state
        const newVote = KnowledgeService.getUserVoteForArticle(userId, article.id);
        setUserVote(newVote);

        // Show feedback
        if (newVote?.voteType === voteType) {
          toast({
            title: "Vote Recorded! 🎯",
            description: `Your ${voteType} helps improve content quality`,
          });
        } else {
          toast({
            title: "Vote Removed ✨",
            description: "Your vote has been removed",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to record vote. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVoting(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return 'High Confidence';
    if (score >= 60) return 'Good Confidence';
    if (score >= 40) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌲';
      case 'advanced': return '🌳';
      default: return '📚';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'forestry': return '🌲';
      case 'ecology': return '🌿';
      case 'conservation': return '🛡️';
      case 'identification': return '🔍';
      case 'management': return '⚙️';
      case 'research': return '🧪';
      default: return '📖';
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentArticle.title,
        text: currentArticle.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied! 📋",
        description: "Article URL copied to clipboard",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to Knowledge Base
        </Button>
      </div>

      {/* Article Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{getCategoryIcon(currentArticle.category)}</span>
                <Badge variant="outline" className="capitalize">
                  {currentArticle.category}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>{getDifficultyIcon(currentArticle.difficulty)}</span>
                  <span className="capitalize">{currentArticle.difficulty}</span>
                </Badge>
                {currentArticle.isVerified && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Award size={12} className="mr-1" />
                    Expert Verified
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-2xl md:text-3xl text-green-800 leading-tight mb-4">
                {currentArticle.title}
              </CardTitle>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentArticle.authorAvatar}</span>
                  <span className="font-medium">{currentArticle.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{currentArticle.estimatedReadTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{currentArticle.viewCount} views</span>
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">
                {currentArticle.excerpt}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 size={14} className="mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark size={14} className="mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bodhi Knows Voting System */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <span className="text-green-800">Bodhi Knows - Community Validation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Voting Buttons */}
            <div className="space-y-3">
              <h4 className="font-semibold text-green-800 mb-3">Rate This Article</h4>
              <div className="flex gap-3">
                <Button
                  variant={userVote?.voteType === 'upvote' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVote('upvote')}
                  disabled={voting}
                  className={`flex items-center gap-2 ${
                    userVote?.voteType === 'upvote' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'border-green-300 text-green-700 hover:bg-green-50'
                  }`}
                >
                  <ThumbsUp size={16} />
                  <span>{currentArticle.upvoteCount}</span>
                </Button>
                <Button
                  variant={userVote?.voteType === 'downvote' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVote('downvote')}
                  disabled={voting}
                  className={`flex items-center gap-2 ${
                    userVote?.voteType === 'downvote' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'border-red-300 text-red-700 hover:bg-red-50'
                  }`}
                >
                  <ThumbsDown size={16} />
                  <span>{currentArticle.downvoteCount}</span>
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                Your vote helps improve content quality
              </p>
            </div>

            {/* Confidence Score */}
            <div className="text-center">
              <h4 className="font-semibold text-green-800 mb-3">Confidence Score</h4>
              <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg border-2 ${getConfidenceColor(currentArticle.confidenceScore)}`}>
                <span className="text-2xl font-bold">{currentArticle.confidenceScore}%</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {getConfidenceLabel(currentArticle.confidenceScore)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on {currentArticle.upvoteCount + currentArticle.downvoteCount} votes
              </p>
            </div>

            {/* Community Stats */}
            <div>
              <h4 className="font-semibold text-green-800 mb-3">Community Feedback</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Helpful votes:</span>
                  <span className="font-medium text-green-600">{currentArticle.upvoteCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Needs improvement:</span>
                  <span className="font-medium text-red-600">{currentArticle.downvoteCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total engagement:</span>
                  <span className="font-medium text-blue-600">{currentArticle.viewCount + currentArticle.upvoteCount + currentArticle.downvoteCount}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-green-200">
                  <div className="text-xs text-gray-500">
                    {userVote ? (
                      <span className="text-green-600 font-medium">
                        ✓ You {userVote.voteType}d this article
                      </span>
                    ) : (
                      "Help improve this article with your feedback"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
            {currentArticle.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-green-50 text-green-700">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Article Content */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-lg max-w-none">
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ 
                __html: currentArticle.content.replace(/\n/g, '<br>').replace(/#{1,6} /g, match => {
                  const level = match.length - 1;
                  return `<h${level}>`;
                }).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
              }} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      {currentArticle.sources && currentArticle.sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen size={20} className="text-green-600" />
              Sources & References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentArticle.sources.map((source, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <ExternalLink size={14} className="text-green-600" />
                  <span>{source}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-green-700">
            Found this article helpful? Share it with the community and help others learn!
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 size={14} className="mr-1" />
              Share Article
            </Button>
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft size={14} className="mr-1" />
              Browse More Articles
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}