'use client';

import { useState, useEffect } from 'react';
import { Tree } from '@/types';
import { TreeService } from '@/services/treeService';
import { TreeCard } from '@/components/TreeCard';
import { AddTreeModal } from '@/components/AddTreeModal';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrees = () => {
    setIsLoading(true);
    const allTrees = TreeService.getAllTrees();
    setTrees(allTrees);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTrees();
  }, []);

  const handleTreeAdded = () => {
    loadTrees();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌳</div>
              <div>
                <h1 className="text-2xl font-bold text-green-800">Arboracle</h1>
                <p className="text-sm text-green-600">Your Digital Tree Inventory</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header Section with Add Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-green-800">My Trees</h2>
            <p className="text-green-600 mt-1">
              {trees.length === 0 
                ? "Start building your digital forest" 
                : `Managing ${trees.length} tree${trees.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <AddTreeModal onTreeAdded={handleTreeAdded} />
        </div>

        {/* Trees Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-green-600">Loading your trees...</p>
          </div>
        ) : trees.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm border border-green-200 rounded-lg p-12 shadow-lg max-w-md mx-auto">
              <div className="text-6xl mb-6">🌱</div>
              <h3 className="text-2xl font-bold text-green-800 mb-4">No Trees Yet</h3>
              <p className="text-green-700 mb-6">
                Start your digital forest by adding your first tree!
              </p>
              <AddTreeModal onTreeAdded={handleTreeAdded} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trees.map((tree) => (
              <TreeCard
                key={tree.id}
                tree={tree}
                onClick={() => {
                  console.log('Tree clicked:', tree.id);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🌳</span>
              <span className="text-lg font-semibold">Arboracle</span>
            </div>
            <p className="text-green-200 text-sm">
              Building a sustainable future, one tree at a time
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}