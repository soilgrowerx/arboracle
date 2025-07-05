'use client';

import React, { useState } from 'react';
import { ConstructionMonitoringData } from '@/types/project';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download } from 'lucide-react';

interface ConstructionMonitoringFormProps {
  initialData?: Partial<ConstructionMonitoringData>;
  onDataChange: (data: ConstructionMonitoringData) => void;
  entryNumber?: number;
}

const crzImpactOptions = [
  { value: 'root_severance', label: 'Root Severance' },
  { value: 'grade_changes', label: 'Grade Changes' },
  { value: 'soil_compaction', label: 'Soil Compaction' },
  { value: 'fill_soil_added', label: 'Fill Soil Added' },
  { value: 'excavation', label: 'Excavation' },
  { value: 'contaminants_present', label: 'Contaminants Present' },
  { value: 'none_observed', label: 'None Observed' },
];

export const ConstructionMonitoringForm: React.FC<ConstructionMonitoringFormProps> = ({
  initialData = {},
  onDataChange,
  entryNumber = 1,
}) => {
  const [formData, setFormData] = useState<ConstructionMonitoringData>({
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
    recommended_action: '',
    ...initialData,
  });

  const updateFormData = (updates: Partial<ConstructionMonitoringData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onDataChange(newData);
  };

  const handleCrzImpactChange = (impact: string, checked: boolean) => {
    const currentImpacts = formData.crz_impacts || [];
    const newImpacts = checked
      ? [...currentImpacts, impact]
      : currentImpacts.filter(i => i !== impact);
    
    updateFormData({ crz_impacts: newImpacts });
  };

  const generatePDFReport = () => {
    // TODO: Implement PDF generation
    console.log('Generating PDF report...', formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-green-800">Construction Monitoring Assessment</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Entry #{entryNumber}</span>
          <Button onClick={generatePDFReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Section 1: Area/Tree Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-green-700">Area/Tree Identification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="area_description">Area Description</Label>
            <Textarea
              id="area_description"
              value={formData.area_description}
              onChange={(e) => updateFormData({ area_description: e.target.value })}
              placeholder="Describe the area and tree being monitored (e.g., Heritage Live Oak adjacent to new retaining wall construction...)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: TPZ & CRZ Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-green-700">Tree Protection Zone (TPZ) & Critical Root Zone (CRZ) Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tpz_fencing">TPZ Fencing</Label>
              <Select value={formData.tpz_fencing} onValueChange={(value) => updateFormData({ tpz_fencing: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good_condition">TPZ fencing in good condition</SelectItem>
                  <SelectItem value="partially_in_place">TPZ fencing partially in place</SelectItem>
                  <SelectItem value="needs_attention">TPZ fencing needs attention</SelectItem>
                  <SelectItem value="not_installed">TPZ fencing not installed</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tpz_incursions">TPZ Incursions</Label>
              <Select value={formData.tpz_incursions} onValueChange={(value) => updateFormData({ tpz_incursions: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No TPZ incursions</SelectItem>
                  <SelectItem value="partial_incursion">TPZ partial incursion</SelectItem>
                  <SelectItem value="excessive_incursions">TPZ excessive incursions</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tpz_mulch">TPZ Mulch</Label>
              <Select value={formData.tpz_mulch} onValueChange={(value) => updateFormData({ tpz_mulch: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_place">Mulch in place</SelectItem>
                  <SelectItem value="partially_in_place">Mulch partially in place</SelectItem>
                  <SelectItem value="needs_replacement">Mulch needs replacement</SelectItem>
                  <SelectItem value="not_installed">Mulch not installed</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>CRZ Impacts (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {crzImpactOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={formData.crz_impacts?.includes(option.value)}
                    onCheckedChange={(checked) => handleCrzImpactChange(option.value, !!checked)}
                  />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Tree Health Observation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-green-700">Tree Health Observation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="overall_condition">Overall Condition</Label>
              <Select value={formData.overall_condition} onValueChange={(value) => updateFormData({ overall_condition: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="very_poor">Very Poor</SelectItem>
                  <SelectItem value="dead">Dead</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="canopy_density">Canopy Density</Label>
              <Select value={formData.canopy_density} onValueChange={(value) => updateFormData({ canopy_density: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="canopy_color">Canopy Color</Label>
              <Select value={formData.canopy_color} onValueChange={(value) => updateFormData({ canopy_color: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                  <SelectItem value="dull">Dull</SelectItem>
                  <SelectItem value="dusty">Dusty</SelectItem>
                  <SelectItem value="yellowing">Yellowing</SelectItem>
                  <SelectItem value="browning">Browning</SelectItem>
                  <SelectItem value="scorching">Scorching</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="canopy_dieback">Canopy Dieback</Label>
              <Select value={formData.canopy_dieback} onValueChange={(value) => updateFormData({ canopy_dieback: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="significant">Significant</SelectItem>
                  <SelectItem value="excessive">Excessive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="canopy_impact_notes">Canopy Impact Notes</Label>
              <Select value={formData.canopy_impact_notes} onValueChange={(value) => updateFormData({ canopy_impact_notes: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="minor_damage">Minor Damage</SelectItem>
                  <SelectItem value="moderate_damage">Moderate Damage</SelectItem>
                  <SelectItem value="significant_damage">Significant Damage</SelectItem>
                  <SelectItem value="excessive_damage">Excessive Damage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Professional Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-green-700">Professional Summary & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="specific_notes">Specific Notes</Label>
            <Textarea
              id="specific_notes"
              value={formData.specific_notes}
              onChange={(e) => updateFormData({ specific_notes: e.target.value })}
              placeholder="Detailed observations and findings..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="recommended_action">Recommended Action</Label>
            <Textarea
              id="recommended_action"
              value={formData.recommended_action}
              onChange={(e) => updateFormData({ recommended_action: e.target.value })}
              placeholder="Professional recommendations for tree care and protection..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};