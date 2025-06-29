import { ConditionChecklistData } from '@/components/ConditionAssessment';

export interface AISuggestion {
  condition: string;
  message: string;
  action: string;
  learnMoreUrl?: string;
  persona: 'Sequoia' | 'Willow' | 'Bodhi'; // Added 'Bodhi' as a new persona
}

export const AIService = {
  /**
   * Simulates fetching AI-powered suggestions based on selected tree conditions.
   * In a real application, this would call an actual AI model (e.g., Gemini API).
   *
   * @param selectedConditions An array of selected condition strings.
   * @returns A Promise resolving to an array of AI suggestions.
   */
  fetchSuggestions: async (selectedConditions: string[]): Promise<AISuggestion[]> => {
    console.log('AI Service: Fetching suggestions for conditions:', selectedConditions);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const allPossibleSuggestions: AISuggestion[] = [
      {
        condition: 'Co-dominant stems',
        message: 'Trees with co-dominant stems may require subordination pruning to prevent structural failure.',
        action: 'Consider structural pruning to establish a dominant leader',
        persona: 'Sequoia',
        learnMoreUrl: '/knowledge/co-dominant-stems'
      },
      {
        condition: 'Girdling roots',
        message: 'Girdling roots can strangle the tree over time. Early intervention is crucial.',
        action: 'Schedule root collar excavation and selective root removal',
        persona: 'Willow',
        learnMoreUrl: '/knowledge/girdling-roots'
      },
      {
        condition: 'Included bark',
        message: 'Included bark creates weak branch unions prone to failure during storms.',
        action: 'Recommend cabling or subordination pruning of affected branches',
        persona: 'Sequoia',
        learnMoreUrl: '/knowledge/included-bark'
      },
      {
        condition: 'Dead branches (>2 inches)',
        message: 'Dead branches over 2 inches pose safety risks and should be removed promptly.',
        action: 'Schedule deadwood removal during dormant season',
        persona: 'Willow',
        learnMoreUrl: '/knowledge/dead-branches'
      },
      {
        condition: 'Leaf discoloration',
        message: 'Leaf discoloration often indicates nutrient deficiency or disease stress.',
        action: 'Conduct soil test and consider foliar analysis for diagnosis',
        persona: 'Bodhi',
        learnMoreUrl: '/knowledge/leaf-discoloration'
      },
      {
        condition: 'Soil compaction',
        message: 'Compacted soil limits root growth and water infiltration.',
        action: 'Consider vertical mulching or pneumatic soil decompaction',
        persona: 'Bodhi',
        learnMoreUrl: '/knowledge/soil-compaction'
      },
      {
        condition: 'Poor drainage',
        message: 'Poor drainage can lead to root rot and other moisture-related issues.',
        action: 'Improve soil aeration and consider installing drainage solutions',
        persona: 'Willow',
        learnMoreUrl: '/knowledge/poor-drainage'
      },
      {
        condition: 'Insect damage',
        message: 'Identify the specific pest to apply targeted and effective treatment.',
        action: 'Perform pest identification and consider integrated pest management (IPM) strategies',
        persona: 'Sequoia',
        learnMoreUrl: '/knowledge/insect-damage'
      },
      {
        condition: 'Cavity/decay',
        message: 'Cavities and decay can compromise structural integrity. Further assessment is recommended.',
        action: 'Conduct a thorough decay assessment and consider structural support if necessary',
        persona: 'Bodhi',
        learnMoreUrl: '/knowledge/cavity-decay'
      },
      {
        condition: 'Drought stress',
        message: 'Prolonged drought stress weakens trees and makes them susceptible to other issues.',
        action: 'Implement a deep watering regimen and consider mulching to retain soil moisture',
        persona: 'Willow',
        learnMoreUrl: '/knowledge/drought-stress'
      }
    ];

    // Filter suggestions based on the selected conditions
    const filteredSuggestions = allPossibleSuggestions.filter(suggestion =>
      selectedConditions.includes(suggestion.condition)
    );

    return filteredSuggestions;
  },
};