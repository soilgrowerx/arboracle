'use client';

import React from 'react';
import { Tree } from '@/types/tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreePine, MapPin, Calendar, Activity } from 'lucide-react';

interface TreeStatisticsProps {
  trees: Tree[];
}

const TreeStatistics: React.FC<TreeStatisticsProps> = ({ trees }) => {
  const totalTrees = trees.length;
  const speciesCount = new Set(trees.map(tree => tree.species)).size;
  const verifiedTrees = trees.filter(tree => tree.verification_status === 'verified').length;
  const recentTrees = trees.filter(tree => {
    const plantedDate = new Date(tree.date_planted);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return plantedDate >= thirtyDaysAgo;
  }).length;

  const healthyTrees = trees.filter(tree => 
    tree.condition_assessment?.health_status === 'Excellent' || 
    tree.condition_assessment?.health_status === 'Good'
  ).length;

  const stats = [
    {
      title: 'Total Trees',
      value: totalTrees,
      icon: TreePine,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Species Diversity',
      value: speciesCount,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Verified Trees',
      value: verifiedTrees,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Recently Added',
      value: recentTrees,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <Card className="dashboard-card-enhanced">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <TreePine className="h-5 w-5" />
          Tree Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`p-4 rounded-lg ${stat.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>
        
        {totalTrees > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Health Status</span>
              <Badge variant="outline" className="text-green-600">
                {Math.round((healthyTrees / totalTrees) * 100)}% Healthy
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { TreeStatistics };
export default TreeStatistics;