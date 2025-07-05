
'use client';

import { Tree } from '@/types/tree'; // Updated import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gauge, Leaf, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AiPersonaService } from '@/services/AiPersonaService';

interface ForestHealthScoreProps {
  trees: Tree[];
  aiPersona: string; // This will now be the persona ID
  treeCount: number;
}

export function ForestHealthScore({ trees, aiPersona, treeCount }: ForestHealthScoreProps) {
  const [healthScore, setHealthScore] = useState(0);
  const [healthMessage, setHealthMessage] = useState('');
  const [currentPersona, setCurrentPersona] = useState<AiPersona | null>(null);

  useEffect(() => {
    setCurrentPersona(AiPersonaService.getPersonaById(aiPersona) || AiPersonaService.getDefaultPersona());
  }, [aiPersona]);

  useEffect(() => {
    if (treeCount === 0) {
      setHealthScore(100); // Perfect score if no trees
      setHealthMessage(currentPersona?.initialPrompt || 'Add trees to start assessing your forest health!');
      return;
    }

    let totalScore = 0;
    let maxPossibleScore = 0;

    trees.forEach(tree => {
      // Each tree contributes to the overall score
      // Max score for a tree could be 100, reduced by issues
      let treeCurrentScore = 100;
      maxPossibleScore += 100;

      if (tree.conditionAssessment) {
        const assessment = tree.conditionAssessment;

        // Penalize for each true boolean in standard assessment sections
        Object.values(assessment.structure).forEach(val => {
          if (typeof val === 'boolean' && val) treeCurrentScore -= 5; // Small penalty
        });
        Object.values(assessment.canopyHealth).forEach(val => {
          if (typeof val === 'boolean' && val) treeCurrentScore -= 7; // Medium penalty
        });
        Object.values(assessment.pestsDiseases).forEach(val => {
          if (typeof val === 'boolean' && val) treeCurrentScore -= 10; // Larger penalty
        });
        Object.values(assessment.siteConditions).forEach(val => {
          if (typeof val === 'boolean' && val) treeCurrentScore -= 5; // Small penalty
        });

        // Penalize for construction monitoring issues if present
        if (assessment.tpzFencing && assessment.tpzFencing !== 'good_condition') treeCurrentScore -= 10;
        if (assessment.tpzIncursions && assessment.tpzIncursions !== 'none') treeCurrentScore -= 15;
        if (assessment.tpzMulch && assessment.tpzMulch !== 'adequate') treeCurrentScore -= 5;
        if (assessment.crzImpacts) {
          Object.values(assessment.crzImpacts).forEach(val => {
            if (val) treeCurrentScore -= 10;
          });
        }
        if (assessment.overallCondition && (assessment.overallCondition === 'poor' || assessment.overallCondition === 'dead')) treeCurrentScore -= 20;
        if (assessment.canopyDensity && assessment.canopyDensity === 'sparse') treeCurrentScore -= 10;
        if (assessment.canopyColor && (assessment.canopyColor === 'chlorotic' || assessment.canopyColor === 'necrotic')) treeCurrentScore -= 10;
        if (assessment.canopyDieback && (assessment.canopyDieback === 'moderate' || assessment.canopyDieback === 'severe')) treeCurrentScore -= 15;
      }

      totalScore += Math.max(0, treeCurrentScore); // Ensure score doesn't go below 0
    });

    const calculatedScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    setHealthScore(calculatedScore);

    // Generate message based on score and AI persona
    let message = '';
    if (calculatedScore >= 80) {
      message = `Your forest is thriving! ${currentPersona?.name || ''} is impressed with its vitality.`;
    } else if (calculatedScore >= 50) {
      message = `Good progress! ${currentPersona?.name || ''} suggests reviewing some trees for potential improvements.`;
    } else {
      message = `Attention needed. ${currentPersona?.name || ''} recommends immediate action to improve forest health.`;
    }
    setHealthMessage(message);

  }, [trees, currentPersona, treeCount]);

  return (
    <Card className="dashboard-card-enhanced h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
          <Gauge className="h-5 w-5 text-green-600" /> Forest Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between pt-4">
        <div className="text-center mb-4">
          <p className="text-5xl font-bold text-green-700">{healthScore}%</p>
          <Progress value={healthScore} className="w-full mt-2" />
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MessageSquare className="h-4 w-4 flex-shrink-0" />
          <p className="italic">{healthMessage}</p>
        </div>
      </CardContent>
    </Card>
  );
}
