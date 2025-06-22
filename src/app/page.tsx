'use client';

import { useState, useEffect } from 'react';
import { Tree } from '@/types';
import { TreeService } from '@/services/treeService';
import { TreeCard } from '@/components/TreeCard';
import { AddTreeModal } from '@/components/AddTreeModal';
import { TreeStatistics } from '@/components/TreeStatistics';
import { TreeMapView } from '@/components/TreeMapView';
import { TreeDetailModal } from '@/components/TreeDetailModal';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Toaster } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, SortAsc, Download, List, Map, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { calculateTreeAge } from '@/lib/utils';
import { EcosystemService } from '@/services/ecosystemService';

export default function Home() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-newest');
  const [filterBy, setFilterBy] = useState('all');
  const [editingTree, setEditingTree] = useState<Tree | undefined>(undefined);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [activeView, setActiveView] = useState('list');

  const loadTrees = () => {
    try {
      const allTrees = TreeService.getAllTrees();
      setTrees(allTrees);
    } catch (error) {
      console.error('Error loading trees:', error);
      setTrees([]);
    }
  };

  useEffect(() => {
    loadTrees();
  }, []);

  const handleTreeAdded = () => {
    loadTrees();
    setEditingTree(undefined);
  };

  const handleEditTree = (tree: Tree) => {
    setEditingTree(tree);
  };

  const handleTreeSelect = (tree: Tree) => {
    setSelectedTree(tree);
  };

  const handleTreeClick = (tree: Tree) => {
    setSelectedTree(tree);
  };

  const exportToCSV = () => {
    if (trees.length === 0) return;

    const headers = [
      'Species',
      'Scientific Name',
      'Latitude',
      'Longitude',
      'Plus Code Global',
      'Plus Code Local',
      'Date Planted',
      'Tree Age',
      'Verification Status',
      'Health Score',
      'Ecosystem Species Count',
      'Ecosystem Categories',
      'Seed Source',
      'Nursery Stock ID',
      'Condition Notes',
      'Management Actions',
      'Date Added',
      'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...trees.map(tree => {
        const treeAge = calculateTreeAge(tree.date_planted);
        const ecosystemStats = EcosystemService.getEcosystemStatistics(tree.id);
        const ecosystemCategories = Object.keys(ecosystemStats.categoryCounts).join(';');
        
        // Calculate simple health score for this tree
        const verificationScore = tree.verification_status === 'verified' ? 40 : tree.verification_status === 'manual' ? 25 : 10;
        const ageScore = Math.min((treeAge.totalDays / 365) / 5, 1) * 20;
        const ecosystemScore = Math.min(ecosystemStats.totalSpecies, 1) * 20;
        const dataScore = (tree.scientificName && tree.lat && tree.lng) ? 20 : 10;
        const healthScore = Math.round(verificationScore + ageScore + ecosystemScore + dataScore);

        return [
          `"${tree.commonName || tree.species}"`,
          `"${tree.scientificName || ''}"`,
          tree.lat,
          tree.lng,
          `"${tree.plus_code_global}"`,
          `"${tree.plus_code_local}"`,
          `"${new Date(tree.date_planted).toLocaleDateString()}"`,
          `"${treeAge.displayText}"`,
          `"${tree.verification_status}"`,
          `"${healthScore}%"`,
          ecosystemStats.totalSpecies,
          `"${ecosystemCategories}"`,
          `"${tree.seed_source || ''}"`,
          `"${tree.nursery_stock_id || ''}"`,
          `"${tree.condition_notes || ''}"`,
          `"${(tree.management_actions || []).join(';')}"`,
          `"${new Date(tree.created_at).toLocaleDateString()}"`,
          `"${tree.notes || ''}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `arboracle-comprehensive-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Export ecosystem data separately
  const exportEcosystemData = () => {
    if (trees.length === 0) return;

    const allEcosystemSpecies = trees.flatMap(tree => 
      EcosystemService.getEcosystemSpeciesForTree(tree.id).map(species => ({
        ...species,
        treeName: tree.commonName || tree.species,
        treeScientificName: tree.scientificName,
        treePlusCode: tree.plus_code_local
      }))
    );

    if (allEcosystemSpecies.length === 0) {
      alert('No ecosystem species data to export');
      return;
    }

    const headers = [
      'Ecosystem Species',
      'Scientific Name',
      'Category',
      'Relationship',
      'Observation Date',
      'Verified',
      'Tree Name',
      'Tree Scientific Name',
      'Tree Location',
      'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...allEcosystemSpecies.map(species => [
        `"${species.speciesName}"`,
        `"${species.scientificName || ''}"`,
        `"${species.category}"`,
        `"${species.relationship}"`,
        `"${new Date(species.observationDate).toLocaleDateString()}"`,
        `"${species.isVerified ? 'Yes' : 'No'}"`,
        `"${species.treeName}"`,
        `"${species.treeScientificName || ''}"`,
        `"${species.treePlusCode}"`,
        `"${species.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `arboracle-ecosystem-species-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
      case 'age-oldest':
        sorted.sort((a, b) => {
          const aAge = calculateTreeAge(a.date_planted).totalDays;
          const bAge = calculateTreeAge(b.date_planted).totalDays;
          return bAge - aAge; // Older trees first (more days = older)
        });
        break;
      case 'age-youngest':
        sorted.sort((a, b) => {
          const aAge = calculateTreeAge(a.date_planted).totalDays;
          const bAge = calculateTreeAge(b.date_planted).totalDays;
          return aAge - bAge; // Younger trees first (fewer days = younger)
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
      <header className="enhanced-header-gradient backdrop-blur-md border-b border-green-200/60 sticky top-0 z-40 enhanced-header-shadow">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 group text-center">
              <div className="enhanced-tree-icon text-6xl transform transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 drop-shadow-2xl filter">
                🌳
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-bold enhanced-brand-title tracking-tight leading-none">
                  Arboracle
                </h1>
                <p className="text-base font-semibold text-green-600/90 enhanced-brand-subtitle tracking-wide uppercase letter-spacing-wide">
                  Your Digital Tree Inventory
                </p>
                <p className="text-sm text-green-700/80 font-medium max-w-md mx-auto leading-relaxed enhanced-tagline">
                  Cultivating knowledge, preserving nature, building tomorrow&apos;s forest legacy
                </p>
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
            <Link href="/admin">
              <Button
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
              >
                <Settings size={16} className="mr-2" />
                Admin
              </Button>
            </Link>
            {trees.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                  >
                    <Download size={16} className="mr-2" />
                    Export Data
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToCSV}>
                    📊 Export Tree Data (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportEcosystemData}>
                    🌍 Export Ecosystem Data (CSV)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <AddTreeModal 
              onTreeAdded={handleTreeAdded} 
              editTree={editingTree}
              isEditMode={!!editingTree}
            />
          </div>
        </div>

        {/* Statistics Dashboard */}
        <TreeStatistics trees={trees} />

        {/* View Tabs */}
        {trees.length > 0 && (
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-6 bg-green-50 border border-green-200">
              <TabsTrigger 
                value="list" 
                className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <List size={16} />
                List View
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <Map size={16} />
                Map View
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <BarChart3 size={16} />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              {/* Search and Filter Section */}
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="search-container-enhanced max-w-md">
                  <Search className="search-icon-enhanced absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" size={20} />
                  <Input
                    type="text"
                    placeholder="Search by species or scientific name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-enhanced pl-10"
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
                        <SelectItem value="age-oldest">Age (Oldest First)</SelectItem>
                        <SelectItem value="age-youngest">Age (Youngest First)</SelectItem>
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

              {/* Trees Grid */}
              {filteredTrees.length === 0 ? (
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTrees.map((tree) => (
                    <TreeCard
                      key={tree.id}
                      tree={tree}
                      onClick={() => handleTreeClick(tree)}
                      onEdit={handleEditTree}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              <TreeMapView onTreeSelect={handleTreeSelect} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard trees={trees} />
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State - Show when no trees */}
        {trees.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm border border-green-200 rounded-lg p-12 shadow-lg max-w-md mx-auto">
              <div className="text-6xl mb-6">🌱</div>
              <h3 className="text-2xl font-bold text-green-800 mb-4">No Trees Yet</h3>
              <p className="text-green-700 mb-6">
                Start your digital forest by adding your first tree!
              </p>
              <AddTreeModal 
                onTreeAdded={handleTreeAdded} 
                editTree={editingTree}
                isEditMode={!!editingTree}
              />
            </div>
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
      
      {/* Tree Detail Modal */}
      <TreeDetailModal
        tree={selectedTree}
        isOpen={!!selectedTree}
        onClose={() => setSelectedTree(null)}
        onEdit={handleEditTree}
      />
    </div>
  );
}