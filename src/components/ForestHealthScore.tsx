'use client';

import React from 'react';
import { Tree } from '@/types/tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Leaf, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface ForestHealthScoreProps {
  trees: Tree[];
  aiPersona: string;
  treeCount: number;
}

const ForestHealthScore: React.FC<ForestHealthScoreProps> = ({ trees, aiPersona, treeCount }) => {
  // Calculate health score based on tree conditions
  const calculateHealthScore = () => {
    if (trees.length === 0) return 0;
    
    const healthValues = {
      'Excellent': 100,
      'Good': 80,
      'Fair': 60,
      'Poor': 40,
      'Dead': 0
    };
    
    const totalScore = trees.reduce((sum, tree) => {
      const status = tree.condition_assessment?.health_status || 'Fair';
      return sum + (healthValues[status] || 60);
    }, 0);
    
    return Math.round(totalScore / trees.length);
  };

  const healthScore = calculateHealthScore();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return TrendingUp;
    return AlertTriangle;
  };

  const ScoreIcon = getScoreIcon(healthScore);

  return (
    <Card className="dashboard-card-enhanced">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          Forest Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(healthScore)} flex items-center justify-center gap-2`}>
            <ScoreIcon className="h-8 w-8" />
            {healthScore}
          </div>
          <p className="text-sm text-gray-600 mt-1">Overall Health Score</p>
        </div>
        
        <Progress value={healthScore} className="h-3" />
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-700">{treeCount}</div>
            <div className="text-green-600">Total Trees</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-semibold text-blue-700">
              {trees.filter(t => t.condition_assessment?.health_status === 'Excellent' || t.condition_assessment?.health_status === 'Good').length}
            </div>
            <div className="text-blue-600">Healthy Trees</div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">AI Persona:</span>
            <Badge variant="outline" className="text-green-600">
              {aiPersona}
            </Badge>
          </div>
        </div>

        {healthScore < 60 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Forest health needs attention. Consider professional assessment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ForestHealthScore };
export default ForestHealthScore;