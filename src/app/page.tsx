'use client';

import { useState, useEffect } from 'react';
import { Tree } from '@/types';
import { TreeService } from '@/services/treeService';
import { TreeCard } from '@/components/TreeCard';
import { MapView } from '@/components/MapView';
import { AddTreeModal } from '@/components/AddTreeModal';
import { Toaster } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SortAsc, Map, Grid3X3 } from 'lucide-react';

export default function Home() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-newest');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

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

  // Filter and sort trees
  const getFilteredAndSortedTrees = () => {
    let filtered = trees;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tree =>
        tree.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tree.commonName && tree.commonName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tree.scientificName && tree.scientificName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterBy === 'inaturalist') {
      filtered = filtered.filter(tree => tree.iNaturalistId);
    } else if (filterBy === 'manual') {
      filtered = filtered.filter(tree => !tree.iNaturalistId);
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'date-newest':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'date-oldest':
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'species-az':
        sorted.sort((a, b) => (a.commonName || a.species).localeCompare(b.commonName || b.species));
        break;
      case 'species-za':
        sorted.sort((a, b) => (b.commonName || b.species).localeCompare(a.commonName || a.species));
        break;
      case 'scientific-az':
        sorted.sort((a, b) => {
          const aName = a.scientificName || a.species;
          const bName = b.scientificName || b.species;
          return aName.localeCompare(bName);
        });
        break;
      case 'scientific-za':
        sorted.sort((a, b) => {
          const aName = a.scientificName || a.species;
          const bName = b.scientificName || b.species;
          return bName.localeCompare(aName);
        });
        break;
      default:
        break;
    }

    return sorted;
  };

  const filteredTrees = getFilteredAndSortedTrees();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="header-gradient backdrop-blur-md border-b border-green-200/60 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4 group">
              <div className="text-4xl transform transition-transform duration-300 group-hover:scale-110 drop-shadow-lg">🌳</div>
              <div className="text-center">
                <h1 className="text-3xl font-bold brand-title tracking-tight leading-none mb-1">Arboracle</h1>
                <p className="text-sm font-medium text-green-600/80 brand-subtitle tracking-wide uppercase letter-spacing-wide">Your Digital Tree Inventory</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header Section with Add Button and View Toggle */}
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
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            {trees.length > 0 && (
              <div className="flex items-center gap-1 bg-white/70 backdrop-blur-sm border border-green-200 rounded-lg p-1 shadow-sm">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-green-600 text-white hover:bg-green-700' : 'text-green-600 hover:bg-green-50'}`}
                >
                  <Grid3X3 size={16} className="mr-1" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-2 ${viewMode === 'map' ? 'bg-green-600 text-white hover:bg-green-700' : 'text-green-600 hover:bg-green-50'}`}
                >
                  <Map size={16} className="mr-1" />
                  Map
                </Button>
              </div>
            )}
            <AddTreeModal onTreeAdded={handleTreeAdded} />
          </div>
        </div>

        {/* Search and Filter Section */}
        {trees.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" size={20} />
              <Input
                type="text"
                placeholder="Search by species or scientific name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-green-200 focus:border-green-400"
              />
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <SortAsc className="text-green-600" size={20} />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 border-green-200 focus:border-green-400">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-newest">Date Added (Newest)</SelectItem>
                    <SelectItem value="date-oldest">Date Added (Oldest)</SelectItem>
                    <SelectItem value="species-az">Species Name (A-Z)</SelectItem>
                    <SelectItem value="species-za">Species Name (Z-A)</SelectItem>
                    <SelectItem value="scientific-az">Scientific Name (A-Z)</SelectItem>
                    <SelectItem value="scientific-za">Scientific Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <Filter className="text-green-600 transition-transform duration-300 hover:scale-110" size={20} />
                <div className="flex gap-1">
                  <Button
                    variant={filterBy === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy('all')}
                    className={`btn-filter-enhanced ${filterBy === 'all' ? 'btn-primary-enhanced' : 'btn-outline-enhanced'}`}
                  >
                    All Trees
                  </Button>
                  <Button
                    variant={filterBy === 'inaturalist' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy('inaturalist')}
                    className={`btn-filter-enhanced ${filterBy === 'inaturalist' ? 'btn-primary-enhanced' : 'btn-outline-enhanced'}`}
                  >
                    <span className="mr-1 transition-transform duration-300 hover:scale-110">🔬</span>
                    iNaturalist
                  </Button>
                  <Button
                    variant={filterBy === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy('manual')}
                    className={`btn-filter-enhanced ${filterBy === 'manual' ? 'btn-primary-enhanced' : 'btn-outline-enhanced'}`}
                  >
                    <span className="mr-1 transition-transform duration-300 hover:scale-110">✏️</span>
                    Manual
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
        ) : filteredTrees.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm border border-green-200 rounded-lg p-12 shadow-lg max-w-md mx-auto">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-green-800 mb-4">No Trees Match Your Criteria</h3>
              <p className="text-green-700 mb-6">
                Try adjusting your search, sort, or filter settings to see more trees.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                    setSortBy('date-newest');
                  }}
                  className="block w-full px-4 py-2 btn-primary-enhanced rounded-md"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        ) : viewMode === 'map' ? (
          <MapView trees={filteredTrees} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTrees.map((tree) => (
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