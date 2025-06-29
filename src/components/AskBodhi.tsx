'use client';

import { useState } from 'react';
import { BodhiQuery } from '@/types/knowledge';
import { KnowledgeService } from '@/services/knowledgeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Brain, Sparkles, Lightbulb, Clock, Zap, BookOpen, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AskBodhiProps {
  onClose?: () => void;
  aiPersona: string;
}

export function AskBodhi({ onClose, aiPersona }: AskBodhiProps) {
  const [question, setQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { toast } = useToast();

  // Mock user ID for demo purposes
  const userId = 'demo_user_123';

  const handleSubmitQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a question for Bodhi to answer",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Add the query to storage
      const bodhiQuery: Omit<BodhiQuery, 'id' | 'created_at'> = {
        question: question.trim(),
        userId,
        relatedArticles: [], // In real implementation, this would use AI to find related articles
        isAnswered: false,
        category: 'general'
      };

      const savedQuery = KnowledgeService.addBodhiQuery(bodhiQuery);

      // Simulate AI processing delay
      setTimeout(() => {
        setIsProcessing(false);
        setShowDemo(true);
        toast({
          title: "Question Received! 🧠",
          description: "Bodhi is analyzing your question and related knowledge",
        });
      }, 2000);

    } catch (error) {
      console.error('Error submitting question:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to submit question. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sampleQuestions = [
    "How do I identify oak tree species in winter?",
    "What's the best time to plant fruit trees?",
    "How can I tell if my tree is diseased?",
    "What are the signs of drought stress in trees?",
    "How do I calculate carbon storage in my forest?",
    "What's the difference between hardwood and softwood trees?"
  ];

  if (showDemo) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200">
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">🧠</span>
            <div>
              <span className="text-purple-800">{aiPersona} AI</span>
              <Badge className="ml-2 bg-purple-100 text-purple-800">STIM-Powered</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Processing Animation */}
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
                <div className="animate-spin text-2xl">🧠</div>
                <div className="text-left">
                  <div className="font-semibold text-purple-800">{aiPersona} is thinking...</div>
                  <div className="text-sm text-purple-600">Analyzing knowledge base and generating response</div>
                </div>
              </div>
            </div>

            {/* Demo Response Preview */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
                  <Sparkles size={20} />
                  AI-Powered Response (Coming Soon)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Your Question:</h4>
                  <p className="text-gray-700 italic">&ldquo;{question}&rdquo;</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Brain size={16} />
                    Bodhi&apos;s Analysis
                  </h4>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                      <Search size={14} className="text-purple-600 mt-0.5" />
                      <span>Searching through 847 forestry articles and research papers...</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen size={14} className="text-blue-600 mt-0.5" />
                      <span>Cross-referencing with expert-verified knowledge base...</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Lightbulb size={14} className="text-yellow-600 mt-0.5" />
                      <span>Generating comprehensive, context-aware response...</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    <Zap size={16} />
                    Powered by STIM Technology
                  </h4>
                  <p className="text-sm text-orange-700">
                    Bodhi uses our proprietary Scientific Tree Intelligence Model (STIM) to provide 
                    accurate, contextual answers based on peer-reviewed forestry research and 
                    community-validated knowledge.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features Coming Soon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">🎯</span>
                    <h4 className="font-semibold text-green-800">Context-Aware</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Understands your location, experience level, and tree inventory for personalized answers
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">📚</span>
                    <h4 className="font-semibold text-blue-800">Knowledge Integration</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Draws from verified articles, research papers, and community expertise
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">⚡</span>
                    <h4 className="font-semibold text-purple-800">Real-Time Learning</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Continuously improves based on community feedback and new research
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">🔬</span>
                    <h4 className="font-semibold text-orange-800">Scientific Accuracy</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Cites sources and provides confidence levels for all recommendations
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  🚀 Genesis Sprint III: AI Integration
                </h3>
                <p className="text-green-700 mb-4">
                  Bodhi AI represents the future of intelligent forestry assistance. Our STIM-powered 
                  system will provide instant, accurate answers to your forestry questions.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    onClick={() => {
                      setShowDemo(false);
                      setQuestion('');
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Ask Another Question
                  </Button>
                  {onClose && (
                    <Button variant="outline" onClick={onClose}>
                      Back to Knowledge Base
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200">
        <CardTitle className="flex items-center gap-3">
          <span className="text-3xl">🧠</span>
          <div>
            <span className="text-purple-800">Ask Bodhi</span>
            <Badge className="ml-2 bg-purple-100 text-purple-800">AI Assistant</Badge>
          </div>
        </CardTitle>
        <p className="text-purple-600 mt-2">
          Get instant answers to your forestry questions from our AI-powered knowledge assistant
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Question Input */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">
            What would you like to know about forestry?
          </label>
          <Textarea
            placeholder="Ask me anything about trees, forestry, ecology, conservation, or tree management..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            className="border-purple-200 focus:border-purple-400 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {question.length}/1000 characters
            </span>
            <Button
              onClick={handleSubmitQuestion}
              disabled={isProcessing || !question.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin">🧠</div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  <span>Ask {aiPersona}</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Sample Questions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Lightbulb size={16} className="text-yellow-600" />
            Popular Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleQuestions.map((sample, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuestion(sample)}
                className="text-left justify-start h-auto p-3 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
              >
                <div className="text-sm text-gray-700 leading-relaxed">
                  {sample}
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* AI Capabilities Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Brain size={16} className="text-purple-600" />
            What Bodhi Can Help With
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🌳</div>
                <div className="text-sm font-medium text-green-800 mb-1">Tree Identification</div>
                <div className="text-xs text-green-600">Species, characteristics, and field guides</div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🌿</div>
                <div className="text-sm font-medium text-blue-800 mb-1">Forest Management</div>
                <div className="text-xs text-blue-600">Best practices and techniques</div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="text-sm font-medium text-orange-800 mb-1">Conservation</div>
                <div className="text-xs text-orange-600">Environmental protection strategies</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technology Preview */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-1">Powered by STIM Technology</h4>
                <p className="text-sm text-purple-700">
                  Our Scientific Tree Intelligence Model (STIM) combines machine learning with 
                  expert knowledge to provide accurate, contextual forestry guidance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}