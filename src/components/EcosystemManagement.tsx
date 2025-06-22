'use client';

import { useState, useEffect, useCallback } from 'react';
import { EcosystemSpecies, EcosystemSpeciesFormData, EcosystemCategory, EcosystemRelationship } from '@/types';
import { EcosystemService } from '@/services/ecosystemService';
import { iNaturalistService } from '@/services/inaturalistService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search, Edit, Trash2, Calendar, CheckCircle, Clock, ExternalLink } from 'lucide-react';

interface EcosystemManagementProps {
  treeId: string;
  treeName: string;
}

export function EcosystemManagement({ treeId, treeName }: EcosystemManagementProps) {
  const [ecosystemSpecies, setEcosystemSpecies] = useState<EcosystemSpecies[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<EcosystemSpecies | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { toast } = useToast();

  const loadEcosystemSpecies = useCallback(() => {
    const species = EcosystemService.getEcosystemSpeciesForTree(treeId);
    setEcosystemSpecies(species);
  }, [treeId]);

  useEffect(() => {
    loadEcosystemSpecies();
  }, [loadEcosystemSpecies]);

  const handleAddSpecies = (speciesData: EcosystemSpeciesFormData) => {
    try {
      EcosystemService.addEcosystemSpecies(treeId, speciesData);
      loadEcosystemSpecies();
      setIsAddModalOpen(false);
      toast({
        title: "Species Added",
        description: `${speciesData.speciesName} has been added to the ecosystem.`,
      });
    } catch (error) {
      console.error('Error adding ecosystem species:', error);
      toast({
        title: "Error",
        description: "Failed to add ecosystem species",
        variant: "destructive"
      });
    }
  };

  const handleEditSpecies = (speciesData: EcosystemSpeciesFormData) => {
    if (!editingSpecies) return;
    
    try {
      EcosystemService.updateEcosystemSpecies(editingSpecies.id, speciesData);
      loadEcosystemSpecies();
      setEditingSpecies(null);
      toast({
        title: "Species Updated",
        description: `${speciesData.speciesName} has been updated.`,
      });
    } catch (error) {
      console.error('Error updating ecosystem species:', error);
      toast({
        title: "Error",
        description: "Failed to update ecosystem species",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSpecies = (species: EcosystemSpecies) => {
    if (confirm(`Are you sure you want to remove ${species.speciesName} from this ecosystem?`)) {
      try {
        EcosystemService.deleteEcosystemSpecies(species.id);
        loadEcosystemSpecies();
        toast({
          title: "Species Removed",
          description: `${species.speciesName} has been removed from the ecosystem.`,
        });
      } catch (error) {
        console.error('Error deleting ecosystem species:', error);
        toast({
          title: "Error",
          description: "Failed to remove ecosystem species",
          variant: "destructive"
        });
      }
    }
  };

  const getFilteredSpecies = () => {
    if (activeCategory === 'all') return ecosystemSpecies;
    return ecosystemSpecies.filter(species => species.category === activeCategory);
  };

  const getCategoryTabs = () => {
    const categories = ['all', ...new Set(ecosystemSpecies.map(s => s.category))];
    return categories.map(category => {
      const count = category === 'all' ? ecosystemSpecies.length : ecosystemSpecies.filter(s => s.category === category).length;
      const displayInfo = category === 'all' 
        ? { emoji: '🌍', label: 'All Species' }
        : EcosystemService.getCategoryDisplayInfo(category);
      
      return {
        value: category,
        label: `${displayInfo.emoji} ${displayInfo.label} (${count})`,
        count
      };
    });
  };

  const statistics = EcosystemService.getEcosystemStatistics(treeId);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">🌍 Tree Ecosystem Management</h3>
          <p className="text-green-600">
            Managing ecosystem species for <span className="font-semibold">{treeName}</span>
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus size={16} className="mr-2" />
              Add Ecosystem Species
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Ecosystem Species</DialogTitle>
            </DialogHeader>
            <EcosystemSpeciesForm
              onSubmit={handleAddSpecies}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Dashboard */}
      {statistics.totalSpecies > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">{statistics.totalSpecies}</div>
                <div className="text-sm text-green-600">Total Species</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">{statistics.verifiedCount}</div>
                <div className="text-sm text-blue-600">Verified Species</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800">{Object.keys(statistics.categoryCounts).length}</div>
                <div className="text-sm text-purple-600">Categories</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-800">{Object.keys(statistics.relationshipCounts).length}</div>
                <div className="text-sm text-amber-600">Relationships</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Species Management */}
      {ecosystemSpecies.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white/70 backdrop-blur-sm border border-green-200 rounded-lg p-12 shadow-lg">
            <div className="text-6xl mb-6">🌱</div>
            <h3 className="text-2xl font-bold text-green-800 mb-4">No Ecosystem Species Yet</h3>
            <p className="text-green-700 mb-6">
              Start documenting the ecosystem around this tree by adding plant, animal, and fungal species.
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus size={16} className="mr-2" />
              Add First Species
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-auto bg-green-50 border border-green-200 mb-6">
            {getCategoryTabs().map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredSpecies().map((species) => (
              <EcosystemSpeciesCard
                key={species.id}
                species={species}
                onEdit={() => setEditingSpecies(species)}
                onDelete={() => handleDeleteSpecies(species)}
              />
            ))}
          </div>
        </Tabs>
      )}

      {/* Edit Modal */}
      {editingSpecies && (
        <Dialog open={!!editingSpecies} onOpenChange={() => setEditingSpecies(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Ecosystem Species</DialogTitle>
            </DialogHeader>
            <EcosystemSpeciesForm
              initialData={{
                speciesName: editingSpecies.speciesName,
                scientificName: editingSpecies.scientificName,
                category: editingSpecies.category,
                relationship: editingSpecies.relationship,
                observationDate: editingSpecies.observationDate,
                notes: editingSpecies.notes,
                iNaturalistId: editingSpecies.iNaturalistId,
                isVerified: editingSpecies.isVerified
              }}
              onSubmit={handleEditSpecies}
              onCancel={() => setEditingSpecies(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Ecosystem Species Card Component
interface EcosystemSpeciesCardProps {
  species: EcosystemSpecies;
  onEdit: () => void;
  onDelete: () => void;
}

function EcosystemSpeciesCard({ species, onEdit, onDelete }: EcosystemSpeciesCardProps) {
  const categoryInfo = EcosystemService.getCategoryDisplayInfo(species.category);
  const relationshipInfo = EcosystemService.getRelationshipDisplayInfo(species.relationship);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-green-200 hover:border-green-300 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 backdrop-blur-sm hover:scale-[1.02] transform">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-green-800 mb-1">
              {species.speciesName}
            </CardTitle>
            {species.scientificName && (
              <p className="text-sm italic text-green-600">{species.scientificName}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {species.isVerified ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <Clock size={16} className="text-amber-600" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className={`${categoryInfo.color} bg-opacity-20 border border-current transition-all duration-200 hover:scale-105`}>
            <span className="text-lg mr-1">{categoryInfo.emoji}</span>
            {categoryInfo.label}
          </Badge>
          <Badge variant="outline" className={`${relationshipInfo.color} border-2 border-current bg-white/80 backdrop-blur-sm transition-all duration-200 hover:scale-105 font-medium`}>
            <span className="text-base mr-1">{relationshipInfo.emoji}</span>
            {relationshipInfo.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} />
          <span>Observed: {new Date(species.observationDate).toLocaleDateString()}</span>
        </div>

        {species.notes && (
          <p className="text-sm text-gray-700 line-clamp-2">{species.notes}</p>
        )}

        {species.iNaturalistId && (
          <a
            href={`https://www.inaturalist.org/taxa/${species.iNaturalistId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
          >
            <ExternalLink size={12} />
            iNaturalist
          </a>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
            <Edit size={14} className="mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 size={14} className="mr-1" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Ecosystem Species Form Component
interface EcosystemSpeciesFormProps {
  initialData?: EcosystemSpeciesFormData;
  onSubmit: (data: EcosystemSpeciesFormData) => void;
  onCancel: () => void;
}

function EcosystemSpeciesForm({ initialData, onSubmit, onCancel }: EcosystemSpeciesFormProps) {
  const [formData, setFormData] = useState<EcosystemSpeciesFormData>({
    speciesName: '',
    scientificName: '',
    category: 'plant',
    relationship: 'neutral',
    observationDate: new Date().toISOString().split('T')[0],
    notes: '',
    iNaturalistId: undefined,
    isVerified: false,
    ...initialData
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = async () => {
    if (!formData.speciesName.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await iNaturalistService.searchEcosystemSpecies(formData.speciesName);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching species:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSpecies = (species: any) => {
    setFormData({
      ...formData,
      speciesName: species.preferred_common_name || species.name,
      scientificName: species.name,
      iNaturalistId: species.id,
      isVerified: true
    });
    setShowSearchResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categories: { value: EcosystemCategory; label: string }[] = [
    { value: 'plant', label: '🌿 Plant' },
    { value: 'fungus', label: '🍄 Fungus' },
    { value: 'animal', label: '🐾 Animal' },
    { value: 'insect', label: '🐛 Insect' },
    { value: 'bird', label: '🐦 Bird' },
    { value: 'microorganism', label: '🦠 Microorganism' },
    { value: 'other', label: '🔬 Other' }
  ];

  const relationships: { value: EcosystemRelationship; label: string }[] = [
    { value: 'symbiotic', label: '🤝 Symbiotic' },
    { value: 'parasitic', label: '🩸 Parasitic' },
    { value: 'commensal', label: '🏠 Commensal' },
    { value: 'predatory', label: '🦈 Predatory' },
    { value: 'pollinator', label: '🌺 Pollinator' },
    { value: 'seed_disperser', label: '🌱 Seed Disperser' },
    { value: 'epiphytic', label: '🌿 Epiphytic' },
    { value: 'competitive', label: '⚔️ Competitive' },
    { value: 'neutral', label: '⚪ Neutral' },
    { value: 'beneficial', label: '✨ Beneficial' },
    { value: 'detrimental', label: '⚠️ Detrimental' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="speciesName">Species Name</Label>
          <div className="flex gap-2">
            <Input
              id="speciesName"
              value={formData.speciesName}
              onChange={(e) => setFormData({ ...formData, speciesName: e.target.value })}
              placeholder="Enter species name"
              required
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSearch}
              disabled={isSearching}
            >
              <Search size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scientificName">Scientific Name</Label>
          <Input
            id="scientificName"
            value={formData.scientificName || ''}
            onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
            placeholder="Scientific name (optional)"
          />
        </div>
      </div>

      {showSearchResults && searchResults.length > 0 && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h4 className="font-medium text-green-800 mb-2">iNaturalist Search Results:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {searchResults.slice(0, 5).map((species) => (
              <button
                key={species.id}
                type="button"
                onClick={() => handleSelectSpecies(species)}
                className="w-full text-left p-2 hover:bg-green-100 rounded border border-green-200"
              >
                <div className="font-medium">{species.preferred_common_name || species.name}</div>
                <div className="text-sm text-gray-600 italic">{species.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value: EcosystemCategory) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship to Tree</Label>
          <Select value={formData.relationship} onValueChange={(value: EcosystemRelationship) => setFormData({ ...formData, relationship: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {relationships.map(rel => (
                <SelectItem key={rel.value} value={rel.value}>{rel.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observationDate">Observation Date</Label>
        <Input
          id="observationDate"
          type="date"
          value={formData.observationDate}
          onChange={(e) => setFormData({ ...formData, observationDate: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Observations, behavior, interactions..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          {initialData ? 'Update Species' : 'Add Species'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}