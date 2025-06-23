'use client';

import { useState, useEffect } from 'react';
import { Tree } from '@/types';
import { TreeService } from '@/services/treeService';
import { TreeMapView } from '@/components/TreeMapView';
import { SimpleMap } from '@/components/SimpleMap';
import { TreeDetailModal } from '@/components/TreeDetailModal';
import { AddTreeModal } from '@/components/AddTreeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Search, Filter, MapPin, Info } from 'lucide-react';
import { calculateTreeAge } from '@/lib/utils';
import Link from 'next/link';

export default function MapPage() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [filteredTrees, setFilteredTrees] = useState<Tree[]>([]);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [editingTree, setEditingTree] = useState<Tree | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadTrees = () => {
    try {
      const allTrees = TreeService.getAllTrees();
      // Filter trees that have valid coordinates
      const treesWithCoords = allTrees.filter(
        tree => tree.lat !== 0 && tree.lng !== 0
      );
      setTrees(treesWithCoords);
      setFilteredTrees(treesWithCoords);
    } catch (error) {
      console.error('Error loading trees:', error);
      setTrees([]);
      setFilteredTrees([]);
    }
  };

  useEffect(() => {
    loadTrees();
  }, []);

  // Advanced filtering
  useEffect(() => {
    let filtered = trees;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tree =>
        tree.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tree.commonName && tree.commonName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tree.scientificName && tree.scientificName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Age filter
    if (ageFilter !== 'all') {
      filtered = filtered.filter(tree => {
        const age = calculateTreeAge(tree.date_planted);
        const years = age.totalDays / 365;
        
        switch (ageFilter) {
          case 'young': return years < 2;
          case 'medium': return years >= 2 && years < 5;
          case 'mature': return years >= 5;
          default: return true;
        }
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tree => tree.verification_status === statusFilter);
    }

    setFilteredTrees(filtered);
  }, [trees, searchTerm, ageFilter, statusFilter]);

  const handleTreeSelect = (tree: Tree) => {
    setSelectedTree(tree);
  };

  const handleEditTree = (tree: Tree) => {
    setEditingTree(tree);
  };

  const handleTreeAdded = () => {
    loadTrees();
    setEditingTree(undefined);
  };

  // Get statistics
  const stats = {
    total: trees.length,
    filtered: filteredTrees.length,
    verified: trees.filter(t => t.verification_status === 'verified').length,
    young: trees.filter(t => calculateTreeAge(t.date_planted).totalDays < 730).length,
    mature: trees.filter(t => calculateTreeAge(t.date_planted).totalDays >= 1825).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="enhanced-header-gradient backdrop-blur-md border-b border-green-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-100">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-4xl">🗺️</div>
                <div>
                  <h1 className="text-3xl font-bold text-green-800">Tree Map View</h1>
                  <p className="text-green-600">Interactive map of all your tracked trees</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AddTreeModal 
                onTreeAdded={handleTreeAdded} 
                editTree={editingTree}
                isEditMode={!!editingTree}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-800">{stats.total}</div>
              <div className="text-sm text-green-600">Total Trees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-800">{stats.filtered}</div>
              <div className="text-sm text-blue-600">On Map</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-800">{stats.verified}</div>
              <div className="text-sm text-emerald-600">Verified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-800">{stats.young}</div>
              <div className="text-sm text-yellow-600">Young Trees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-800">{stats.mature}</div>
              <div className="text-sm text-teal-600">Mature Trees</div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filter Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter size={20} className="text-green-600" />
              Advanced Filters
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {filteredTrees.length} / {trees.length} trees visible
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" size={16} />
                <Input
                  placeholder="Search species..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-green-200 focus:border-green-400"
                />
              </div>

              {/* Age Filter */}
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Filter by age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="young">🌱 Young (&lt;2 years)</SelectItem>
                  <SelectItem value="medium">🌲 Medium (2-5 years)</SelectItem>
                  <SelectItem value="mature">🌳 Mature (5+ years)</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">✅ Verified</SelectItem>
                  <SelectItem value="manual">🔵 Manual</SelectItem>
                  <SelectItem value="pending">🟡 Pending</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset Button */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setAgeFilter('all');
                  setStatusFilter('all');
                }}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help/Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">How to use the map:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Click on any tree marker to view details</li>
                  <li>• Different colored markers indicate verification status</li>
                  <li>• Tree icons change based on age: 🌱 Young → 🌲 Medium → 🌳 Mature</li>
                  <li>• Use filters above to narrow down visible trees</li>
                  <li>• Click &quot;View Full Details&quot; in popups for complete tree information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Component */}
        {filteredTrees.length === 0 ? (
          <Card className="h-96">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-green-600">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold mb-2">No Trees with Coordinates</h3>
                <p className="text-green-500 mb-4">Add trees with GPS coordinates to see them on the map</p>
                <AddTreeModal 
                  onTreeAdded={handleTreeAdded} 
                  editTree={editingTree}
                  isEditMode={!!editingTree}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-lg border border-green-200 p-1 shadow-sm">
            {/* Temporary SimpleMap for testing - Genesis Sprint IV */}
            <SimpleMap 
              trees={filteredTrees}
              center={filteredTrees.length > 0 ? [filteredTrees[0].lat, filteredTrees[0].lng] : [40.7128, -74.0060]}
            />
          </div>
        )}
      </main>

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