'use client';

import { useState, useEffect } from 'react';
import { Tree } from '@/types/tree';
import { TreeService } from '@/services/treeService';
import { TreeCard } from '@/components/TreeCard';
import { AddTreeModal } from '@/components/AddTreeModal';
// import { TreeStatistics } from '@/components/TreeStatistics';
// import { ForestHealthScore } from '@/components/ForestHealthScore';
// import { TreeMapView } from '@/components/TreeMapView';
// import { TreeDetailModal } from '@/components/TreeDetailModal';
// import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Toaster } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, SortAsc, Download, List, Map, Settings, BarChart3, BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { calculateTreeAge } from '@/lib/utils';
import { EcosystemService } from '@/services/ecosystemService';
import { UnitService } from '@/services/unitService';

export default function Home() {
  const router = useRouter();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-newest');
  const [filterBy, setFilterBy] = useState('all');
  const [editingTree, setEditingTree] = useState<Tree | undefined>(undefined);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [activeView, setActiveView] = useState('list');
  const [aiPersona, setAiPersona] = useState('Bodhi'); // New state for AI persona
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State to control AddTreeModal visibility

  useEffect(() => {
    // Load AI persona from localStorage
    try {
      const savedSettings = localStorage.getItem('arboracle_user_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setAiPersona(settings.preferences?.aiPersona || 'Bodhi');
      }
    } catch (error) {
      console.error('Error loading AI persona preference:', error);
    }
  }, []);

  useEffect(() => {
    // Save AI persona to localStorage whenever it changes
    try {
      const savedSettings = localStorage.getItem('arboracle_user_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.preferences = { ...settings.preferences, aiPersona: aiPersona };
      localStorage.setItem('arboracle_user_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving AI persona preference:', error);
    }
  }, [aiPersona]);

  const loadTrees = () => {
    setLoading(true);
    try {
      const allTrees = TreeService.getAllTrees();
      setTrees(allTrees);
    } catch (error) {
      console.error('Error loading trees:', error);
      setTrees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrees();
  }, []);

  const handleTreeAdded = () => {
    loadTrees();
    setEditingTree(undefined);
    setIsAddModalOpen(false); // Close modal after tree is added
  };

  const handleOpenAddModal = () => {
    setEditingTree(undefined); // Ensure it's in add mode
    setIsAddModalOpen(true);
  };

  const handleTreeClick = (tree: Tree) => {
    setSelectedTree(tree);
  };

  const handleEditTree = (tree: Tree) => {
    setEditingTree(tree);
    setIsAddModalOpen(true); // Open modal in edit mode
  };

  const handleTreeSelect = (tree: Tree) => {
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
          `"${tree.condition_assessment?.arborist_summary || ''}"`,
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
    <div className="mobile-safe-layout bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="enhanced-header-section sticky top-0 z-40 enhanced-header-shadow mobile-header-compact">
        <div className="mobile-container mx-auto">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8 group text-center">
              <div className="enhanced-tree-icon text-4xl sm:text-5xl lg:text-7xl transform transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 drop-shadow-2xl filter float-animation">
                🌳
              </div>
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold enhanced-brand-title tracking-tight leading-none">
                  Arboracle
                </h1>
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-green-600/90 enhanced-brand-subtitle tracking-wide uppercase letter-spacing-wide">
                  Your Digital Tree Inventory
                </p>
                <p className="text-sm sm:text-base text-green-700/80 font-medium max-w-xs sm:max-w-lg mx-auto leading-relaxed enhanced-tagline">
                  Cultivating knowledge, preserving nature, building tomorrow&apos;s forest legacy
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-container mx-auto py-4 sm:py-6 lg:py-10 dashboard-section">
        {/* Header Section with Add Button and View Toggle */}
        <div className="dashboard-card-enhanced p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col gap-4 sm:gap-6 mb-2">
            <div className="float-animation text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mb-2">My Trees</h2>
              <p className="text-green-600 text-sm sm:text-base lg:text-lg font-medium">
                {trees.length === 0 
                  ? "Start building your digital forest" 
                  : `Managing ${trees.length} tree${trees.length !== 1 ? 's' : ''} in your collection`
                }
              </p>
            </div>
            <div className="mobile-stack">
              {/* Primary Actions Row - Enhanced */}
              <div className="mobile-grid-safe sm:grid-cols-2 gap-4">
                <Link href="/map" className="w-full group">
                  <Button
                    className="w-full btn-enhanced bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-bold touch-target mobile-button shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0 h-14 sm:h-16"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all duration-300">
                        <Map size={18} className="text-white" />
                      </div>
                      <span className="hidden xs:inline text-lg font-bold">🗺️ View Map</span>
                      <span className="xs:hidden text-base font-bold">Map</span>
                    </div>
                  </Button>
                </Link>
                <div className="w-full">
                  <AddTreeModal 
                    onTreeAdded={handleTreeAdded} 
                    editTree={editingTree}
                    isEditMode={!!editingTree}
                    
                    
                  />
                </div>
              </div>
              
              {/* Secondary Actions - Enhanced Professional Grid */}
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-4">
                <Link href="/learn" className="col-span-1">
                  <Button
                    variant="outline"
                    className="w-full btn-outline-enhanced border-green-300 text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-green-400 touch-target mobile-button h-12 sm:h-14 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen size={16} className="text-green-600" />
                      <span className="hidden xs:inline">📚 Learn</span>
                      <span className="xs:hidden text-xs font-bold">Learn</span>
                    </div>
                  </Button>
                </Link>
                <Link href="/settings" className="col-span-1">
                  <Button
                    variant="outline"
                    className="w-full btn-outline-enhanced border-purple-300 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:border-purple-400 touch-target mobile-button h-12 sm:h-14 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Settings size={16} className="text-purple-600" />
                      <span className="hidden xs:inline">⚙️ Settings</span>
                      <span className="xs:hidden text-xs font-bold">Config</span>
                    </div>
                  </Button>
                </Link>
                <Link href="/knowledge" className="col-span-1">
                  <Button
                    variant="outline"
                    className="w-full btn-outline-enhanced border-pink-300 text-pink-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-pink-100 hover:border-pink-400 touch-target mobile-button h-12 sm:h-14 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen size={16} className="text-pink-600" />
                      <span className="hidden xs:inline">🧠 Knowledge</span>
                      <span className="xs:hidden text-xs font-bold">Know</span>
                    </div>
                  </Button>
                </Link>
                <Link href="/admin" className="col-span-1">
                  <Button
                    variant="outline"
                    className="w-full btn-outline-enhanced border-orange-300 text-orange-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:border-orange-400 touch-target mobile-button h-12 sm:h-14 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Settings size={16} className="text-orange-600" />
                      <span className="hidden xs:inline">⚙️ Admin</span>
                      <span className="xs:hidden text-xs font-bold">Admin</span>
                    </div>
                  </Button>
                </Link>
                {trees.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full btn-outline-enhanced touch-target mobile-button col-span-1"
                      >
                        <Download size={14} className="mr-1 xs:mr-2" />
                        <span className="hidden xs:inline">Export</span>
                        <span className="xs:hidden text-xs">Export</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dashboard-card-enhanced">
                      <DropdownMenuItem onClick={exportToCSV} className="mobile-padding text-sm">
                        📊 Export Tree Data (CSV)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportEcosystemData} className="mobile-padding text-sm">
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
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <TreeStatistics trees={trees} />
          </div>
          <div className="lg:col-span-1">
            <ForestHealthScore trees={trees} aiPersona={aiPersona} treeCount={trees.length} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
            <p className="ml-4 text-green-700">Loading trees...</p>
          </div>
        ) : (
          <>
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

                <TabsContent value="list" className="space-y-4 sm:space-y-6 lg:space-y-8">
                  {/* Search and Filter Section */}
                  <div className="dashboard-card-enhanced mobile-card-content space-y-4 sm:space-y-6 float-animation">
                    {/* Search Bar */}
                    <div className="search-container-enhanced w-full">
                      <Search className="search-icon-enhanced absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-green-600" size={18} />
                      <Input
                        type="text"
                        placeholder="Search by species..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-enhanced mobile-input pl-10 sm:pl-12"
                      />
                    </div>

                    {/* Sort and Filter Controls */}
                    <div className="mobile-stack lg:flex-row lg:items-center lg:justify-between">
                      {/* Sort Dropdown */}
                      <div className="flex items-center mobile-gap">
                        <SortAsc className="text-green-600 flex-shrink-0 transition-transform duration-300 hover:scale-110 mobile-icon" />
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-full lg:w-64 btn-outline-enhanced mobile-button">
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
                      <div className="flex items-center mobile-gap">
                        <Filter className="text-green-600 transition-transform duration-300 hover:scale-110 flex-shrink-0 mobile-icon" />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={filterBy === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilterBy('all')}
                            className={`btn-enhanced mobile-button touch-target ${filterBy === 'all' ? 'btn-primary-enhanced' : 'btn-outline-enhanced'}`}
                          >
                            All Trees
                          </Button>
                          <Button
                            variant={filterBy === 'inaturalist' ? 'default' : 'outline'}
                            onClick={() => setFilterBy('inaturalist')}
                            className={`btn-enhanced mobile-button touch-target ${filterBy === 'inaturalist' ? 'btn-primary-enhanced' : 'btn-outline-enhanced'}`}
                          >
                            <span className="mr-1 xs:mr-2 transition-transform duration-300 hover:scale-110">🔬</span>
                            <span className="hidden xs:inline">iNaturalist</span>
                            <span className="xs:hidden mobile-text">iNat</span>
                          </Button>
                          <Button
                            variant={filterBy === 'manual' ? 'default' : 'outline'}
                            onClick={() => setFilterBy('manual')}
                            className={`btn-enhanced mobile-button touch-target ${filterBy === 'manual' ? 'btn-primary-enhanced' : 'btn-outline-enhanced'}`}
                          >
                            <span className="mr-1 xs:mr-2 transition-transform duration-300 hover:scale-110">✏️</span>
                            <span className="mobile-text">Manual</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trees Grid */}
                  {filteredTrees.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 lg:py-20">
                      <div className="dashboard-card-enhanced p-6 sm:p-10 lg:p-16 max-w-xs sm:max-w-lg mx-auto float-animation">
                        <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 sm:mb-8 float-animation">🔍</div>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-4 sm:mb-6">No Trees Match Your Criteria</h3>
                        <p className="text-green-700 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg leading-relaxed">
                          Try adjusting your search, sort, or filter settings to discover more trees in your collection.
                        </p>
                        <div className="space-y-4">
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setFilterBy('all');
                              setSortBy('date-newest');
                            }}
                            className="block w-full btn-primary-enhanced py-3 sm:py-4 px-4 sm:px-8 text-sm sm:text-base lg:text-lg"
                          >
                            Clear All Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
                  <TreeMapView onTreeSelect={handleTreeSelect} trees={trees} />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <AnalyticsDashboard trees={trees} />
                </TabsContent>
              </Tabs>
            )}

            {/* Empty State - Show when no trees */}
            {trees.length === 0 && !loading && (
              <div className="text-center py-12 sm:py-16 lg:py-24">
                <div className="dashboard-card-enhanced p-6 sm:p-12 lg:p-20 max-w-md sm:max-w-lg lg:max-w-2xl mx-auto float-animation">
                  <div className="text-6xl sm:text-7xl lg:text-9xl mb-6 sm:mb-8 lg:mb-10 float-animation">🌱</div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mb-4 sm:mb-6">Welcome to Your Digital Forest</h3>
                  <p className="text-green-700 mb-6 sm:mb-8 lg:mb-10 text-sm sm:text-base lg:text-xl leading-relaxed">
                    Begin your journey of cultivating knowledge and preserving nature by adding your first tree to the collection!
                  </p>
                  <div className="space-y-4 sm:space-y-6">
                    <Button
                      onClick={handleOpenAddModal} // Use the new handler
                      className="w-full btn-primary-enhanced group touch-target mobile-button font-bold bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 hover:from-green-700 hover:via-green-800 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0 h-14 sm:h-16"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all duration-300">
                          <Plus size={18} className="text-white transition-transform duration-300 group-hover:rotate-90" />
                        </div>
                        <span className="text-lg font-bold">+ Add Tree</span>
                      </div>
                    </Button>
                    <div className="flex items-center justify-center gap-2 sm:gap-4">
                      <div className="h-px bg-green-200 flex-1"></div>
                      <span className="text-green-600 font-medium px-2 sm:px-4 text-sm sm:text-base">or</span>
                      <div className="h-px bg-green-200 flex-1"></div>
                    </div>
                    <Link href="/map">
                      <Button
                        variant="outline"
                        className="w-full btn-outline-enhanced py-3 sm:py-4 px-4 sm:px-8 text-sm sm:text-base lg:text-lg border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                      >
                        <Map size={16} className="sm:size-18 lg:size-20 mr-2 sm:mr-3" />
                        <span className="hidden xs:inline">🗺️ Explore Map & Add Trees by Location</span>
                        <span className="xs:hidden">🗺️ Map View</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
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