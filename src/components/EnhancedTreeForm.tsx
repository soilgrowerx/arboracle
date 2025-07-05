'use client';

import React, { useState, useEffect } from 'react';
import { Tree, ConditionAssessment } from '@/types/tree';
import { Assessment, ConstructionMonitoringData } from '@/types/project';
import { generateEnhancedPlusCode, getPrecisionForTreeSize, formatSoilArea } from '@/lib/enhancedPlusCodes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ConditionAssessmentForm } from './ConditionAssessmentForm';
import { ConstructionMonitoringForm } from './ConstructionMonitoringForm';
import { LocationPickerMap } from './LocationPickerMap';
import { ImageUpload } from './ImageUpload';
import { MapPin, TreePine, FileText, Camera, Target, Ruler } from 'lucide-react';

interface EnhancedTreeFormProps {
  initialTree?: Partial<Tree>;
  onSubmit: (tree: Tree) => void;
  onCancel: () => void;
  projects: Array<{ id: string; name: string; project_type: string }>;
}

export const EnhancedTreeForm: React.FC<EnhancedTreeFormProps> = ({
  initialTree,
  onSubmit,
  onCancel,
  projects
}) => {
  const [formData, setFormData] = useState<Partial<Tree>>({
    species: '',
    commonName: '',
    scientificName: '',
    lat: 0,
    lng: 0,
    plus_code_global: '',
    plus_code_local: '',
    plus_code_precise: '',
    tree_address: '',
    soil_responsibility_area: 0,
    date_planted: new Date().toISOString().split('T')[0],
    height_cm: 0,
    dbh_cm: 0,
    is_multi_stem: false,
    individual_stem_diameters_cm: '',
    canopy_spread_ns_cm: 0,
    canopy_spread_ew_cm: 0,
    notes: '',
    images: [],
    verification_status: 'manual',
    ...initialTree
  });

  const [selectedProject, setSelectedProject] = useState('');
  const [assessmentType, setAssessmentType] = useState<'standard' | 'construction_monitoring'>('standard');
  const [conditionAssessment, setConditionAssessment] = useState<ConditionAssessment>({
    structure: [],
    canopy_health: [],
    pests_diseases: [],
    site_conditions: [],
    arborist_summary: '',
    notes: {}
  });
  const [constructionData, setConstructionData] = useState<ConstructionMonitoringData>({
    area_description: '',
    tpz_fencing: 'not_installed',
    tpz_incursions: 'none',
    tpz_mulch: 'not_installed',
    crz_impacts: [],
    overall_condition: 'good',
    canopy_density: 'full',
    canopy_color: 'vibrant',
    canopy_dieback: 'none',
    canopy_impact_notes: 'none',
    specific_notes: '',
    recommended_action: ''
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  useEffect(() => {
    // Update Plus Code when location changes
    if (formData.lat && formData.lng && formData.dbh_cm) {
      const precision = getPrecisionForTreeSize(formData.dbh_cm);
      const plusCodeData = generateEnhancedPlusCode(formData.lat, formData.lng, precision);
      
      setFormData(prev => ({
        ...prev,
        plus_code_global: plusCodeData.global,
        plus_code_local: plusCodeData.local,
        plus_code_precise: plusCodeData.precise,
        tree_address: plusCodeData.treeAddress,
        soil_responsibility_area: plusCodeData.soilResponsibilityArea
      }));
    }
  }, [formData.lat, formData.lng, formData.dbh_cm]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    setIsLocationPickerOpen(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationSelect(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleSubmit = () => {
    const treeData: Tree = {
      id: initialTree?.id || Date.now().toString(),
      created_at: initialTree?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      condition_assessment: conditionAssessment,
      ...formData
    } as Tree;

    onSubmit(treeData);
  };

  const getFormCompletionPercentage = () => {
    const requiredFields = ['species', 'lat', 'lng', 'date_planted'];
    const optionalFields = ['commonName', 'scientificName', 'height_cm', 'dbh_cm', 'notes'];
    
    const completedRequired = requiredFields.filter(field => formData[field as keyof Tree]).length;
    const completedOptional = optionalFields.filter(field => formData[field as keyof Tree]).length;
    
    return Math.round(((completedRequired / requiredFields.length) * 70) + ((completedOptional / optionalFields.length) * 30));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Progress */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                <TreePine className="h-6 w-6" />
                {initialTree ? 'Edit Tree' : 'Add New Tree'}
              </CardTitle>
              <p className="text-green-600 mt-1">
                Create a comprehensive record with precise location and assessment data
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 mb-1">Form Completion</div>
              <div className="flex items-center gap-2">
                <Progress value={getFormCompletionPercentage()} className="w-24" />
                <span className="text-sm font-medium text-green-700">
                  {getFormCompletionPercentage()}%
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </TabsTrigger>
          <TabsTrigger value="measurements" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Measurements
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Media
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-700">Tree Identification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="species">Species *</Label>
                  <Input
                    id="species"
                    value={formData.species}
                    onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                    placeholder="Enter species name"
                  />
                </div>
                <div>
                  <Label htmlFor="commonName">Common Name</Label>
                  <Input
                    id="commonName"
                    value={formData.commonName}
                    onChange={(e) => setFormData(prev => ({ ...prev, commonName: e.target.value }))}
                    placeholder="Enter common name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="scientificName">Scientific Name</Label>
                <Input
                  id="scientificName"
                  value={formData.scientificName}
                  onChange={(e) => setFormData(prev => ({ ...prev, scientificName: e.target.value }))}
                  placeholder="Enter scientific name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_planted">Date Planted</Label>
                  <Input
                    id="date_planted"
                    type="date"
                    value={formData.date_planted}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_planted: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="project">Project Association</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">General Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter any additional notes about this tree"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Precise Location & Tree Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude *</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter latitude"
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude *</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter longitude"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={getCurrentLocation} variant="outline" className="flex-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Current GPS
                </Button>
                <Button onClick={() => setIsLocationPickerOpen(true)} variant="outline" className="flex-1">
                  <Target className="h-4 w-4 mr-2" />
                  Pick on Map
                </Button>
              </div>

              {isLocationPickerOpen && (
                <div className="border rounded-lg overflow-hidden">
                  <LocationPickerMap
                    initialLat={formData.lat || 0}
                    initialLng={formData.lng || 0}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              )}

              {/* Enhanced Plus Code Display */}
              {formData.plus_code_global && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm text-blue-800">Tree Address & Location Codes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-blue-600">Tree Address</Label>
                      <div className="font-mono text-sm bg-white p-2 rounded border">
                        {formData.tree_address}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-blue-600">Global Plus Code</Label>
                        <div className="font-mono text-sm bg-white p-2 rounded border">
                          {formData.plus_code_global}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-blue-600">Local Plus Code</Label>
                        <div className="font-mono text-sm bg-white p-2 rounded border">
                          {formData.plus_code_local}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-blue-600">Precise Code (15 chars)</Label>
                        <div className="font-mono text-sm bg-white p-2 rounded border">
                          {formData.plus_code_precise}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-blue-600">Soil Responsibility Area</Label>
                      <div className="text-sm bg-white p-2 rounded border">
                        {formData.soil_responsibility_area ? formatSoilArea(formData.soil_responsibility_area) : 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-700">Tree Measurements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height_cm">Height (cm)</Label>
                  <Input
                    id="height_cm"
                    type="number"
                    value={formData.height_cm}
                    onChange={(e) => setFormData(prev => ({ ...prev, height_cm: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter height in centimeters"
                  />
                </div>
                <div>
                  <Label htmlFor="dbh_cm">DBH - Diameter at Breast Height (cm)</Label>
                  <Input
                    id="dbh_cm"
                    type="number"
                    value={formData.dbh_cm}
                    onChange={(e) => setFormData(prev => ({ ...prev, dbh_cm: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter DBH in centimeters"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="canopy_spread_ns_cm">Canopy Spread N-S (cm)</Label>
                  <Input
                    id="canopy_spread_ns_cm"
                    type="number"
                    value={formData.canopy_spread_ns_cm}
                    onChange={(e) => setFormData(prev => ({ ...prev, canopy_spread_ns_cm: parseInt(e.target.value) || 0 }))}
                    placeholder="North-South spread"
                  />
                </div>
                <div>
                  <Label htmlFor="canopy_spread_ew_cm">Canopy Spread E-W (cm)</Label>
                  <Input
                    id="canopy_spread_ew_cm"
                    type="number"
                    value={formData.canopy_spread_ew_cm}
                    onChange={(e) => setFormData(prev => ({ ...prev, canopy_spread_ew_cm: parseInt(e.target.value) || 0 }))}
                    placeholder="East-West spread"
                  />
                </div>
              </div>

              {/* Multi-stem functionality */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_multi_stem"
                    checked={formData.is_multi_stem}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_multi_stem: e.target.checked }))}
                  />
                  <Label htmlFor="is_multi_stem">Multi-stem tree?</Label>
                </div>
                {formData.is_multi_stem && (
                  <div>
                    <Label htmlFor="individual_stem_diameters_cm">Individual Stem Diameters (cm, comma-separated)</Label>
                    <Input
                      id="individual_stem_diameters_cm"
                      value={formData.individual_stem_diameters_cm}
                      onChange={(e) => setFormData(prev => ({ ...prev, individual_stem_diameters_cm: e.target.value }))}
                      placeholder="e.g., 15.2, 18.7, 12.3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      DBH will be auto-calculated using ISA formula: √(d1² + d2² + ...)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-700">Assessment Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={assessmentType} onValueChange={(value) => setAssessmentType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Assessment</SelectItem>
                  <SelectItem value="construction_monitoring">Construction Monitoring</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {assessmentType === 'standard' && (
            <ConditionAssessmentForm
              initialConditionAssessment={conditionAssessment}
              onConditionAssessmentChange={setConditionAssessment}
            />
          )}

          {assessmentType === 'construction_monitoring' && (
            <ConstructionMonitoringForm
              initialData={constructionData}
              onDataChange={setConstructionData}
            />
          )}
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-700">Photos & Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                initialImages={formData.images || []}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
          {initialTree ? 'Update Tree' : 'Create Tree'}
        </Button>
      </div>
    </div>
  );
};