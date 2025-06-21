'use client';

import { useState, useEffect } from 'react';
import { TreeService } from '@/services/treeService';
import { Tree } from '@/types';
import { TreeCard } from '@/components/TreeCard';
import { AddTreeModal } from '@/components/AddTreeModal';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trees, Leaf, Globe, Plus } from 'lucide-react';

export default function Home() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [recentTrees, setRecentTrees] = useState<Tree[]>([]);
  const [treeCount, setTreeCount] = useState(0);

  const loadTrees = () => {
    const allTrees = TreeService.getAllTrees();
    const recent = TreeService.getRecentTrees(5);
    const count = TreeService.getTreesCount();
    
    setTrees(allTrees);
    setRecentTrees(recent);
    setTreeCount(count);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌳</div>
              <div>
                <h1 className="text-2xl font-bold text-green-800">Arboracle</h1>
                <p className="text-sm text-green-600">Your Digital Tree Inventory</p>
              </div>
            </div>
            <AddTreeModal onTreeAdded={handleTreeAdded} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Trees</CardTitle>
              <Trees className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{treeCount}</div>
              <p className="text-xs text-green-600 mt-1">
                {treeCount === 0 ? 'Start your forest!' : 'Trees in your inventory'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Species Tracked</CardTitle>
              <Leaf className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-800">
                {new Set(trees.map(tree => tree.species)).size}
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                Unique species variety
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-teal-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700">Plus Codes</CardTitle>
              <Globe className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-800">{treeCount}</div>
              <p className="text-xs text-teal-600 mt-1">
                Precise locations encoded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Trees */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-green-800">Recent Trees</h2>
              {treeCount > 0 && (
                <Badge variant="outline" className="border-green-300 text-green-600">
                  {treeCount} total
                </Badge>
              )}
            </div>
            
            {recentTrees.length > 0 ? (
              <div className="space-y-4">
                {recentTrees.map((tree) => (
                  <TreeCard key={tree.id} tree={tree} />
                ))}
              </div>
            ) : (
              <Card className="bg-white/50 border-dashed border-green-300">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-6xl mb-4">🌱</div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Plant Your First Tree
                  </h3>
                  <p className="text-green-600 mb-4 max-w-sm">
                    Start building your digital forest by adding your first tree to the inventory.
                  </p>
                  <AddTreeModal onTreeAdded={handleTreeAdded} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map Placeholder */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-green-800">Tree Locations</h2>
            <MapPlaceholder trees={trees} />
            
            {/* Quick Stats */}
            {trees.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 text-sm">Species Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(trees.map(tree => tree.species)))
                      .slice(0, 8)
                      .map((species) => (
                        <Badge 
                          key={species} 
                          variant="secondary" 
                          className="bg-green-100 text-green-700 text-xs"
                        >
                          {species}
                        </Badge>
                      ))
                    }
                    {new Set(trees.map(tree => tree.species)).size > 8 && (
                      <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                        +{new Set(trees.map(tree => tree.species)).size - 8} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
    </div>
  );
}