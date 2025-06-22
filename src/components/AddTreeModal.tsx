'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TreeFormData, Tree } from '@/types';
import { TreeService } from '@/services/treeService';
import { iNaturalistService } from '@/services/inaturalistService';
import { PlusCodeService } from '@/services/plusCodeService';
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
import { Plus, Search, MapPin, Map } from 'lucide-react';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

interface AddTreeModalProps {
  onTreeAdded?: () => void;
  editTree?: Tree;
  isEditMode?: boolean;
}

// Map click handler component
function LocationPicker({ position, onLocationSelect }: { position: [number, number] | null, onLocationSelect: (lat: number, lng: number) => void }) {
  const { useMapEvents } = require('react-leaflet');
  
  const map = useMapEvents({
    click: (e: any) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

export function AddTreeModal({ onTreeAdded, editTree, isEditMode = false }: AddTreeModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isEditMode && editTree) {
      setOpen(true);
    }
  }, [isEditMode, editTree]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [managementActionsInput, setManagementActionsInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);
  const [formData, setFormData] = useState<TreeFormData>({
    species: '',
    location: { lat: 0, lng: 0 },
    date_planted: '',
    notes: '',
    images: [],
    scientificName: undefined,
    commonName: undefined,
    taxonomicRank: undefined,
    iNaturalistId: undefined,
    seed_source: '',
    nursery_stock_id: '',
    condition_notes: '',
    management_actions: [],
    iNaturalist_link: '',
    verification_status: 'pending',
    associated_species: []
  });

  useEffect(() => {
    if (isEditMode && editTree) {
      const managementActions = editTree.management_actions || [];
      setFormData({
        species: editTree.species,
        location: { lat: editTree.lat, lng: editTree.lng },
        date_planted: editTree.date_planted,
        notes: editTree.notes,
        images: editTree.images,
        scientificName: editTree.scientificName,
        commonName: editTree.commonName,
        taxonomicRank: editTree.taxonomicRank,
        iNaturalistId: editTree.iNaturalistId,
        seed_source: editTree.seed_source || '',
        nursery_stock_id: editTree.nursery_stock_id || '',
        condition_notes: editTree.condition_notes || '',
        management_actions: managementActions,
        iNaturalist_link: editTree.iNaturalist_link || '',
        verification_status: editTree.verification_status || 'pending',
        associated_species: editTree.associated_species || []
      });
      setManagementActionsInput(managementActions.join(', '));
    }
  }, [isEditMode, editTree]);
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

      if (isEditMode && editTree) {
        const updatedTree = TreeService.updateTree(editTree.id, formData);
        if (updatedTree) {
          toast({
            title: "Tree Updated Successfully! 🌳",
            description: `${updatedTree.species} has been updated.`,
          });
        }
      } else {
        const newTree = TreeService.addTree(formData);
        toast({
          title: "Tree Added Successfully! 🌳",
          description: `${newTree.species} has been added to your forest.`,
        });
      }
      
      setOpen(false);
      
      if (!isEditMode) {
        setFormData({
          species: '',
          location: { lat: 0, lng: 0 },
          date_planted: '',
          notes: '',
          images: [],
          scientificName: undefined,
          commonName: undefined,
          taxonomicRank: undefined,
          iNaturalistId: undefined,
          seed_source: '',
          nursery_stock_id: '',
          condition_notes: '',
          management_actions: [],
          iNaturalist_link: '',
          verification_status: 'pending',
          associated_species: []
        });
        setManagementActionsInput('');
      }
      
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
          toast({
            title: "Location Set",
            description: "Current location has been set successfully",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Unable to get current location. Please set manually.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      location: { lat, lng }
    }));
    toast({
      title: "Location Selected",
      description: `Coordinates set to ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    });
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
      const results = await iNaturalistService.searchTreeSpecies(formData.species);
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
    const iNaturalistLink = `https://www.inaturalist.org/taxa/${taxon.id}`;
    
    setFormData(prev => ({ 
      ...prev, 
      species: speciesName,
      scientificName: taxon.name,
      commonName: taxon.preferred_common_name,
      taxonomicRank: taxon.rank,
      iNaturalistId: taxon.id,
      iNaturalist_link: iNaturalistLink,
      verification_status: 'verified'
    }));
    setShowSearchResults(false);
    toast({
      title: "Species Selected",
      description: `Selected: ${speciesName}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button className="btn-primary-enhanced group">
            <Plus size={16} className="mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Add Tree
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] w-[95vw] sm:w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-800 flex items-center gap-2 text-lg sm:text-xl">
            🌳 {isEditMode ? 'Edit Tree' : 'Add New Tree'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Tree Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🌳</span>
              <h3 className="text-lg font-semibold text-green-800">Tree Details</h3>
            </div>
            
            <div>
              <Label htmlFor="species" className="text-green-700 font-medium text-sm sm:text-base">Species *</Label>
              <div className="flex flex-col sm:flex-row gap-2">
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
                  className="btn-search-enhanced shrink-0 w-full sm:w-auto"
                >
                  <Search size={16} className={`transition-transform duration-300 ${isSearching ? 'animate-spin' : ''}`} />
                  <span className="ml-2">{isSearching ? 'Searching...' : 'Search'}</span>
                </Button>
              </div>
              
              {showSearchResults && searchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-green-200 rounded-md bg-white shadow-sm">
                  {searchResults.map((taxon) => (
                    <button
                      key={taxon.id}
                      type="button"
                      onClick={() => selectSpecies(taxon)}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-green-100 last:border-b-0 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm"
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

            <div>
              <Label htmlFor="date_planted" className="text-green-700 font-medium">Date Planted</Label>
              <Input
                id="date_planted"
                type="date"
                value={formData.date_planted}
                onChange={(e) => setFormData(prev => ({ ...prev, date_planted: e.target.value }))}
                className="border-green-200 focus:border-green-400"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-green-700 font-medium">General Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any general notes about this tree..."
                rows={3}
                className="border-green-200 focus:border-green-400"
              />
            </div>
          </div>

          {/* Location Info Section */}
          <div className="border-t border-green-100 pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📍</span>
              <h3 className="text-lg font-semibold text-green-800">Location Info</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="latitude" className="text-green-700 font-medium text-sm sm:text-base">Latitude *</Label>
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
                <Label htmlFor="longitude" className="text-green-700 font-medium text-sm sm:text-base">Longitude *</Label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="btn-outline-enhanced w-full"
              >
                <span className="mr-2 transition-transform duration-300 hover:scale-110">📍</span>
                <span className="hidden xs:inline">Use Current Location</span>
                <span className="xs:hidden">Current Location</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLocationMap(!showLocationMap)}
                className="btn-outline-enhanced w-full"
              >
                <Map size={16} className="mr-2" />
                {showLocationMap ? 'Hide Map' : 'Pick on Map'}
              </Button>
            </div>

            {/* Interactive Map for Location Selection */}
            {showLocationMap && isClient && (
              <div className="mt-4 border border-green-200 rounded-lg overflow-hidden">
                <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                  <p className="text-sm text-green-700 font-medium">📍 Click on the map to set tree location</p>
                </div>
                <div className="h-64 w-full">
                  <MapContainer
                    center={formData.location.lat !== 0 && formData.location.lng !== 0 
                      ? [formData.location.lat, formData.location.lng] 
                      : [40.7128, -74.0060]} // Default to NYC
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="leaflet-container"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker
                      position={formData.location.lat !== 0 && formData.location.lng !== 0 
                        ? [formData.location.lat, formData.location.lng] 
                        : null}
                      onLocationSelect={handleMapLocationSelect}
                    />
                  </MapContainer>
                </div>
                <div className="bg-green-50 px-4 py-2 border-t border-green-200">
                  <p className="text-xs text-green-600">
                    💡 Tip: You can also enter coordinates manually in the fields above
                  </p>
                </div>
              </div>
            )}
            
            {/* Plus Code Preview */}
            {formData.location.lat !== 0 && formData.location.lng !== 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">Generated Plus Code Preview</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-green-600 mb-1">Global Code:</p>
                    <p className="font-mono text-sm bg-white border border-green-200 p-2 rounded text-green-800">
                      {PlusCodeService.encode(formData.location.lat, formData.location.lng).global}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Local Code:</p>
                    <p className="font-mono text-sm bg-white border border-green-200 p-2 rounded text-green-800">
                      {PlusCodeService.encode(formData.location.lat, formData.location.lng).local}
                    </p>
                  </div>
                  <div className="text-xs text-green-600">
                    Precision: {PlusCodeService.encode(formData.location.lat, formData.location.lng).areaSize} area
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Management Data Section */}
          <div className="border-t border-green-100 pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🌲</span>
              <h3 className="text-lg font-semibold text-green-800">Management Data</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="seed_source" className="text-green-700 font-medium text-sm sm:text-base">Seed Source</Label>
                <Input
                  id="seed_source"
                  value={formData.seed_source}
                  onChange={(e) => setFormData(prev => ({ ...prev, seed_source: e.target.value }))}
                  placeholder="e.g., Local nursery, wild collection..."
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              
              <div>
                <Label htmlFor="nursery_stock_id" className="text-green-700 font-medium text-sm sm:text-base">Nursery Stock ID</Label>
                <Input
                  id="nursery_stock_id"
                  value={formData.nursery_stock_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, nursery_stock_id: e.target.value }))}
                  placeholder="e.g., NST-2024-001"
                  className="border-green-200 focus:border-green-400"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="condition_notes" className="text-green-700 font-medium">Condition Notes</Label>
              <Textarea
                id="condition_notes"
                value={formData.condition_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, condition_notes: e.target.value }))}
                placeholder="Current health, visible damage, growth patterns..."
                rows={3}
                className="border-green-200 focus:border-green-400"
              />
            </div>
            
            <div>
              <Label htmlFor="management_actions" className="text-green-700 font-medium">Management Actions</Label>
              <Textarea
                id="management_actions"
                value={managementActionsInput}
                onChange={(e) => {
                  // Update input field immediately for smooth typing
                  setManagementActionsInput(e.target.value);
                }}
                onBlur={(e) => {
                  // Process into array format when user finishes editing
                  const inputValue = e.target.value.trim();
                  if (inputValue === '') {
                    setFormData(prev => ({ ...prev, management_actions: [] }));
                  } else {
                    const actions = inputValue.split(',').map(action => action.trim()).filter(action => action.length > 0);
                    setFormData(prev => ({ ...prev, management_actions: actions }));
                  }
                }}
                placeholder="watering, pruning, fertilizing, pest control... (separate with commas)"
                rows={2}
                className="border-green-200 focus:border-green-400"
              />
              <p className="text-xs text-green-600 mt-1">Separate multiple actions with commas</p>
            </div>

            {formData.iNaturalist_link && (
              <div>
                <Label htmlFor="iNaturalist_link" className="text-green-700 font-medium">iNaturalist Link</Label>
                <Input
                  id="iNaturalist_link"
                  value={formData.iNaturalist_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, iNaturalist_link: e.target.value }))}
                  placeholder="https://www.inaturalist.org/taxa/..."
                  className="border-green-200 focus:border-green-400"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="photo_urls" className="text-green-700 font-medium">Photo URLs</Label>
              <Textarea
                id="photo_urls"
                value={formData.images?.join('\n') || ''}
                onChange={(e) => {
                  const urls = e.target.value.split('\n').filter(url => url.trim());
                  setFormData(prev => ({ ...prev, images: urls }));
                }}
                placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg&#10;(one URL per line)"
                rows={3}
                className="border-green-200 focus:border-green-400"
              />
              <p className="text-xs text-green-600 mt-1">Enter photo URLs, one per line</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 btn-outline-enhanced order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary-enhanced order-1 sm:order-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">🌱</span>
                  {isEditMode ? 'Updating...' : 'Adding...'}
                </span>
              ) : (
                isEditMode ? 'Update Tree' : 'Add Tree'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}