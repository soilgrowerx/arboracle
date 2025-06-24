'use client';

import { useState } from 'react';
import { KnowledgeArticle } from '@/types/knowledge';
import { KnowledgeBase } from '@/components/KnowledgeBase';
import { KnowledgeArticleReader } from '@/components/KnowledgeArticleReader';
import { AskBodhi } from '@/components/AskBodhi';
import { StudyGuide } from '@/components/StudyGuide';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, MessageSquare, TrendingUp, Users, GraduationCap } from 'lucide-react';

export function KnowledgePortal() {
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  const handleArticleSelect = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    setActiveTab('read');
  };

  const handleBackToBase = () => {
    setSelectedArticle(null);
    setActiveTab('browse');
  };

  const handleBackToBrowse = () => {
    setActiveTab('browse');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="enhanced-header-gradient backdrop-blur-md border-b border-green-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">🧠</span>
              <h1 className="text-3xl font-bold text-green-800">Knowledge Portal</h1>
            </div>
            <p className="text-green-600 text-lg">
              Expert knowledge meets AI intelligence - Your forestry learning hub
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {selectedArticle ? (
          // Article Reader View
          <KnowledgeArticleReader 
            article={selectedArticle} 
            onBack={handleBackToBase}
          />
        ) : (
          // Main Portal View
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto mb-8 bg-white border border-green-200 shadow-sm">
              <TabsTrigger 
                value="browse" 
                className="flex items-center gap-2 py-3 px-6 font-semibold data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-200"
              >
                <BookOpen size={18} />
                <span className="hidden sm:inline">Browse Knowledge</span>
                <span className="sm:hidden">Browse</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ask" 
                className="flex items-center gap-2 py-3 px-6 font-semibold data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200"
              >
                <MessageSquare size={18} />
                <span className="hidden sm:inline">Ask Bodhi</span>
                <span className="sm:hidden">Ask AI</span>
              </TabsTrigger>
              <TabsTrigger 
                value="study" 
                className="flex items-center gap-2 py-3 px-6 font-semibold data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-200"
              >
                <GraduationCap size={18} />
                <span className="hidden sm:inline">Study Guide</span>
                <span className="sm:hidden">Study</span>
              </TabsTrigger>
              <TabsTrigger 
                value="community" 
                className="flex items-center gap-2 py-3 px-6 font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
              >
                <TrendingUp size={18} />
                <span className="hidden sm:inline">Community</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6 mt-0">
              <KnowledgeBase onArticleSelect={handleArticleSelect} />
            </TabsContent>

            <TabsContent value="ask" className="space-y-6 mt-0">
              <AskBodhi onClose={handleBackToBrowse} />
            </TabsContent>

            <TabsContent value="study" className="space-y-6 mt-0">
              <StudyGuide />
            </TabsContent>

            <TabsContent value="community" className="space-y-6 mt-0">
              <CommunityHub />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

// Community Hub Component
function CommunityHub() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-3xl">👥</span>
          <h2 className="text-2xl font-bold text-blue-800">Community Hub</h2>
        </div>
        <p className="text-blue-600">
          Connect with fellow foresters and contribute to our growing knowledge base
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-800 mb-2">1,247</div>
            <div className="text-sm text-green-600">Active Contributors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-800 mb-2">15,892</div>
            <div className="text-sm text-blue-600">Questions Answered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-800 mb-2">89%</div>
            <div className="text-sm text-purple-600">Avg Confidence</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-800 mb-2">342</div>
            <div className="text-sm text-orange-600">Expert Authors</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributors */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Top Contributors This Month
          </h3>
          <div className="space-y-4">
            {[
              { name: "Dr. Sarah Chen", avatar: "🌲", articles: 12, votes: 847, specialty: "Tree Identification" },
              { name: "Prof. Michael Rodriguez", avatar: "🌿", articles: 8, votes: 623, specialty: "Forest Ecology" },
              { name: "Dr. Lisa Park", avatar: "🏙️", articles: 6, votes: 512, specialty: "Urban Forestry" },
              { name: "James Mitchell", avatar: "🛡️", articles: 5, votes: 389, specialty: "Conservation" }
            ].map((contributor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{contributor.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-800">{contributor.name}</div>
                    <div className="text-sm text-gray-600">{contributor.specialty}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">{contributor.articles} articles</div>
                  <div className="text-xs text-gray-500">{contributor.votes} helpful votes</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-green-800 mb-4">
            📝 Contribute to the Knowledge Base
          </h3>
          <p className="text-green-700 mb-6 max-w-2xl mx-auto">
            Share your expertise with the forestry community. Write articles, answer questions, 
            and help build the world&apos;s most comprehensive forestry knowledge base.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button className="bg-green-600 hover:bg-green-700">
              Write an Article
            </Button>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              Become a Reviewer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Genesis Sprint III Info */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🚀</div>
            <div>
              <h4 className="text-xl font-bold text-purple-800 mb-2">Genesis Sprint III: AI Integration</h4>
              <p className="text-purple-700 mb-4">
                Our STIM-powered AI assistant Bodhi represents the future of intelligent forestry guidance. 
                By combining community knowledge with advanced AI, we&apos;re creating the most comprehensive 
                forestry resource available.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200">
                  <div className="font-semibold text-purple-800 mb-1">🧠 STIM Technology</div>
                  <div className="text-sm text-purple-700">Scientific Tree Intelligence Model for accurate AI responses</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200">
                  <div className="font-semibold text-purple-800 mb-1">🎯 Community Validation</div>
                  <div className="text-sm text-purple-700">Voting system ensures knowledge quality and accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}