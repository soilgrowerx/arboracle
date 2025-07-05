'use client';

import React, { useState, useEffect } from 'react';
import { ConditionAssessment } from '@/types/tree';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ConditionAssessmentFormProps {
  initialConditionAssessment: ConditionAssessment;
  onConditionAssessmentChange: (assessment: ConditionAssessment) => void;
}

const conditionCategories = {
  structure: [
    'Co-dominant stems',
    'Included bark',
    'Cracks',
    'Decay (visible)',
    'Weak branch unions',
    'Root collar excavation needed',
    'Girdling roots',
    'Trunk wounds',
    'Previous failure',
    'Lean',
    'Hazardous defect',
  ],
  canopy_health: [
    'Leaf discoloration',
    'Premature leaf drop',
    'Dieback',
    'Thinning canopy',
    'Small leaves',
    'Chlorosis',
    'Necrosis',
    'Epicormic growth',
    'Water sprouts',
  ],
  pests_diseases: [
    'Insect infestation (visible)',
    'Fungal fruiting bodies',
    'Cankers',
    'Bacterial wetwood',
    'Powdery mildew',
    'Rust',
    'Gall formation',
    'Borer activity',
  ],
  site_conditions: [
    'Soil compaction',
    'Poor drainage',
    'Erosion',
    'Construction impact',
    'Pavement/hardscape encroachment',
    'Restricted root space',
    'Irrigation issues',
    'Chemical exposure',
    'Vandalism',
  ],
};

export const ConditionAssessmentForm: React.FC<ConditionAssessmentFormProps> = ({
  initialConditionAssessment,
  onConditionAssessmentChange,
}) => {
  const [assessment, setAssessment] = useState<ConditionAssessment>(initialConditionAssessment);

  useEffect(() => {
    setAssessment(initialConditionAssessment);
  }, [initialConditionAssessment]);

  const handleCheckboxChange = (category: keyof typeof conditionCategories, item: string, checked: boolean) => {
    const updatedCategory = checked
      ? [...(assessment[category] || []), item]
      : (assessment[category] || []).filter((i) => i !== item);

    const newAssessment = {
      ...assessment,
      [category]: updatedCategory,
    };
    setAssessment(newAssessment);
    onConditionAssessmentChange(newAssessment);
  };

  const handleNoteChange = (category: keyof typeof conditionCategories, item: string, note: string) => {
    const newNotes = {
      ...(assessment.notes || {}),
      [`${category}-${item}`]: note,
    };
    const newAssessment = {
      ...assessment,
      notes: newNotes,
    };
    setAssessment(newAssessment);
    onConditionAssessmentChange(newAssessment);
  };

  const handleArboristSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAssessment = {
      ...assessment,
      arborist_summary: e.target.value,
    };
    setAssessment(newAssessment);
    onConditionAssessmentChange(newAssessment);
  };

  const handleHealthStatusChange = (value: string) => {
    const newAssessment = {
      ...assessment,
      health_status: value as ConditionAssessment['health_status'],
    };
    setAssessment(newAssessment);
    onConditionAssessmentChange(newAssessment);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-green-700">Professional Condition Assessment</h4>

      <Accordion type="multiple" className="w-full">
        {Object.entries(conditionCategories).map(([categoryKey, items]) => (
          <AccordionItem key={categoryKey} value={categoryKey}>
            <AccordionTrigger className="text-base font-medium capitalize">
              {categoryKey.replace(/_/g, ' ')}
            </AccordionTrigger>
            <AccordionContent className="space-y-3 p-2">
              {items.map((item) => {
                const isChecked = assessment[categoryKey as keyof typeof conditionCategories]?.includes(item);
                const noteKey = `${categoryKey}-${item}`;
                const itemNote = assessment.notes?.[noteKey] || '';

                return (
                  <div key={item} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(categoryKey as keyof typeof conditionCategories, item, !!checked)
                        }
                      />
                      <Label htmlFor={item} className="text-sm font-normal">
                        {item}
                      </Label>
                    </div>
                    {isChecked && (
                      <Textarea
                        placeholder="Add specific notes..."
                        value={itemNote}
                        onChange={(e) => handleNoteChange(categoryKey as keyof typeof conditionCategories, item, e.target.value)}
                        className="ml-6 mt-2"
                      />
                    )}
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="grid gap-2">
        <Label htmlFor="arborist_summary">Arborist Summary</Label>
        <Textarea
          id="arborist_summary"
          value={assessment.arborist_summary || ''}
          onChange={handleArboristSummaryChange}
          placeholder="Provide an overall summary of the tree's condition..."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="health_status">Overall Health Status</Label>
        <Select
          value={assessment.health_status || ''}
          onValueChange={handleHealthStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select health status" />
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
    </div>
  );
};
