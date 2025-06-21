'use client';

import { useState } from 'react';
import { TreeFormData } from '@/types';
import { TreeService } from '@/services/treeService';
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
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search } from 'lucide-react';

interface AddTreeModalProps {
  onTreeAdded?: () => void;
}

export function AddTreeModal({ onTreeAdded }: AddTreeModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();
  const [formData, setFormData] = useState<TreeFormData>({
    species: '',
    location: { lat: 0, lng: 0 },
    date_planted: '',
    notes: '',
    images: [],
    scientificName: undefined,
    commonName: undefined,
    taxonomicRank: undefined,
    iNaturalistId: undefined
  });
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.species.trim()) {
      errors.push('Species is required');
    }
    
    // Check if coordinates are actually provided (not just default 0,0)
    const latInput = document.getElementById('latitude') as HTMLInputElement;
    const lngInput = document.getElementById('longitude') as HTMLInputElement;
    
    if (!latInput?.value || !lngInput?.value) {
      errors.push('Location coordinates are required');
    } else {
      // Only validate ranges if values are provided
      if (formData.location.lat < -90 || formData.location.lat > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
      
      if (formData.location.lng < -180 || formData.location.lng > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validationErrors = validateForm();
      setErrors(validationErrors);
      
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: validationErrors.join(', '),
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      setErrors([]);

      const newTree = TreeService.addTree(formData);
      
      toast({
        title: "Tree Added Successfully! 🌳",
        description: `${newTree.species} has been added to your forest.`,
      });
      
      setOpen(false);
      setFormData({
        species: '',
        location: { lat: 0, lng: 0 },
        date_planted: '',
        notes: '',
        images: [],
        scientificName: undefined,
        commonName: undefined,
        taxonomicRank: undefined,
        iNaturalistId: undefined
      });
      setShowSearchResults(false);
      setSearchResults([]);
      
      onTreeAdded?.();
    } catch (error) {
      console.error('Error adding tree:', error);
      toast({
        title: "Error",
        description: "Failed to add tree. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const searchSpecies = async () => {
    if (!formData.species.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a species name to search",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await iNaturalistService.searchSpecies(formData.species);
      setSearchResults(results);
      setShowSearchResults(true);
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No species found matching your search",
        });
      }
    } catch (error) {
      console.error('Error searching species:', error);
      toast({
        title: "Search Error",
        description: "Failed to search species. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectSpecies = (taxon: any) => {
    const speciesName = taxon.preferred_common_name || taxon.name;
    setFormData(prev => ({ 
      ...prev, 
      species: speciesName,
      scientificName: taxon.name,
      commonName: taxon.preferred_common_name,
      taxonomicRank: taxon.rank,
      iNaturalistId: taxon.id
    }));
    setShowSearchResults(false);
    toast({
      title: "Species Selected",
      description: `Selected: ${speciesName}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary-enhanced group">
          <Plus size={16} className="mr-2 transition-transform duration-200 group-hover:rotate-90" />
          Add Tree
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-green-800 flex items-center gap-2">
            🌳 Add New Tree
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="species" className="text-green-700">Species *</Label>
            <div className="flex gap-2">
              <Input
                id="species"
                value={formData.species}
                onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                placeholder="e.g., Oak, Maple, Pine..."
                required
                className={`border-green-200 focus:border-green-400 ${
                  errors.some(e => e.includes('Species')) ? 'border-red-500' : ''
                }`}
              />
              <Button
                type="button"
                variant="outline"
                onClick={searchSpecies}
                disabled={isSearching}
                className="btn-search-enhanced"
              >
                <Search size={16} className={`transition-transform duration-300 ${isSearching ? 'animate-spin' : ''}`} />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            {showSearchResults && searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-green-200 rounded-md bg-white">
                {searchResults.map((taxon) => (
                  <button
                    key={taxon.id}
                    type="button"
                    onClick={() => selectSpecies(taxon)}
                    className="w-full text-left px-3 py-2 hover:bg-green-50 border-b border-green-100 last:border-b-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                  >
                    <div className="font-medium text-green-800">
                      {taxon.preferred_common_name || taxon.name}
                    </div>
                    <div className="text-sm text-green-600">
                      {taxon.name} • {taxon.rank}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="latitude" className="text-green-700">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.location.lat === 0 ? '' : formData.location.lat}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, lat: e.target.value ? parseFloat(e.target.value) : 0 }
                }))}
                placeholder="0.000000"
                required
                className={`border-green-200 focus:border-green-400 ${
                  errors.some(e => e.includes('Latitude') || e.includes('Location')) ? 'border-red-500' : ''
                }`}
              />
            </div>
            <div>
              <Label htmlFor="longitude" className="text-green-700">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.location.lng === 0 ? '' : formData.location.lng}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, lng: e.target.value ? parseFloat(e.target.value) : 0 }
                }))}
                placeholder="0.000000"
                required
                className={`border-green-200 focus:border-green-400 ${
                  errors.some(e => e.includes('Longitude') || e.includes('Location')) ? 'border-red-500' : ''
                }`}
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            className="w-full btn-outline-enhanced"
          >
            <span className="mr-2 transition-transform duration-300 hover:scale-110">📍</span>
            Use Current Location
          </Button>

          <div>
            <Label htmlFor="date_planted" className="text-green-700">Date Planted</Label>
            <Input
              id="date_planted"
              type="date"
              value={formData.date_planted}
              onChange={(e) => setFormData(prev => ({ ...prev, date_planted: e.target.value }))}
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-green-700">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this tree..."
              rows={3}
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 btn-outline-enhanced"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary-enhanced"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">🌱</span>
                  Adding...
                </span>
              ) : (
                'Add Tree'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}