'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TreeFormData, Tree } from '@/types/tree';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search, MapPin, Map } from 'lucide-react';
import { TaxonomyBreadcrumb } from '@/components/TaxonomicDisplay';
import ConditionAssessment, { ConditionChecklistData } from '@/components/ConditionAssessment';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

interface AddTreeModalProps {
  onTreeAdded?: () => void;
  editTree?: Tree;
  isEditMode?: boolean;
}

// Map click handler component - improved version
function LocationPicker({ position, onLocationSelect }: { position: [number, number] | null, onLocationSelect: (lat: number, lng: number) => void }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) return null;
  
  const MapEventsHandler = () => {
    const { useMapEvents } = require('react-leaflet');
    
    const map = useMapEvents({
      click: (e: any) => {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
      ready: () => {
        // Ensure map is properly sized when ready
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      },
    });

    useEffect(() => {
      if (position && map) {
        map.setView(position, map.getZoom());
      }
    }, [map]); // position is a prop from outer scope, not a state variable

    return null;
  };

  return (
    <>
      <MapEventsHandler />
      {position ? <Marker position={position} /> : null}
    </>
  );
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

  // Handle map size invalidation when modal opens/closes
  useEffect(() => {
    if (showLocationMap && isClient) {
      // Delay to allow modal animation to complete
      const timer = setTimeout(() => {
        // Force all leaflet maps to invalidate their size
        if (typeof window !== 'undefined' && (window as any).L) {
          const L = (window as any).L;
          // Check if _mapById exists on the L object
          if (L._mapById) {
            const maps = Object.values(L._mapById);
            maps.forEach((map: any) => {
              if (map && map.invalidateSize) {
                map.invalidateSize();
              }
            });
          }
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [showLocationMap, isClient]);
  const [stemDiametersInput, setStemDiametersInput] = useState('');
  const [units, setUnits] = useState('metric'); // Track user's unit preference

  // Load unit preference from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('arboracle_user_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setUnits(settings.preferences?.units || 'metric');
      }
    } catch (error) {
      console.error('Error loading unit preference:', error);
    }
  }, []);

  // Helper function to get unit labels based on user preference
  const getUnitLabels = () => {
    if (units === 'imperial') {
      return {
        height: 'Height (ft)',
        dbh: 'DBH (in)',
        canopyNS: 'Canopy Spread N-S (ft)',
        canopyEW: 'Canopy Spread E-W (ft)',
        stemDiameters: 'Individual Stem Diameters (in)'
      };
    }
    return {
      height: 'Height (cm)',
      dbh: 'DBH (cm)',
      canopyNS: 'Canopy Spread N-S (m)',
      canopyEW: 'Canopy Spread E-W (m)',
      stemDiameters: 'Individual Stem Diameters (cm)'
    };
  };

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
    taxonomy: undefined,
    seed_source: '',
    nursery_stock_id: '',
    condition_assessment: {
      checklist: {
        structure: [],
        canopy_health: [],
        pests_diseases: [],
        site_conditions: []
      },
      arborist_summary: '',
      health_status: undefined,
      notes: {}
    },
    management_actions: [],
    iNaturalist_link: '',
    verification_status: 'pending',
    associated_species: [],
    land_owner: '',
    site_name: '',
    height_cm: undefined,
    dbh_cm: undefined,
    health_status: undefined
  });

  // Handle image upload from camera or gallery
  const handleImageUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;

    try {
      // Generate temporary tree ID if not editing
      const treeId = editTree?.id || `temp-${Date.now()}`;
      
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('treeId', treeId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.urls) {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...result.urls]
        }));
        
        toast({
          title: "Images uploaded",
          description: `${result.urls.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    }
    
    // Reset the input
    input.value = '';
  };

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
        taxonomy: editTree.taxonomy,
        seed_source: editTree.seed_source || '',
        nursery_stock_id: editTree.nursery_stock_id || '',
        condition_assessment: editTree.condition_assessment || {
          checklist: {
            structure: [],
            canopy_health: [],
            pests_diseases: [],
            site_conditions: []
          },
          arborist_summary: '',
          health_status: undefined,
          notes: {}
        },
        management_actions: managementActions,
        iNaturalist_link: editTree.iNaturalist_link || '',
        verification_status: editTree.verification_status || 'pending',
        associated_species: editTree.associated_species || [],
        land_owner: editTree.land_owner || '',
        site_name: editTree.site_name || '',
        height_cm: editTree.height_cm,
        dbh_cm: editTree.dbh_cm,
        health_status: editTree.health_status
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
          taxonomy: undefined,
          seed_source: '',
          nursery_stock_id: '',
          condition_assessment: {
            checklist: {
              structure: [],
              canopy_health: [],
              pests_diseases: [],
              site_conditions: []
            },
            arborist_summary: '',
            health_status: undefined,
            notes: {}
          },
          management_actions: [],
          iNaturalist_link: '',
          verification_status: 'pending',
          associated_species: [],
          land_owner: '',
          site_name: '',
          height_cm: undefined,
          dbh_cm: undefined,
          health_status: undefined
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

  const selectSpecies = async (taxon: any) => {
    const speciesName = taxon.preferred_common_name || taxon.name;
    const iNaturalistLink = `https://www.inaturalist.org/taxa/${taxon.id}`;
    
    try {
      // Get detailed taxonomic information
      const detailedTaxon = await iNaturalistService.getDetailedTaxonWithHierarchy(taxon.id);
      const taxonomy = detailedTaxon ? detailedTaxon.taxonomy : iNaturalistService.parseTaxonomicHierarchy(taxon);
      
      setFormData(prev => ({ 
        ...prev, 
        species: speciesName,
        scientificName: taxon.name,
        commonName: taxon.preferred_common_name,
        taxonomicRank: taxon.rank,
        iNaturalistId: taxon.id,
        taxonomy: taxonomy,
        iNaturalist_link: iNaturalistLink,
        verification_status: 'verified',
        // Enhanced data from detailed taxon info
        description: detailedTaxon?.description,
        distribution_info: detailedTaxon?.distribution_info,
        conservation_status: detailedTaxon?.conservation_status,
        photos: detailedTaxon?.enhanced_photos
      }));
      setShowSearchResults(false);
      toast({
        title: "Species Selected",
        description: `Selected: ${speciesName} with full taxonomic data`,
      });
    } catch (error) {
      console.error('Error getting detailed taxon info:', error);
      // Fallback to basic taxonomic parsing
      const taxonomy = iNaturalistService.parseTaxonomicHierarchy(taxon);
      
      setFormData(prev => ({ 
        ...prev, 
        species: speciesName,
        scientificName: taxon.name,
        commonName: taxon.preferred_common_name,
        taxonomicRank: taxon.rank,
        iNaturalistId: taxon.id,
        taxonomy: taxonomy,
        iNaturalist_link: iNaturalistLink,
        verification_status: 'verified'
      }));
      setShowSearchResults(false);
      toast({
        title: "Species Selected",
        description: `Selected: ${speciesName}`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button className="w-full btn-primary-enhanced group touch-target mobile-button font-bold bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 hover:from-green-700 hover:via-green-800 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0 h-14 sm:h-16">
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all duration-300">
                <Plus size={18} className="text-white transition-transform duration-300 group-hover:rotate-90" />
              </div>
              <span className="text-lg font-bold">+ Add Tree</span>
            </div>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="mobile-modal sm:max-w-[700px] overflow-y-auto">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="text-green-800 flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            🌳 {isEditMode ? 'Edit Tree' : 'Add New Tree'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Tree Details Section */}
          <div className="bg-gradient-to-r from-green-50 to-green-25 p-4 sm:p-5 rounded-lg border border-green-100 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-4 pb-2 border-b border-green-200">
              <span className="text-lg sm:text-xl">🌳</span>
              <h3 className="text-lg sm:text-xl font-bold text-green-800">Tree Details</h3>
              <div className="ml-auto text-xs sm:text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Required</div>
            </div>
            
            <div>
              <Label htmlFor="species" className="text-green-700 font-medium text-sm sm:text-base">Species *</Label>
              <div className="flex flex-col gap-2 mt-1">
                <Input
                  id="species"
                  value={formData.species}
                  onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                  placeholder="e.g., Oak, Maple, Pine..."
                  required
                  className={`border-green-200 focus:border-green-400 text-sm sm:text-base ${
                    errors.some(e => e.includes('Species')) ? 'border-red-500' : ''
                  }`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={searchSpecies}
                  disabled={isSearching}
                  className="btn-search-enhanced w-full touch-target mobile-button"
                >
                  <Search size={14} className={`transition-transform duration-300 ${isSearching ? 'animate-spin' : ''}`} />
                  <span className="ml-2 mobile-text">{isSearching ? 'Searching...' : 'Search'}</span>
                </Button>
              </div>
              
              {showSearchResults && searchResults.length > 0 && (
                <div className="mt-2 max-h-48 sm:max-h-60 overflow-y-auto border border-green-200 rounded-md bg-white shadow-sm">
                  {searchResults.map((taxon) => {
                    const taxonomy = iNaturalistService.parseTaxonomicHierarchy(taxon);
                    return (
                      <button
                        key={taxon.id}
                        type="button"
                        onClick={() => selectSpecies(taxon)}
                        className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-green-50 border-b border-green-100 last:border-b-0 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm"
                      >
                        <div className="font-medium text-green-800 mb-1 text-sm sm:text-base">
                          {taxon.preferred_common_name || taxon.name}
                        </div>
                        <div className="text-xs sm:text-sm text-green-600 mb-1 sm:mb-2">
                          <span className="italic font-serif">{taxon.name}</span> • <span className="text-xs bg-green-100 px-1 sm:px-2 py-0.5 rounded-full">{taxon.rank}</span>
                        </div>
                        {taxonomy && (
                          <div className="mt-1 hidden sm:block">
                            <TaxonomyBreadcrumb taxonomy={taxonomy} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="date_planted" className="text-green-700 font-medium text-sm sm:text-base">Date Planted</Label>
              <Input
                id="date_planted"
                type="date"
                value={formData.date_planted}
                onChange={(e) => setFormData(prev => ({ ...prev, date_planted: e.target.value }))}
                className="border-green-200 focus:border-green-400 text-sm sm:text-base mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-green-700 font-medium text-sm sm:text-base">General Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any general notes about this tree..."
                rows={2}
                className="border-green-200 focus:border-green-400 text-sm sm:text-base mt-1 resize-none"
              />
            </div>
          </div>

          {/* Location Info Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-25 p-4 sm:p-5 rounded-lg border border-blue-100 space-y-3 sm:space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-4 pb-2 border-b border-blue-200">
              <span className="text-lg sm:text-xl">📍</span>
              <h3 className="text-lg sm:text-xl font-bold text-blue-800">Location Info</h3>
              <div className="ml-auto text-xs sm:text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full">Required</div>
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
                  className={`border-green-200 focus:border-green-400 text-sm sm:text-base mt-1 ${
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
                  className={`border-green-200 focus:border-green-400 text-sm sm:text-base mt-1 ${
                    errors.some(e => e.includes('Longitude') || e.includes('Location')) ? 'border-red-500' : ''
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="btn-outline-enhanced w-full touch-target mobile-button"
              >
                <span className="mr-2 transition-transform duration-300 hover:scale-110">📍</span>
                <span className="hidden xs:inline">Use Current Location</span>
                <span className="xs:hidden">Current GPS</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLocationMap(!showLocationMap)}
                className="btn-outline-enhanced w-full touch-target mobile-button"
              >
                <Map size={14} className="mr-2" />
                {showLocationMap ? 'Hide Map' : 'Pick on Map'}
              </Button>
            </div>

            {/* Interactive Map for Location Selection */}
            {showLocationMap && isClient && (
              <div className="mt-3 sm:mt-4 border border-green-200 rounded-lg overflow-hidden">
                <div className="bg-green-50 px-3 sm:px-4 py-2 border-b border-green-200">
                  <p className="text-xs sm:text-sm text-green-700 font-medium">📍 Click on the map to set tree location</p>
                </div>
                <div className="h-48 sm:h-64 w-full relative">
                  <MapContainer
                    center={formData.location.lat !== 0 && formData.location.lng !== 0 
                      ? [formData.location.lat, formData.location.lng] 
                      : [40.7128, -74.0060]} // Default to NYC
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="leaflet-container"
                    key={`map-${showLocationMap}`} // Force re-render when map shows/hides
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maxZoom={19}
                      minZoom={1}
                    />
                    <LocationPicker
                      position={formData.location.lat !== 0 && formData.location.lng !== 0 
                        ? [formData.location.lat, formData.location.lng] 
                        : null}
                      onLocationSelect={handleMapLocationSelect}
                    />
                  </MapContainer>
                </div>
                <div className="bg-green-50 px-3 sm:px-4 py-2 border-t border-green-200">
                  <p className="text-xs text-green-600">
                    💡 Tip: You can also enter coordinates manually in the fields above
                  </p>
                </div>
              </div>
            )}
            
            {/* Plus Code Preview */}
            {formData.location.lat !== 0 && formData.location.lng !== 0 && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-green-600" />
                  <span className="text-xs sm:text-sm font-medium text-green-700">Generated Plus Code Preview</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-green-600 mb-1">Global Code:</p>
                    <p className="font-mono text-xs sm:text-sm bg-white border border-green-200 p-2 rounded text-green-800 break-all">
                      {PlusCodeService.encode(formData.location.lat, formData.location.lng).global}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Local Code:</p>
                    <p className="font-mono text-xs sm:text-sm bg-white border border-green-200 p-2 rounded text-green-800 break-all">
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

          {/* Tree Measurements Section */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-25 p-4 sm:p-5 rounded-lg border border-purple-100 space-y-3 sm:space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-4 pb-2 border-b border-purple-200">
              <span className="text-lg sm:text-xl">📏</span>
              <h3 className="text-lg sm:text-xl font-bold text-purple-800">Tree Measurements</h3>
              <div className="ml-auto text-xs sm:text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Optional</div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="height_cm" className="text-green-700 font-medium text-sm sm:text-base">{getUnitLabels().height}</Label>
                <Input
                  id="height_cm"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.height_cm || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, height_cm: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="e.g., 350"
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              
              <div>
                <Label htmlFor="dbh_cm" className="text-green-700 font-medium text-sm sm:text-base">{getUnitLabels().dbh}</Label>
                <Input
                  id="dbh_cm"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.dbh_cm !== undefined ? formData.dbh_cm.toString() : ''}
                  onChange={(e) => {
                    // Don't allow manual changes when multi-stem is enabled
                    if (formData.is_multi_stem) return;
                    setFormData(prev => ({ ...prev, dbh_cm: e.target.value ? parseFloat(e.target.value) : undefined }));
                  }}
                  placeholder="e.g., 45.5"
                  className="border-green-200 focus:border-green-400"
                  readOnly={formData.is_multi_stem}
                  disabled={formData.is_multi_stem}
                />
                <p className="text-xs text-green-600 mt-1">
                  {formData.is_multi_stem 
                    ? "Auto-calculated using ISA formula: √(d1² + d2² + ...)" 
                    : "Diameter at Breast Height"}
                </p>
              </div>
            </div>

            {/* Multi-stem checkbox */}
            <div className="flex items-center space-x-3 mt-4">
              <input
                type="checkbox"
                id="is_multi_stem"
                checked={formData.is_multi_stem || false}
                onChange={(e) => {
                  const isMultiStem = e.target.checked;
                  setFormData(prev => ({ 
                    ...prev, 
                    is_multi_stem: isMultiStem,
                    // Clear stem diameters and DBH calculation when unchecking multi-stem
                    ...(isMultiStem ? {} : { stem_diameters: undefined, dbh_cm: undefined })
                  }));
                }}
                className="w-4 h-4 text-green-600 bg-green-100 border-green-300 rounded focus:ring-green-500"
              />
              <label htmlFor="is_multi_stem" className="text-green-700 font-medium">
                Multi-stem tree?
              </label>
            </div>

            {/* Show stem diameters if multi-stem is checked */}
            {formData.is_multi_stem && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Label className="text-green-700 font-medium text-sm mb-2 block">
                  {getUnitLabels().stemDiameters}
                </Label>
                <Input
                  type="text"
                  value={stemDiametersInput}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setStemDiametersInput(inputValue);
                    
                    // Don't process if input is empty
                    if (!inputValue.trim()) {
                      setFormData(prev => ({ 
                        ...prev, 
                        stem_diameters: undefined,
                        dbh_cm: undefined
                      }));
                      return;
                    }
                    
                    // Split by comma and parse each value, filtering out invalid numbers
                    const splitValues = inputValue.split(',');
                    const trimmedValues = splitValues.map(v => v.trim());
                    const nonEmptyValues = trimmedValues.filter(v => v.length > 0);
                    const parsedValues = nonEmptyValues.map(v => parseFloat(v));
                    const values = parsedValues.filter(v => !isNaN(v) && v > 0);
                    
                    console.log('DEBUG: Multi-stem parsing:', {
                      inputValue,
                      splitValues,
                      trimmedValues,
                      nonEmptyValues,
                      parsedValues,
                      values,
                      step: 'parsing'
                    });
                    
                    // Calculate ISA multi-stem DBH: √(d1² + d2² + d3² + ...)
                    let calculatedDBH: number | undefined = undefined;
                    if (values.length > 1) {
                      const sumOfSquares = values.reduce((sum, diameter) => sum + (diameter * diameter), 0);
                      calculatedDBH = Math.round(Math.sqrt(sumOfSquares) * 100) / 100; // Round to 2 decimal places
                      console.log('Multi-stem calculation:', { 
                        inputValue, 
                        values, 
                        sumOfSquares, 
                        calculatedDBH,
                        typeof: typeof calculatedDBH,
                        mathSqrt: Math.sqrt(sumOfSquares),
                        debugStep: 'final calculation'
                      });
                    } else if (values.length === 1) {
                      calculatedDBH = values[0];
                    }
                    
                    // Update state with proper type safety - ensure we only store parsed values
                    setFormData(prev => ({ 
                      ...prev, 
                      stem_diameters: values.length > 0 ? values : undefined,
                      dbh_cm: calculatedDBH
                    }));
                  }}
                  placeholder="e.g., 12.5, 15.3, 18.0"
                  className="border-green-200 focus:border-green-400"
                />
                <p className="text-xs text-green-600 mt-1">Separate multiple values with commas</p>
              </div>
            )}

            {/* Canopy spread measurements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div>
                <Label htmlFor="canopy_spread_ns" className="text-green-700 font-medium text-sm sm:text-base">
                  {getUnitLabels().canopyNS}
                </Label>
                <Input
                  id="canopy_spread_ns"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.canopy_spread_ns || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, canopy_spread_ns: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  placeholder="e.g., 12.5"
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              
              <div>
                <Label htmlFor="canopy_spread_ew" className="text-green-700 font-medium text-sm sm:text-base">
                  {getUnitLabels().canopyEW}
                </Label>
                <Input
                  id="canopy_spread_ew"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.canopy_spread_ew || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, canopy_spread_ew: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  placeholder="e.g., 15.0"
                  className="border-green-200 focus:border-green-400"
                />
              </div>
            </div>
          </div>

          {/* Management Data Section */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-25 p-4 sm:p-5 rounded-lg border border-amber-100 space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-amber-200">
              <span className="text-lg sm:text-xl">🌲</span>
              <h3 className="text-lg sm:text-xl font-bold text-amber-800">Management Data</h3>
              <div className="ml-auto text-xs sm:text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Professional</div>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="land_owner" className="text-green-700 font-medium text-sm sm:text-base">Land Owner</Label>
                <Input
                  id="land_owner"
                  value={formData.land_owner}
                  onChange={(e) => setFormData(prev => ({ ...prev, land_owner: e.target.value }))}
                  placeholder="e.g., City Parks, Private owner..."
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              
              <div>
                <Label htmlFor="site_name" className="text-green-700 font-medium text-sm sm:text-base">Site Name</Label>
                <Input
                  id="site_name"
                  value={formData.site_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                  placeholder="e.g., Central Park, Smith Property..."
                  className="border-green-200 focus:border-green-400"
                />
              </div>
            </div>
            
            <ConditionAssessment
              value={formData.condition_assessment!}
              onChange={(conditionAssessment) => setFormData(prev => ({ ...prev, condition_assessment: conditionAssessment }))}
            />
            
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
              <Label htmlFor="health_status" className="text-green-700 font-medium">Health Status</Label>
              <Select value={formData.health_status || ''} onValueChange={(value: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead') => setFormData(prev => ({ ...prev, health_status: value }))}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select health status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="Dead">Dead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-green-700 font-medium">Photos</Label>
              <div className="space-y-3">
                {/* Photo Upload Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.capture = 'environment';
                      input.multiple = true;
                      input.onchange = handleImageUpload;
                      input.click();
                    }}
                    className="border-green-200 text-green-700 hover:bg-green-50 flex items-center justify-center gap-2 py-3"
                  >
                    <span className="text-lg">📷</span>
                    Camera
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.multiple = true;
                      input.onchange = handleImageUpload;
                      input.click();
                    }}
                    className="border-green-200 text-green-700 hover:bg-green-50 flex items-center justify-center gap-2 py-3"
                  >
                    <span className="text-lg">🖼️</span>
                    Gallery
                  </Button>
                </div>
                
                {/* Selected Images Preview */}
                {(formData.images && formData.images.length > 0) && (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-medium">Selected Photos ({formData.images.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          {image.startsWith('data:') ? (
                            // Base64 image preview
                            <img 
                              src={image} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                          ) : (
                            // URL-based image or placeholder
                            <div className="w-full h-20 bg-green-100 rounded border flex items-center justify-center">
                              <span className="text-green-600 text-xs">📷 {index + 1}</span>
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newImages = [...(formData.images || [])];
                              newImages.splice(index, 1);
                              setFormData(prev => ({ ...prev, images: newImages }));
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-green-600">Tap Camera to take photos or Gallery to select from your device</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-green-100">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary-enhanced touch-target mobile-button font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">🌱</span>
                  <span className="mobile-text">{isEditMode ? 'Updating...' : 'Adding...'}</span>
                </span>
              ) : (
                <span className="mobile-text">{isEditMode ? 'Update Tree' : 'Add Tree'}</span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full btn-outline-enhanced touch-target mobile-button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}