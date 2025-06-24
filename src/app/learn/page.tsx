'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Library, Mic } from 'lucide-react';
import Link from 'next/link';
import StudyGuide from '@/components/StudyGuide';

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-green-600 hover:text-green-700">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-green-800">📚 Learn</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <Tabs defaultValue="study-guide" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="study-guide" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Study Guide
              </TabsTrigger>
              <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
                <Library className="w-4 h-4" />
                Knowledge Base
              </TabsTrigger>
              <TabsTrigger value="arborcast" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                ArborCast
              </TabsTrigger>
            </TabsList>

            <TabsContent value="study-guide">
              <StudyGuide />
            </TabsContent>

            <TabsContent value="knowledge-base">
              <div className="text-center py-12">
                <Library className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Knowledge Base</h2>
                <p className="text-gray-600 mb-8">
                  Access STIM-powered articles and community-validated content
                </p>
                <div className="bg-green-50 rounded-lg p-6 max-w-2xl mx-auto">
                  <p className="text-green-800">
                    Coming soon: A comprehensive library of arboriculture articles, 
                    research papers, and best practices powered by our STIM AI technology.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="arborcast">
              <div className="text-center py-12">
                <Mic className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">ArborCast</h2>
                <p className="text-gray-600 mb-8">
                  Transform your documents into AI-generated podcasts
                </p>
                
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-8 bg-green-50">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-green-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, TXT up to 10MB</p>
                    </div>
                  </div>

                  {/* Example Podcast Player */}
                  <div className="bg-gray-100 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Example Podcast Player</h3>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <button className="bg-green-600 text-white rounded-full p-3 hover:bg-green-700">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </button>
                        <div className="flex-1">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full w-1/3"></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>2:45</span>
                            <span>8:30</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 rounded-lg p-6 text-left">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      How ArborCast Works (Similar to Medicast.ai)
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li>• Upload your arboriculture documents, research papers, or notes</li>
                      <li>• Our AI analyzes and synthesizes the content</li>
                      <li>• Generates a natural-sounding podcast with key insights</li>
                      <li>• Perfect for learning on-the-go or during field work</li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-4">
                      This feature is currently in development and will be available soon.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}