'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export interface ConstructionAssessmentData {
  entryNumber: number;
  areaDescription: string;
  tpzFencing: string;
  tpzIncursions: string;
  tpzMulch: string;
  crzImpacts: string[];
  overallCondition: string;
  canopyDensity: string;
  canopyColor: string;
  canopyDieback: string;
  canopyImpactNotes: string;
  professionalSummary: string;
}

interface ConstructionAssessmentProps {
  value: ConstructionAssessmentData;
  onChange: (value: ConstructionAssessmentData) => void;
}

const TPZ_FENCING_OPTIONS = [
  'TPZ fencing in good condition',
  'TPZ fencing partially in place',
  'TPZ fencing needs attention',
  'TPZ fencing not installed',
  'Other'
];

const TPZ_INCURSIONS_OPTIONS = [
  'No TPZ incursions',
  'TPZ partial incursion',
  'TPZ excessive incursions',
  'Other'
];

const TPZ_MULCH_OPTIONS = [
  'Mulch in place',
  'Mulch partially in place',
  'Mulch needs replacement',
  'Mulch not installed',
  'Other'
];

const CRZ_IMPACT_OPTIONS = [
  'Root severance',
  'Grade changes',
  'Soil Compaction',
  'Fill Soil Added',
  'Excavation',
  'Contaminants Present',
  'None Observed'
];

const CONDITION_OPTIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor', 'Dead'];
const DENSITY_OPTIONS = ['Full', 'Medium', 'Low'];
const COLOR_OPTIONS = ['Vibrant', 'Dull', 'Dusty', 'Yellowing', 'Browning', 'Scorching'];
const DIEBACK_OPTIONS = ['None', 'Minor', 'Moderate', 'Significant', 'Excessive'];
const IMPACT_OPTIONS = ['None', 'Minor Damage', 'Moderate Damage', 'Significant Damage', 'Excessive Damage'];

export function ConstructionAssessment({ value, onChange }: ConstructionAssessmentProps) {
  const handleChange = (field: keyof ConstructionAssessmentData, newValue: any) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  const handleCRZImpactToggle = (impact: string) => {
    const currentImpacts = value.crzImpacts || [];
    const newImpacts = currentImpacts.includes(impact)
      ? currentImpacts.filter(i => i !== impact)
      : [...currentImpacts, impact];
    handleChange('crzImpacts', newImpacts);
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Area/Tree Identification */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-800">🏗️ Area/Tree Identification</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Entry Number</Label>
            <Input
              type="number"
              value={value.entryNumber || ''}
              onChange={(e) => handleChange('entryNumber', parseInt(e.target.value) || 0)}
              placeholder="Auto-incrementing number"
            />
          </div>
        </div>

        <div>
          <Label>Area Description</Label>
          <Textarea
            value={value.areaDescription || ''}
            onChange={(e) => handleChange('areaDescription', e.target.value)}
            placeholder="e.g., Heritage Live Oak adjacent to new retaining wall construction..."
            rows={3}
          />
        </div>
      </div>

      {/* Section 2: TPZ & CRZ Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-800">🛡️ Tree Protection Zone (TPZ) & Critical Root Zone (CRZ) Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>TPZ Fencing</Label>
            <Select value={value.tpzFencing || ''} onValueChange={(val) => handleChange('tpzFencing', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select TPZ fencing status" />
              </SelectTrigger>
              <SelectContent>
                {TPZ_FENCING_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>TPZ Incursions</Label>
            <Select value={value.tpzIncursions || ''} onValueChange={(val) => handleChange('tpzIncursions', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select TPZ incursions status" />
              </SelectTrigger>
              <SelectContent>
                {TPZ_INCURSIONS_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>TPZ Mulch</Label>
            <Select value={value.tpzMulch || ''} onValueChange={(val) => handleChange('tpzMulch', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select TPZ mulch status" />
              </SelectTrigger>
              <SelectContent>
                {TPZ_MULCH_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>CRZ Impacts</Label>
          <Badge variant="outline" className="ml-2">{value.crzImpacts?.length || 0} selected</Badge>
          <div className="mt-2 space-y-2">
            {CRZ_IMPACT_OPTIONS.map(impact => (
              <div key={impact} className="flex items-center space-x-2">
                <Checkbox
                  checked={value.crzImpacts?.includes(impact) || false}
                  onCheckedChange={() => handleCRZImpactToggle(impact)}
                />
                <Label className="font-normal cursor-pointer" onClick={() => handleCRZImpactToggle(impact)}>
                  {impact}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Tree Health Observation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-800">🌳 Tree Health Observation (In-Construction Context)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Overall Condition</Label>
            <Select value={value.overallCondition || ''} onValueChange={(val) => handleChange('overallCondition', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select overall condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Canopy Density</Label>
            <Select value={value.canopyDensity || ''} onValueChange={(val) => handleChange('canopyDensity', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select canopy density" />
              </SelectTrigger>
              <SelectContent>
                {DENSITY_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Canopy Color</Label>
            <Select value={value.canopyColor || ''} onValueChange={(val) => handleChange('canopyColor', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select canopy color" />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Canopy Dieback</Label>
            <Select value={value.canopyDieback || ''} onValueChange={(val) => handleChange('canopyDieback', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select canopy dieback" />
              </SelectTrigger>
              <SelectContent>
                {DIEBACK_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Canopy Impact Notes</Label>
            <Select value={value.canopyImpactNotes || ''} onValueChange={(val) => handleChange('canopyImpactNotes', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select canopy impact level" />
              </SelectTrigger>
              <SelectContent>
                {IMPACT_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section 4: Professional Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-800">📋 Professional Summary & Recommendations</h3>
        
        <div>
          <Label>Specific Notes and Recommended Action</Label>
          <Textarea
            value={value.professionalSummary || ''}
            onChange={(e) => handleChange('professionalSummary', e.target.value)}
            placeholder="Provide detailed observations and recommendations for the client..."
            rows={6}
          />
        </div>
      </div>
    </div>
  );
}