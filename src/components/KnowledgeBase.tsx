'use client';

import { useState, useEffect } from 'react';
import { KnowledgeArticle, KnowledgeSearch, KnowledgeStats } from '@/types/knowledge';
import { KnowledgeService } from '@/services/knowledgeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, TrendingUp, Users, Award, Clock, Eye, ThumbsUp, ThumbsDown, Star, Filter, BookMarked } from 'lucide-react';
import Link from 'next/link';

interface KnowledgeBaseProps {
  onArticleSelect?: (article: KnowledgeArticle) => void;
}

export function KnowledgeBase({ onArticleSelect }: KnowledgeBaseProps) {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('confidence');
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize sample data on first load
    KnowledgeService.initializeSampleData();
    loadData();
  }, []);

  useEffect(() => {
    performSearch();
  }, [articles, searchQuery, selectedCategory, selectedDifficulty, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = () => {
    setLoading(true);
    try {
      const allArticles = KnowledgeService.getAllArticles();
      const knowledgeStats = KnowledgeService.getKnowledgeStats();
      setArticles(allArticles);
      setStats(knowledgeStats);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = () => {
    const search: KnowledgeSearch = {
      query: searchQuery,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
      sortBy: sortBy as any
    };

    const results = KnowledgeService.searchArticles(search);
    setFilteredArticles(results);
  };

  const handleArticleClick = (article: KnowledgeArticle) => {
    KnowledgeService.incrementViewCount(article.id);
    onArticleSelect?.(article);
    loadData(); // Refresh to update view count
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-green-700 flex items-center gap-2">
          <span className="animate-spin">🧠</span>
          Loading knowledge base...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl">🧠</span>
          <h1 className="text-3xl font-bold text-green-800">Bodhi Knowledge Base</h1>
        </div>
        <p className="text-green-600 text-lg">
          Expert-curated forestry knowledge with community validation
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen size={20} className="text-green-600" />
                <span className="text-2xl font-bold text-green-800">{stats.totalArticles}</span>
              </div>
              <div className="text-sm text-green-600">Total Articles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Eye size={20} className="text-blue-600" />
                <span className="text-2xl font-bold text-blue-800">{stats.totalViews.toLocaleString()}</span>
              </div>
              <div className="text-sm text-blue-600">Total Views</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp size={20} className="text-emerald-600" />
                <span className="text-2xl font-bold text-emerald-800">{stats.averageConfidence}%</span>
              </div>
              <div className="text-sm text-emerald-600">Avg Confidence</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award size={20} className="text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-800">{stats.expertArticles}</span>
              </div>
              <div className="text-sm text-yellow-600">Expert Verified</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} className="text-green-600" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" size={16} />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-green-200 focus:border-green-400"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="border-green-200 focus:border-green-400">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="forestry">🌲 Forestry</SelectItem>
                <SelectItem value="ecology">🌿 Ecology</SelectItem>
                <SelectItem value="conservation">🛡️ Conservation</SelectItem>
                <SelectItem value="identification">🔍 Identification</SelectItem>
                <SelectItem value="management">⚙️ Management</SelectItem>
                <SelectItem value="research">🧪 Research</SelectItem>
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="border-green-200 focus:border-green-400">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">🌱 Beginner</SelectItem>
                <SelectItem value="intermediate">🌲 Intermediate</SelectItem>
                <SelectItem value="advanced">🌳 Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-green-200 focus:border-green-400">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confidence">📊 Confidence Score</SelectItem>
                <SelectItem value="recent">🕒 Most Recent</SelectItem>
                <SelectItem value="popular">👁️ Most Viewed</SelectItem>
                <SelectItem value="relevance">🎯 Relevance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mt-4">
            {searchQuery && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Search: &ldquo;{searchQuery}&rdquo;
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Category: {selectedCategory}
              </Badge>
            )}
            {selectedDifficulty !== 'all' && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Level: {selectedDifficulty}
              </Badge>
            )}
            {(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="h-6 px-2 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-green-800">
            {filteredArticles.length} Article{filteredArticles.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">No Articles Found</h3>
              <p className="text-green-600 mb-4">
                Try adjusting your search criteria or browse all articles
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Browse All Articles
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <Card
                key={article.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-green-200"
                onClick={() => handleArticleClick(article)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCategoryIcon(article.category)}</span>
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {article.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          <Award size={10} className="mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight text-green-800 line-clamp-2">
                    {article.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>{article.authorAvatar}</span>
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{getDifficultyIcon(article.difficulty)}</span>
                      <span className="capitalize">{article.difficulty}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-green-50 text-green-700">
                        {tag}
                      </Badge>
                    ))}
                    {article.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                        +{article.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{article.estimatedReadTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{article.viewCount}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={12} className="text-green-600" />
                        <span>{article.upvoteCount}</span>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(article.confidenceScore)}`}>
                        {article.confidenceScore}% confident
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}