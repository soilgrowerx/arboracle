'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Leaf, TreePine, AlertTriangle, CheckCircle } from 'lucide-react';

export function ForestHealthScore() {
  // Mock data for forest health metrics
  const healthScore = 87;
  const treeCount = 0; // Since no trees are added yet
  const healthMetrics = {
    healthy: 0,
    monitoring: 0,
    atRisk: 0,
    total: 0
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Leaf className="w-5 h-5" />
          Forest Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Score Display */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(healthScore)}`}>
              {healthScore}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {getScoreStatus(healthScore)}
            </div>
            <Progress value={healthScore} className="h-2 bg-gray-200" />
          </div>

          {/* Health Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white rounded-lg border border-green-100">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">Healthy</span>
              </div>
              <div className="text-lg font-bold text-green-600">{healthMetrics.healthy}</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg border border-green-100">
              <div className="flex items-center justify-center mb-1">
                <TreePine className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">Monitoring</span>
              </div>
              <div className="text-lg font-bold text-blue-600">{healthMetrics.monitoring}</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg border border-green-100">
              <div className="flex items-center justify-center mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">At Risk</span>
              </div>
              <div className="text-lg font-bold text-orange-600">{healthMetrics.atRisk}</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg border border-green-100">
              <div className="flex items-center justify-center mb-1">
                <Leaf className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">Total Trees</span>
              </div>
              <div className="text-lg font-bold text-gray-600">{treeCount}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-green-100">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                AI-Powered Analysis
              </Badge>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Real-time Updates
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {treeCount === 0 
                ? "Add trees to begin tracking your forest health metrics"
                : "Score based on condition assessments, growth data, and ecological factors"
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}