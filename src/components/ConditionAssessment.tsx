'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BodhiSuggestions } from '@/components/BodhiSuggestions';
import { ChevronDown, ChevronUp } from 'lucide-react'; // Import icons

export interface ConditionChecklistData {
  structure: string[];
  canopy_health: string[];
  pests_diseases: string[];
  site_conditions: string[];
  arborist_summary: string;
  health_status?: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead';
  notes?: { [key: string]: string };
}

export interface ConditionAssessmentProps {
  value: ConditionChecklistData;
  onChange: (data: ConditionChecklistData) => void;
}

const ConditionAssessment: React.FC<ConditionAssessmentProps> = ({ value, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [arboristSummary, setArboristSummary] = useState(value.arborist_summary || '');
  const [healthStatus, setHealthStatus] = useState(value.health_status || undefined);

  const handleCheckboxChange = (category: keyof ConditionChecklistData, item: string, checked: boolean) => {
    if (Array.isArray(value[category])) {
      const currentCategory = value[category] as string[];
      const updatedCategory = checked
        ? [...currentCategory, item]
        : currentCategory.filter((i) => i !== item);
      onChange({ ...value, [category]: updatedCategory });
    }
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setArboristSummary(e.target.value);
    onChange({ ...value, arborist_summary: e.target.value });
  };

  const handleHealthStatusChange = (status: string) => {
    const newStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead' | undefined = status === '' ? undefined : status as 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead';
    setHealthStatus(newStatus);
    onChange({ ...value, health_status: newStatus });
  };

  const checklistItems = {
    structure: [
      'Cracks', 'Cavities', 'Weak unions', 'Dead branches', 'Root damage', 'Leaning'
    ],
    canopy_health: [
      'Sparse foliage', 'Discolored leaves', 'Leaf spots', 'Premature leaf drop', 'Dieback'
    ],
    pests_diseases: [
      'Insect infestation', 'Fungal growth', 'Cankers', 'Galls', 'Blight'
    ],
    site_conditions: [
      'Soil compaction', 'Poor drainage', 'Erosion', 'Construction damage', 'Girdling roots'
    ],
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-25 p-4 sm:p-5 rounded-lg border border-blue-100 space-y-3 sm:space-y-4 mt-4">
      <div className="flex items-center gap-2 mb-2 sm:mb-4 pb-2 border-b border-blue-200">
        <span className="text-lg sm:text-xl">🩺</span>
        <h3 className="text-lg sm:text-xl font-bold text-blue-800">Condition Assessment</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-auto text-blue-600 hover:bg-blue-50"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span className="ml-1">{isExpanded ? 'Collapse' : 'Expand'}</span>
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {Object.entries(checklistItems).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <Label className="text-green-700 font-medium text-sm sm:text-base capitalize">
                {category.replace('_', ' ')}:
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {items.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${category}-${item}`}
                                            checked={(value[category as keyof ConditionChecklistData] as string[]).includes(item)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(category as keyof ConditionChecklistData, item, checked as boolean)
                      }
                    />
                    <Label htmlFor={`${category}-${item}`} className="text-sm text-gray-700">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <Label htmlFor="arborist_summary" className="text-green-700 font-medium text-sm sm:text-base">
              Arborist Summary
            </Label>
            <Textarea
              id="arborist_summary"
              value={arboristSummary}
              onChange={handleSummaryChange}
              placeholder="Provide a summary of the tree's condition..."
              rows={3}
              className="border-green-200 focus:border-green-400 resize-none"
            />
          </div>

          <div>
            <Label htmlFor="health_status" className="text-green-700 font-medium text-sm sm:text-base">
              Overall Health Status
            </Label>
            <select
              id="health_status"
              value={healthStatus || ''}
              onChange={(e) => handleHealthStatusChange(e.target.value)}
              className="w-full p-2 border border-green-200 rounded-md focus:border-green-400"
            >
              <option value="">Select status</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Dead">Dead</option>
            </select>
          </div>

          <BodhiSuggestions selectedConditions={Object.values(value).flat()} onDismiss={() => {}} />
        </div>
      )}
    </div>
  );
};

export default ConditionAssessment;