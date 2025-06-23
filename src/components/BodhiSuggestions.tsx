'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, ExternalLink } from 'lucide-react';

interface BodhiSuggestionsProps {
  selectedConditions: string[];
  onDismiss?: () => void;
}

interface Suggestion {
  condition: string;
  message: string;
  action: string;
  learnMoreUrl?: string;
  persona: 'Sequoia' | 'Willow';
}

const BODHI_SUGGESTIONS: Suggestion[] = [
  {
    condition: 'Co-dominant stems',
    message: 'Trees with co-dominant stems may require subordination pruning to prevent structural failure.',
    action: 'Consider structural pruning to establish a dominant leader',
    persona: 'Sequoia',
    learnMoreUrl: '/knowledge'
  },
  {
    condition: 'Girdling roots',
    message: 'Girdling roots can strangle the tree over time. Early intervention is crucial.',
    action: 'Schedule root collar excavation and selective root removal',
    persona: 'Willow',
    learnMoreUrl: '/knowledge'
  },
  {
    condition: 'Included bark',
    message: 'Included bark creates weak branch unions prone to failure during storms.',
    action: 'Recommend cabling or subordination pruning of affected branches',
    persona: 'Sequoia',
    learnMoreUrl: '/knowledge'
  },
  {
    condition: 'Dead branches (>2 inches)',
    message: 'Dead branches over 2 inches pose safety risks and should be removed promptly.',
    action: 'Schedule deadwood removal during dormant season',
    persona: 'Willow',
    learnMoreUrl: '/knowledge'
  },
  {
    condition: 'Leaf discoloration',
    message: 'Leaf discoloration often indicates nutrient deficiency or disease stress.',
    action: 'Conduct soil test and consider foliar analysis for diagnosis',
    persona: 'Sequoia',
    learnMoreUrl: '/knowledge'
  },
  {
    condition: 'Soil compaction',
    message: 'Compacted soil limits root growth and water infiltration.',
    action: 'Consider vertical mulching or pneumatic soil decompaction',
    persona: 'Willow',
    learnMoreUrl: '/knowledge'
  }
];

export function BodhiSuggestions({ selectedConditions, onDismiss }: BodhiSuggestionsProps) {
  const relevantSuggestions = BODHI_SUGGESTIONS.filter(suggestion =>
    selectedConditions.includes(suggestion.condition)
  );

  if (relevantSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mt-4">
      {relevantSuggestions.map((suggestion, index) => (
        <Alert key={index} className="bg-amber-50 border-amber-200">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-800">
                  {suggestion.persona} Knows:
                </span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  {suggestion.condition}
                </span>
              </div>
              
              <p className="text-amber-700 text-sm">
                {suggestion.message}
              </p>
              
              <div className="flex items-center justify-between gap-2">
                <p className="text-amber-600 text-xs font-medium">
                  💡 Recommended Action: {suggestion.action}
                </p>
                
                {suggestion.learnMoreUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(suggestion.learnMoreUrl, '_blank')}
                    className="text-amber-700 border-amber-300 hover:bg-amber-100 text-xs"
                  >
                    Learn More
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}
      
      {onDismiss && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-gray-500 text-xs"
          >
            Dismiss suggestions
          </Button>
        </div>
      )}
    </div>
  );
}