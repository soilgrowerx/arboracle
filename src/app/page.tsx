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
      <header className="enhanced-header-section sticky top-0 z-40 enhanced-header-shadow">
        <div className="container mx-auto px-6 py-10">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-8 group text-center">
              <div className="enhanced-tree-icon text-7xl transform transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 drop-shadow-2xl filter float-animation">
                🌳
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold enhanced-brand-title tracking-tight leading-none">
                  Arboracle
                </h1>
                <p className="text-lg font-semibold text-green-600/90 enhanced-brand-subtitle tracking-wide uppercase letter-spacing-wide">
                  Your Digital Tree Inventory
                </p>
                <p className="text-base text-green-700/80 font-medium max-w-lg mx-auto leading-relaxed enhanced-tagline">
                  Cultivating knowledge, preserving nature, building tomorrow&apos;s forest legacy
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10 dashboard-section">
        {/* Header Section with Add Button and View Toggle */}
        <div className="dashboard-card-enhanced p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-2">
            <div className="float-animation">
              <h2 className="text-3xl sm:text-4xl font-bold text-green-800 mb-2">My Trees</h2>
              <p className="text-green-600 text-base sm:text-lg font-medium">
                {trees.length === 0 
                  ? "Start building your digital forest" 
                  : `Managing ${trees.length} tree${trees.length !== 1 ? 's' : ''} in your collection`
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Primary Actions - Always visible */}
              <div className="flex gap-3">
                <Link href="/map" className="flex-1 sm:flex-none">
                  <Button
                    className="w-full sm:w-auto btn-enhanced bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3"
                  >
                    <Map size={18} className="mr-2" />
                    <span className="hidden xs:inline">🗺️ View Map</span>
                    <span className="xs:hidden">Map</span>
                  </Button>
                </Link>
                <AddTreeModal 
                  onTreeAdded={handleTreeAdded} 
                  editTree={editingTree}
                  isEditMode={!!editingTree}
                />
              </div>
              
              {/* Secondary Actions - Enhanced styling */}
              <div className="flex gap-3">
                <Link href="/settings" className="flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto btn-outline-enhanced border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 px-4 py-3"
                  >
                    <Settings size={16} className="mr-2" />
                    <span className="hidden sm:inline">Settings</span>
                    <span className="sm:hidden">Settings</span>
                  </Button>
                </Link>
                <Link href="/admin" className="flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto btn-outline-enhanced border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 px-4 py-3"
                  >
                    <Settings size={16} className="mr-2" />
                    <span className="hidden sm:inline">Admin</span>
                    <span className="sm:hidden">Admin</span>
                  </Button>
                </Link>
                {trees.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="btn-outline-enhanced px-4 py-3"
                      >
                        <Download size={16} className="mr-2" />
                        <span className="hidden sm:inline">Export</span>
                        <span className="sm:hidden">Export</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dashboard-card-enhanced">
                      <DropdownMenuItem onClick={exportToCSV} className="py-3 px-4">
                        📊 Export Tree Data (CSV)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportEcosystemData} className="py-3 px-4">
                        🌍 Export Ecosystem Data (CSV)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <TreeStatistics trees={trees} />

        {/* View Tabs */}
        {trees.length > 0 && (
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-10 dashboard-card-enhanced p-2 bg-transparent border-0">
              <TabsTrigger 
                value="list" 
                className="flex items-center gap-3 py-4 px-6 btn-enhanced text-base font-semibold data-[state=active]:btn-primary-enhanced data-[state=active]:text-white transition-all duration-300"
              >
                <List size={18} />
                List View
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="flex items-center gap-3 py-4 px-6 btn-enhanced text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white transition-all duration-300"
              >
                <Map size={18} />
                🗺️ Map View
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-3 py-4 px-6 btn-enhanced text-base font-semibold data-[state=active]:btn-primary-enhanced data-[state=active]:text-white transition-all duration-300"
              >
                <BarChart3 size={18} />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-8">
              {/* Search and Filter Section */}
              <div className="dashboard-card-enhanced p-6 space-y-6 float-animation">
                {/* Search Bar */}
                <div className="search-container-enhanced w-full sm:max-w-lg mx-auto">
                  <Search className="search-icon-enhanced absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600" size={22} />
                  <Input
                    type="text"
                    placeholder="Search by species or scientific name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-enhanced pl-12 py-4 text-base"
                  />
                </div>

                {/* Sort and Filter Controls */}
                <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-3">
                    <SortAsc className="text-green-600 flex-shrink-0 transition-transform duration-300 hover:scale-110" size={22} />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full lg:w-64 btn-outline-enhanced py-3">
                        <SelectValue placeholder="Sort by..." />
                      </SelectTrigger>
                      <SelectContent className="dashboard-card-enhanced">
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
                  <div className="flex items-center gap-3">
                    <Filter className="text-green-600 transition-transform duration-300 hover:scale-110 flex-shrink-0" size={22} />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={filterBy === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilterBy('all')}
                        className={`btn-enhanced px-4 py-2 ${filterBy === 'all' ? 'btn-primary-enhanced' : 'btn-outline-enhanced'}`}
                      >
                        All Trees
                      </Button>
                      <Button
                        variant={filterBy === 'inaturalist' ? 'default' : 'outline'}
                        onClick={() => setFilterBy('inaturalist')}
                        className={`btn-enhanced px-4 py-2 ${filterBy === 'inaturalist' ? 'btn-primary-enhanced' : 'btn-outline-enhanced'}`}
                      >
                        <span className="mr-2 transition-transform duration-300 hover:scale-110">🔬</span>
                        <span className="hidden sm:inline">iNaturalist</span>
                        <span className="sm:hidden">iNat</span>
                      </Button>
                      <Button
                        variant={filterBy === 'manual' ? 'default' : 'outline'}
                        onClick={() => setFilterBy('manual')}
                        className={`btn-enhanced px-4 py-2 ${filterBy === 'manual' ? 'btn-primary-enhanced' : 'btn-outline-enhanced'}`}
                      >
                        <span className="mr-2 transition-transform duration-300 hover:scale-110">✏️</span>
                        Manual
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trees Grid */}
              {filteredTrees.length === 0 ? (
                <div className="text-center py-20">
                  <div className="dashboard-card-enhanced p-16 max-w-lg mx-auto float-animation">
                    <div className="text-8xl mb-8 float-animation">🔍</div>
                    <h3 className="text-3xl font-bold text-green-800 mb-6">No Trees Match Your Criteria</h3>
                    <p className="text-green-700 mb-8 text-lg leading-relaxed">
                      Try adjusting your search, sort, or filter settings to discover more trees in your collection.
                    </p>
                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterBy('all');
                          setSortBy('date-newest');
                        }}
                        className="block w-full btn-primary-enhanced py-4 px-8 text-lg"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredTrees.map((tree, index) => (
                    <div key={tree.id} className={`grid-fade-in`} style={{animationDelay: `${index * 0.1}s`}}>
                      <TreeCard
                        tree={tree}
                        onClick={() => handleTreeClick(tree)}
                        onEdit={handleEditTree}
                      />
                    </div>
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
          <div className="text-center py-24">
            <div className="dashboard-card-enhanced p-20 max-w-2xl mx-auto float-animation">
              <div className="text-9xl mb-10 float-animation">🌱</div>
              <h3 className="text-4xl font-bold text-green-800 mb-6">Welcome to Your Digital Forest</h3>
              <p className="text-green-700 mb-10 text-xl leading-relaxed">
                Begin your journey of cultivating knowledge and preserving nature by adding your first tree to the collection!
              </p>
              <div className="space-y-6">
                <AddTreeModal 
                  onTreeAdded={handleTreeAdded} 
                  editTree={editingTree}
                  isEditMode={!!editingTree}
                />
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px bg-green-200 flex-1"></div>
                  <span className="text-green-600 font-medium px-4">or</span>
                  <div className="h-px bg-green-200 flex-1"></div>
                </div>
                <Link href="/map">
                  <Button
                    variant="outline"
                    className="w-full btn-outline-enhanced py-4 px-8 text-lg border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Map size={20} className="mr-3" />
                    🗺️ Explore Map & Add Trees by Location
                  </Button>
                </Link>
              </div>
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