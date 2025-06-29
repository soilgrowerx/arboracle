'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, ExternalLink } from 'lucide-react';
import { AIService, AISuggestion } from '@/services/aiService';

interface BodhiSuggestionsProps {
  selectedConditions: string[];
  onDismiss?: () => void;
  aiPersona?: 'Sequoia' | 'Willow' | 'Bodhi';
}

export function BodhiSuggestions({ selectedConditions, onDismiss, aiPersona = 'Bodhi' }: BodhiSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    AIService.fetchSuggestions(selectedConditions)
      .then(data => {
        // Filter suggestions by selected AI persona
        const filteredByPersona = data.filter(s => aiPersona === 'Bodhi' || s.persona === aiPersona);
        setSuggestions(filteredByPersona);
      })
      .catch(error => {
        console.error('Error fetching AI suggestions:', error);
        setSuggestions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedConditions, aiPersona]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-green-700">
        <span className="animate-spin mr-2">💡</span> Fetching AI insights...
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mt-4">
      {suggestions.map((suggestion, index) => (
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