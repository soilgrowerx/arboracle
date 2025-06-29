'use client';

import React from 'react';
import { Tree } from '@/types/tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Leaf, TreePine, AlertTriangle, CheckCircle, Download, FileText } from 'lucide-react';

interface ForestHealthScoreProps {
  trees: Tree[];
  aiPersona: string;
}

export function ForestHealthScore({ trees, aiPersona }: ForestHealthScoreProps) {
  const totalTrees = trees.length;

  // Calculate health metrics based on tree data
  const healthyTrees = trees.filter(tree => tree.health_status === 'Excellent' || tree.health_status === 'Good').length;
  const monitoringTrees = trees.filter(tree => tree.health_status === 'Fair').length;
  const atRiskTrees = trees.filter(tree => tree.health_status === 'Poor' || tree.health_status === 'Dead').length;

  const healthMetrics = {
    healthy: healthyTrees,
    monitoring: monitoringTrees,
    atRisk: atRiskTrees,
    total: totalTrees
  };

  // Calculate health score (example logic, can be refined)
  // This is a simplified example. A real health score would involve more complex factors.
  const healthScore = totalTrees > 0
    ? Math.round(
        ((healthyTrees * 1.0) + (monitoringTrees * 0.5) + (atRiskTrees * 0.1)) / totalTrees * 100
      )
    : 0;

  const exportHealthReport = () => {
    const reportData = {
      title: 'Arboracle Forest Health Report',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      healthScore: healthScore,
      status: getScoreStatus(healthScore),
      metrics: healthMetrics,
      summary: `Forest health assessment shows ${getScoreStatus(healthScore).toLowerCase()} condition with a score of ${healthScore}/100. ${totalTrees === 0 ? 'No trees currently tracked. Begin adding trees to generate detailed health analytics.' : `Analysis based on ${totalTrees} tracked trees with comprehensive condition data. Powered by ${aiPersona}.`}`,
      recommendations: [
        'Regular condition assessments every 6 months',
        'Monitor for pest and disease indicators',
        'Maintain proper soil conditions and drainage',
        'Consider professional arborist consultation for trees at risk'
      ]
    };

    const csvContent = [
      'Arboracle Forest Health Report',
      `Generated: ${reportData.date} at ${reportData.time}`,
      '',
      'HEALTH SCORE SUMMARY',
      `Overall Score,${reportData.healthScore}/100`,
      `Status,${reportData.status}`,
      '',
      'TREE HEALTH BREAKDOWN',
      'Category,Count',
      `Healthy,${healthMetrics.healthy}`,
      `Monitoring,${healthMetrics.monitoring}`,
      `At Risk,${healthMetrics.atRisk}`,
      `Total Trees,${healthMetrics.total}`,
      '',
      'SUMMARY',
      reportData.summary,
      '',
      'RECOMMENDATIONS',
      ...reportData.recommendations.map(rec => `• ${rec}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `arboracle-health-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
              const treeCount = totalTrees;
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-green-100">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                AI-Powered Analysis
              </Badge>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Real-time Updates
              </Badge>
            </div>
            
            <Button 
              onClick={exportHealthReport}
              variant="outline"
              size="sm"
              className="w-full mb-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <FileText className="w-3 h-3 mr-2" />
              Export Health Report
            </Button>
            
            <p className="text-xs text-gray-500">
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