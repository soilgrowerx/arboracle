'use client';

import React from 'react';
import { Tree } from '@/types/tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';

interface AnalyticsDashboardProps {
  trees: Tree[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ trees }) => {
  const speciesData = trees.reduce((acc, tree) => {
    acc[tree.species] = (acc[tree.species] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSpecies = Object.entries(speciesData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const healthData = trees.reduce((acc, tree) => {
    const status = tree.condition_assessment?.health_status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="dashboard-card-enhanced">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Species Distribution */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Top Species
          </h4>
          <div className="space-y-2">
            {topSpecies.map(([species, count], index) => (
              <div key={species} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{species}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(count / trees.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Distribution */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Health Status
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(healthData).map(([status, count]) => (
              <div key={status} className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-gray-700">{count}</div>
                <div className="text-xs text-gray-600">{status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Diversity Index:</span>
            <Badge variant="outline" className="text-blue-600">
              {Object.keys(speciesData).length} species
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { AnalyticsDashboard };
export default AnalyticsDashboard;