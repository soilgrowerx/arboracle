'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tree, ConditionChecklistData } from '@/types/tree';
import { TreeService } from '@/services/treeService';
import { generatePlusCode } from '@/lib/utils';

import { Plus } from 'lucide-react';
import { LocationPickerMap } from './LocationPickerMap';
import { useRouter } from 'next/navigation';
import { ImageUpload } from './ImageUpload';
import { ConditionAssessmentForm } from './ConditionAssessmentForm';
import { UnitService, UnitSystem } from '@/services/unitService';

interface AddTreeModalProps {
  onTreeAdded: () => void;
  editTree?: Tree;
  isEditMode?: boolean;
}

export const AddTreeModal: React.FC<AddTreeModalProps> = ({ onTreeAdded, editTree, isEditMode = false }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Tree>({
    id: '',
    species: '',
    commonName: '',
    scientificName: '',
    lat: 0,
    lng: 0,
    plus_code_global: '',
    plus_code_local: '',
    date_planted: new Date().toISOString().split('T')[0],
    height_cm: 0,
    dbh_cm: 0,
    is_multi_stem: false,
    individual_stem_diameters_cm: '',
    canopy_spread_ns_cm: 0,
    canopy_spread_ew_cm: 0,
    condition_assessment: {
      structure: [],
      canopy_health: [],
      pests_diseases: [],
      site_conditions: [],
      arborist_summary: '',
      health_status: undefined,
      notes: {},
    },
    management_actions: [],
    seed_source: '',
    nursery_stock_id: '',
    verification_status: 'pending',
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    iNaturalistId: '',
    project_id: '', // New field for project association
  });
  const [dbhInput, setDbhInput] = useState('');
  const [individualStemDiametersInput, setIndividualStemDiametersInput] = useState('');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(UnitService.getPreferredUnitSystem());
  const router = useRouter();

  useEffect(() => {
    // Check for selected location from map page
    const storedLocation = localStorage.getItem('selectedMapLocation');
    if (storedLocation) {
      const { lat, lng } = JSON.parse(storedLocation);
      handleLocationSelect(lat, lng);
      localStorage.removeItem('selectedMapLocation'); // Clean up
    }
  }, []);

  useEffect(() => {
    if (isEditMode && editTree) {
      const currentUnitSystem = UnitService.getPreferredUnitSystem();
      setUnitSystem(currentUnitSystem);

      setFormData({
        ...editTree,
        date_planted: editTree.date_planted ? new Date(editTree.date_planted).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        created_at: editTree.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        condition_assessment: editTree.condition_assessment || {
          structure: [],
          canopy_health: [],
          pests_diseases: [],
          site_conditions: [],
          arborist_summary: '',
          health_status: undefined,
          notes: {},
        },
        management_actions: editTree.management_actions || [],
        height_cm: currentUnitSystem === 'imperial' && editTree.height_cm ? UnitService.convertCmToIn(editTree.height_cm) : editTree.height_cm,
        dbh_cm: currentUnitSystem === 'imperial' && editTree.dbh_cm ? UnitService.convertCmToIn(editTree.dbh_cm) : editTree.dbh_cm,
        canopy_spread_ns_cm: currentUnitSystem === 'imperial' && editTree.canopy_spread_ns_cm ? UnitService.convertCmToIn(editTree.canopy_spread_ns_cm) : editTree.canopy_spread_ns_cm,
        canopy_spread_ew_cm: currentUnitSystem === 'imperial' && editTree.canopy_spread_ew_cm ? UnitService.convertCmToIn(editTree.canopy_spread_ew_cm) : editTree.canopy_spread_ew_cm,
      });
      setDbhInput(currentUnitSystem === 'imperial' && editTree.dbh_cm ? String(UnitService.convertCmToIn(editTree.dbh_cm)) : String(editTree.dbh_cm || ''));
      setIndividualStemDiametersInput(editTree.individual_stem_diameters_cm ? 
        (currentUnitSystem === 'imperial' ? 
          editTree.individual_stem_diameters_cm.split(',').map(s => UnitService.convertCmToIn(parseFloat(s.trim())).toFixed(2)).join(', ') : 
          editTree.individual_stem_diameters_cm) : '');
    } else {
      // Reset form for add mode
      const currentUnitSystem = UnitService.getPreferredUnitSystem();
      setUnitSystem(currentUnitSystem);
      setFormData({
        id: '',
        species: '',
        commonName: '',
        scientificName: '',
        lat: 0,
        lng: 0,
        plus_code_global: '',
        plus_code_local: '',
        date_planted: new Date().toISOString().split('T')[0],
        height_cm: 0,
        dbh_cm: 0,
        is_multi_stem: false,
        individual_stem_diameters_cm: '',
        canopy_spread_ns_cm: 0,
        canopy_spread_ew_cm: 0,
        condition_assessment: {
          structure: [],
          canopy_health: [],
          pests_diseases: [],
          site_conditions: [],
          arborist_summary: '',
          health_status: undefined,
          notes: {},
        },
        management_actions: [],
        seed_source: '',
        nursery_stock_id: '',
        verification_status: 'pending',
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        iNaturalistId: '',
        project_id: '',
      });
      setDbhInput('');
      setIndividualStemDiametersInput('');
    }
  }, [editTree, isEditMode, isOpen]); // Re-run when modal opens/closes or editTree changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let numericValue = parseFloat(value);
    if (isNaN(numericValue)) numericValue = 0;

    if (unitSystem === 'imperial') {
      // Convert to cm for internal storage
      if (id === 'height_cm' || id === 'canopy_spread_ns_cm' || id === 'canopy_spread_ew_cm') {
        numericValue = UnitService.convertInToCm(numericValue);
      }
    }
    setFormData(prev => ({ ...prev, [id]: numericValue }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    const { globalCode, localCode } = generatePlusCode(lat, lng);
    setFormData(prev => ({
      ...prev,
      lat,
      lng,
      plus_code_global: globalCode,
      plus_code_local: localCode,
    }));
  };

  const handlePickOnMap = () => {
    router.push(`/map?lat=${formData.lat}&lng=${formData.lng}`);
  };

  const handleGetGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationSelect(position.coords.latitude, position.coords.longitude);
          toast({
            title: "GPS Location Captured",
            description: "Latitude and Longitude have been updated.",
          });
        },
        (error) => {
          console.error("Error getting GPS location:", error);
          toast({
            title: "GPS Error",
            description: "Could not retrieve GPS location. Please ensure location services are enabled.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "GPS Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const handleDbhChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDbhInput(value);
    let numericValue = parseFloat(value);
    if (isNaN(numericValue)) numericValue = 0;

    if (!formData.is_multi_stem) {
      setFormData(prev => ({ ...prev, dbh_cm: unitSystem === 'imperial' ? UnitService.convertInToCm(numericValue) : numericValue }));
    }
  };

  const handleIndividualStemDiametersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIndividualStemDiametersInput(value);
    setFormData(prev => ({ ...prev, individual_stem_diameters_cm: value }));

    if (formData.is_multi_stem) {
      const diameters = value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
      if (diameters.length > 0) {
        const convertedDiameters = unitSystem === 'imperial' ? diameters.map(d => UnitService.convertInToCm(d)) : diameters;
        const calculatedDbh = Math.sqrt(convertedDiameters.reduce((sum, d) => sum + d * d, 0));
        setFormData(prev => ({ ...prev, dbh_cm: parseFloat(calculatedDbh.toFixed(2)) }));
      } else {
        setFormData(prev => ({ ...prev, dbh_cm: 0 }));
      }
    }
  };

  const handleMultiStemToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_multi_stem: checked }));
    if (!checked) {
      // If switching to single stem, reset individual stem diameters and use dbhInput for dbh_cm
      setIndividualStemDiametersInput('');
      setFormData(prev => ({
        ...prev,
        individual_stem_diameters_cm: '',
        dbh_cm: parseFloat(dbhInput) || 0,
      }));
    } else {
      // If switching to multi-stem, calculate dbh from individual stems if available
      handleIndividualStemDiametersChange({ target: { value: individualStemDiametersInput } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleConditionChecklistChange = (category: keyof ConditionChecklistData, item: string, isChecked: boolean) => {
    setFormData(prev => {
      const currentCategory = prev.condition_assessment?.[category] || [];
      const newCategory = isChecked
        ? [...currentCategory, item]
        : currentCategory.filter(i => i !== item);

      return {
        ...prev,
        condition_assessment: {
          ...prev.condition_assessment,
          [category]: newCategory,
        },
      };
    });
  };

  const handleConditionNoteChange = (item: string, note: string) => {
    setFormData(prev => ({
      ...prev,
      condition_assessment: {
        ...prev.condition_assessment,
        notes: {
          ...prev.condition_assessment?.notes,
          [item]: note,
        },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = { ...formData };

    // Convert imperial to metric if current unit system is imperial
    if (unitSystem === 'imperial') {
      dataToSave.height_cm = UnitService.convertInToCm(formData.height_cm);
      dataToSave.dbh_cm = UnitService.convertInToCm(formData.dbh_cm);
      dataToSave.canopy_spread_ns_cm = UnitService.convertInToCm(formData.canopy_spread_ns_cm);
      dataToSave.canopy_spread_ew_cm = UnitService.convertInToCm(formData.canopy_spread_ew_cm);
      if (dataToSave.individual_stem_diameters_cm) {
        dataToSave.individual_stem_diameters_cm = dataToSave.individual_stem_diameters_cm.split(',').map(s => UnitService.convertInToCm(parseFloat(s.trim())).toFixed(2)).join(', ');
      }
    }

    try {
      if (isEditMode) {
        TreeService.updateTree(dataToSave);
        toast({
          title: "Tree Updated",
          description: `${formData.commonName || formData.species} has been updated successfully.`,
        });
      } else {
        TreeService.addTree(dataToSave);
        toast({
          title: "Tree Added",
          description: `${formData.commonName || formData.species} has been added to your inventory.`,
        });
      }
      onTreeAdded();
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving tree:", error);
      toast({
        title: "Error",
        description: `Failed to save tree: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full btn-primary-enhanced group touch-target mobile-button font-bold bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 hover:from-green-700 hover:via-green-800 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0 h-14 sm:h-16"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all duration-300">
              <Plus size={18} className="text-white transition-transform duration-300 group-hover:rotate-90" />
            </div>
            <span className="text-lg font-bold">+ Add Tree</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Tree' : 'Add New Tree'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Tree Details */}
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold text-green-700">Tree Details</h3>
            <Label htmlFor="species">Species</Label>
            <Input id="species" value={formData.species} onChange={handleChange} required />
            <Label htmlFor="commonName">Common Name</Label>
            <Input id="commonName" value={formData.commonName || ''} onChange={handleChange} />
            <Label htmlFor="scientificName">Scientific Name</Label>
            <Input id="scientificName" value={formData.scientificName || ''} onChange={handleChange} />
            <Label htmlFor="notes">General Notes</Label>
            <Textarea id="notes" value={formData.notes || ''} onChange={handleChange} />
          </div>

          {/* Location Information */}
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold text-green-700">Location Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input id="lat" type="number" step="any" value={formData.lat} onChange={handleNumberChange} required />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input id="lng" type="number" step="any" value={formData.lng} onChange={handleNumberChange} required />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button type="button" onClick={handleGetGPS} variant="outline">Get Current GPS</Button>
              <Button type="button" onClick={handlePickOnMap} variant="outline">Pick on Map</Button>
            </div>
            
            <Label htmlFor="plus_code_global">Plus Code (Global)</Label>
            <Input id="plus_code_global" value={formData.plus_code_global || ''} readOnly />
            <Label htmlFor="plus_code_local">Plus Code (Local)</Label>
            <Input id="plus_code_local" value={formData.plus_code_local || ''} readOnly />
            
            
          </div>

          {/* Tree Measurements */}
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold text-green-700">Tree Measurements</h3>
            <Label htmlFor="height_cm">{UnitService.getUnitLabels(unitSystem).height}</Label>
            <Input id="height_cm" type="number" step="any" value={unitSystem === 'imperial' ? UnitService.convertCmToIn(formData.height_cm).toFixed(2) : formData.height_cm} onChange={handleNumberChange} />
            
            <Label htmlFor="dbh_cm">{UnitService.getUnitLabels(unitSystem).dbh}</Label>
            <Input id="dbh_cm" type="number" step="any" value={dbhInput} onChange={handleDbhChange} disabled={formData.is_multi_stem} />

            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="is_multi_stem"
                checked={formData.is_multi_stem}
                onChange={(e) => handleMultiStemToggle(e.target.checked)}
                className="form-checkbox"
              />
              <Label htmlFor="is_multi_stem">Multi-stem tree?</Label>
            </div>

            {formData.is_multi_stem && (
              <div className="grid gap-2 mt-2">
                <Label htmlFor="individual_stem_diameters_cm">Individual Stem Diameters ({unitSystem === 'imperial' ? 'in' : 'cm'}, comma-separated)</Label>
                <Input
                  id="individual_stem_diameters_cm"
                  value={individualStemDiametersInput}
                  onChange={handleIndividualStemDiametersChange}
                  placeholder={unitSystem === 'imperial' ? 'e.g., 4, 6, 8' : 'e.g., 10, 15, 20'}
                />
              </div>
            )}

            <Label htmlFor="canopy_spread_ns_cm">Canopy Spread N-S ({unitSystem === 'imperial' ? 'ft' : 'cm'})</Label>
            <Input id="canopy_spread_ns_cm" type="number" step="any" value={unitSystem === 'imperial' ? UnitService.convertCmToIn(formData.canopy_spread_ns_cm).toFixed(2) : formData.canopy_spread_ns_cm} onChange={handleNumberChange} />
            <Label htmlFor="canopy_spread_ew_cm">Canopy Spread E-W ({unitSystem === 'imperial' ? 'ft' : 'cm'})</Label>
            <Input id="canopy_spread_ew_cm" type="number" step="any" value={unitSystem === 'imperial' ? UnitService.convertCmToIn(formData.canopy_spread_ew_cm).toFixed(2) : formData.canopy_spread_ew_cm} onChange={handleNumberChange} />
          </div>

          {/* Management Data */}
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold text-green-700">Management Data</h3>
            <Label htmlFor="project_id">Project Association</Label>
            <Select value={formData.project_id} onValueChange={(value) => handleSelectChange('project_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {/* TODO: Populate with actual projects from Admin Panel */}
                <SelectItem value="project1">Project Alpha</SelectItem>
                <SelectItem value="project2">Project Beta</SelectItem>
              </SelectContent>
            </Select>

            <ConditionAssessmentForm
              initialConditionAssessment={formData.condition_assessment || {
                structure: [],
                canopy_health: [],
                pests_diseases: [],
                site_conditions: [],
                arborist_summary: '',
                notes: {},
              }}
              onConditionAssessmentChange={(newAssessment) =>
                setFormData((prev) => ({ ...prev, condition_assessment: newAssessment }))
              }
            />

            <Label htmlFor="management_actions">Management Actions (comma-separated)</Label>
            <Input
              id="management_actions"
              value={formData.management_actions?.join(', ') || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, management_actions: e.target.value.split(',').map(s => s.trim()) }))}
              placeholder="e.g., Pruning, Pest Treatment"
            />
          </div>

          {/* Other Details */}
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold text-green-700">Other Details</h3>
            <Label htmlFor="date_planted">Date Planted</Label>
            <Input id="date_planted" type="date" value={formData.date_planted} onChange={handleChange} />
            <Label htmlFor="seed_source">Seed Source</Label>
            <Input id="seed_source" value={formData.seed_source || ''} onChange={handleChange} />
            <Label htmlFor="nursery_stock_id">Nursery Stock ID</Label>
            <Input id="nursery_stock_id" value={formData.nursery_stock_id || ''} onChange={handleChange} />
            <Label htmlFor="verification_status">Verification Status</Label>
            <Select value={formData.verification_status} onValueChange={(value) => handleSelectChange('verification_status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold text-green-700">Tree Images</h3>
            <ImageUpload
              initialImages={formData.images}
              onImagesChange={(newImages) => setFormData(prev => ({ ...prev, images: newImages }))}
            />
          </div>

          <Button type="submit" className="w-full btn-primary-enhanced mt-4">
            {isEditMode ? 'Save Changes' : 'Add Tree'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
