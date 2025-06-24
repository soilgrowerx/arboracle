'use client';

import React from 'react';
import { Mic, Play, Upload, FileText, Calendar, Clock } from 'lucide-react';

const mockEpisodes = [
  {
    id: 1,
    title: "Urban Tree Management Best Practices",
    duration: "45:32",
    date: "2024-06-20",
    description: "Expert discussion on managing trees in urban environments, covering soil compaction, root space limitations, and species selection.",
    category: "Management"
  },
  {
    id: 2,
    title: "Pruning Techniques for Different Tree Species", 
    duration: "38:15",
    date: "2024-06-15",
    description: "Professional arborists share their expertise on species-specific pruning methods and timing considerations.",
    category: "Pruning"
  },
  {
    id: 3,
    title: "Tree Health Assessment and Diagnostics",
    duration: "52:08", 
    date: "2024-06-10",
    description: "Learn to identify common tree diseases, pest issues, and structural problems through systematic assessment techniques.",
    category: "Health"
  },
  {
    id: 4,
    title: "Climate Change and Forest Adaptation",
    duration: "41:27",
    date: "2024-06-05", 
    description: "Understanding how climate change impacts forest ecosystems and strategies for building resilient tree populations.",
    category: "Climate"
  }
];

export default function ArborCast() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-green-100 rounded-lg">
          <Mic className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-800">ArborCast</h2>
          <p className="text-green-600">Expert knowledge through AI-generated podcasts</p>
        </div>
      </div>

      {/* Upload Resources Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8 border-2 border-dashed border-green-200">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-white rounded-full shadow-sm">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Create Custom Podcast Content</h3>
          <p className="text-gray-600 mb-4">
            Upload documents, PDFs, or research papers to generate AI-powered podcast episodes
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>PDFs & Documents</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Research Papers</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Text Files</span>
            </div>
          </div>
          <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Upload Resources (Coming Soon)
          </button>
        </div>
      </div>

      {/* Episodes Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Latest Episodes</h3>
        
        <div className="grid gap-6">
          {mockEpisodes.map((episode) => (
            <div key={episode.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      {episode.category}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(episode.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{episode.duration}</span>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {episode.title}
                  </h4>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {episode.description}
                  </p>
                </div>
                
                <div className="ml-6">
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    <Play className="w-4 h-4" />
                    Play
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Coming Soon</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>AI-powered content generation from your documents</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Custom voice selection and narration styles</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Automated transcript generation</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Episode sharing and collaboration tools</span>
          </div>
        </div>
      </div>
    </div>
  );
}