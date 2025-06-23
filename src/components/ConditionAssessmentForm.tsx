'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CONDITION_CHECKLISTS, ConditionAssessmentFormData } from '@/types/assessment';

interface ConditionAssessmentFormProps {
  value?: ConditionAssessmentFormData;
  onChange: (data: ConditionAssessmentFormData) => void;
}

export function ConditionAssessmentForm({ value, onChange }: ConditionAssessmentFormProps) {
  const [formData, setFormData] = useState<ConditionAssessmentFormData>(value || {
    health_status: 'Good',
    structure: [],
    canopy_health: [],
    pests_diseases: [],
    site_conditions: [],
    arborist_summary: '',
  });

  const updateFormData = (updates: Partial<ConditionAssessmentFormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  const toggleChecklistItem = (category: keyof typeof CONDITION_CHECKLISTS, value: string) => {
    const currentValues = formData[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFormData({ [category]: newValues });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="health_status">Health Status *</Label>
        <Select
          value={formData.health_status}
          onValueChange={(value: any) => updateFormData({ health_status: value })}
        >
          <SelectTrigger id="health_status">
            <SelectValue placeholder="Select health status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Excellent">Excellent</SelectItem>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Fair">Fair</SelectItem>
            <SelectItem value="Poor">Poor</SelectItem>
            <SelectItem value="Dead">Dead</SelectItem>
            <SelectItem value="Hazardous">Hazardous</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Condition Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Structure */}
          <div>
            <h4 className="font-semibold mb-2">Structure</h4>
            <div className="grid grid-cols-2 gap-2">
              {CONDITION_CHECKLISTS.structure.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.value}
                    checked={formData.structure.includes(item.value)}
                    onCheckedChange={() => toggleChecklistItem('structure', item.value)}
                  />
                  <Label
                    htmlFor={item.value}
                    className="text-sm cursor-pointer"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Canopy Health */}
          <div>
            <h4 className="font-semibold mb-2">Canopy Health</h4>
            <div className="grid grid-cols-2 gap-2">
              {CONDITION_CHECKLISTS.canopy_health.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.value}
                    checked={formData.canopy_health.includes(item.value)}
                    onCheckedChange={() => toggleChecklistItem('canopy_health', item.value)}
                  />
                  <Label
                    htmlFor={item.value}
                    className="text-sm cursor-pointer"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Pests & Diseases */}
          <div>
            <h4 className="font-semibold mb-2">Pests & Diseases</h4>
            <div className="grid grid-cols-2 gap-2">
              {CONDITION_CHECKLISTS.pests_diseases.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.value}
                    checked={formData.pests_diseases.includes(item.value)}
                    onCheckedChange={() => toggleChecklistItem('pests_diseases', item.value)}
                  />
                  <Label
                    htmlFor={item.value}
                    className="text-sm cursor-pointer"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Site Conditions */}
          <div>
            <h4 className="font-semibold mb-2">Site Conditions</h4>
            <div className="grid grid-cols-2 gap-2">
              {CONDITION_CHECKLISTS.site_conditions.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.value}
                    checked={formData.site_conditions.includes(item.value)}
                    onCheckedChange={() => toggleChecklistItem('site_conditions', item.value)}
                  />
                  <Label
                    htmlFor={item.value}
                    className="text-sm cursor-pointer"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="arborist_summary">Arborist Summary</Label>
        <Textarea
          id="arborist_summary"
          value={formData.arborist_summary}
          onChange={(e) => updateFormData({ arborist_summary: e.target.value })}
          placeholder="Provide a detailed summary of the tree's condition, recommended actions, and any other relevant observations..."
          rows={4}
        />
      </div>
    </div>
  );
}