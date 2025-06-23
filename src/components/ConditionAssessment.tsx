'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { BodhiSuggestions } from '@/components/BodhiSuggestions';

export interface ConditionChecklistData {
  structure: string[];
  canopy_health: string[];
  pests_diseases: string[];
  site_conditions: string[];
}

interface ConditionAssessmentProps {
  value: {
    checklist: ConditionChecklistData;
    arborist_summary: string;
  };
  onChange: (value: { checklist: ConditionChecklistData; arborist_summary: string }) => void;
}

// Fulcrum-style condition assessment checklists
const CONDITION_CHECKLISTS = {
  structure: [
    'Co-dominant stems',
    'Included bark',
    'Weak branch attachments',
    'Dead branches (>2 inches)',
    'Broken branches',
    'Cavity/decay',
    'Root damage visible',
    'Lean/instability',
    'Girdling roots',
    'Crown imbalance'
  ],
  canopy_health: [
    'Leaf discoloration',
    'Early leaf drop',
    'Sparse foliage',
    'Branch dieback',
    'Epicormic sprouting',
    'Stunted growth',
    'Wilting symptoms',
    'Abnormal leaf size',
    'Premature autumn color',
    'Crown transparency >50%'
  ],
  pests_diseases: [
    'Fungal infection visible',
    'Bacterial infection signs',
    'Insect damage',
    'Boring insect holes',
    'Scale insects',
    'Aphid infestation',
    'Cankers present',
    'Powdery mildew',
    'Rust disease',
    'Viral symptoms'
  ],
  site_conditions: [
    'Soil compaction',
    'Poor drainage',
    'Construction damage',
    'Salt damage',
    'Drought stress',
    'Over-watering signs',
    'Nutrient deficiency',
    'Chemical damage',
    'Mechanical damage',
    'Inadequate planting space'
  ]
};

const CATEGORY_LABELS = {
  structure: '🏗️ Structure',
  canopy_health: '🍃 Canopy Health',
  pests_diseases: '🐛 Pests & Diseases',
  site_conditions: '🌍 Site Conditions'
};

export default function ConditionAssessment({ value, onChange }: ConditionAssessmentProps) {
  const handleChecklistChange = (category: keyof ConditionChecklistData, item: string, checked: boolean) => {
    const newChecklist = { ...value.checklist };
    if (checked) {
      newChecklist[category] = [...(newChecklist[category] || []), item];
    } else {
      newChecklist[category] = (newChecklist[category] || []).filter(i => i !== item);
    }
    onChange({ ...value, checklist: newChecklist });
  };

  const handleSummaryChange = (summary: string) => {
    onChange({ ...value, arborist_summary: summary });
  };

  const getSelectedCount = (category: keyof ConditionChecklistData) => {
    return (value.checklist[category] || []).length;
  };

  const getTotalCount = (category: keyof ConditionChecklistData) => {
    return CONDITION_CHECKLISTS[category].length;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📋</span>
        <h3 className="text-lg font-semibold text-green-800">Condition Assessment</h3>
        <Badge variant="secondary" className="text-xs">
          Fulcrum Model
        </Badge>
      </div>

      {(Object.keys(CONDITION_CHECKLISTS) as Array<keyof ConditionChecklistData>).map((category) => (
        <div key={category} className="border border-green-200 rounded-lg p-3 sm:p-4 bg-green-50/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-green-800 text-sm sm:text-base">
              {CATEGORY_LABELS[category]}
            </h4>
            <Badge 
              variant={getSelectedCount(category) > 0 ? "destructive" : "secondary"}
              className="text-xs"
            >
              {getSelectedCount(category)}/{getTotalCount(category)} selected
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {CONDITION_CHECKLISTS[category].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  id={`${category}-${item}`}
                  checked={(value.checklist[category] || []).includes(item)}
                  onCheckedChange={(checked) => 
                    handleChecklistChange(category, item, checked as boolean)
                  }
                  className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                />
                <Label 
                  htmlFor={`${category}-${item}`}
                  className="text-xs sm:text-sm text-green-700 cursor-pointer leading-tight"
                >
                  {item}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t border-green-200 pt-4">
        <Label htmlFor="arborist_summary" className="text-green-700 font-medium text-sm sm:text-base">
          Arborist Summary
        </Label>
        <Textarea
          id="arborist_summary"
          value={value.arborist_summary}
          onChange={(e) => handleSummaryChange(e.target.value)}
          placeholder="Professional assessment summary, recommendations, and management priorities..."
          rows={4}
          className="mt-2 border-green-200 focus:border-green-400 text-sm"
        />
        <p className="text-xs text-green-600 mt-1">
          📝 Document overall tree health, priority concerns, and recommended actions
        </p>
      </div>

      {/* Summary of selected conditions */}
      {Object.values(value.checklist).some(arr => arr && arr.length > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <h5 className="font-medium text-orange-800 mb-2 text-sm">
            ⚠️ Identified Conditions Summary
          </h5>
          <div className="space-y-1">
            {(Object.keys(value.checklist) as Array<keyof ConditionChecklistData>).map((category) => {
              const selectedItems = value.checklist[category] || [];
              if (selectedItems.length === 0) return null;
              return (
                <div key={category} className="text-xs text-orange-700">
                  <span className="font-medium">{CATEGORY_LABELS[category]}:</span> {selectedItems.join(', ')}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bodhi AI Suggestions */}
      <BodhiSuggestions 
        selectedConditions={Object.values(value.checklist).flat()}
      />
    </div>
  );
}