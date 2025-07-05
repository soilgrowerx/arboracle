
'use client';

import { Tree } from '@/types/tree'; // Updated import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Ruler, CircleDot, Leaf, BarChart } from 'lucide-react';

interface TreeStatisticsProps {
  trees: Tree[];
}

export function TreeStatistics({ trees }: TreeStatisticsProps) {
  const totalTrees = trees.length;

  const averageHeight = (
    trees.reduce((sum, tree) => sum + (tree.height || 0), 0) / totalTrees
  ).toFixed(1);

  const averageDBH = (
    trees.reduce((sum, tree) => sum + (tree.dbh || 0), 0) / totalTrees
  ).toFixed(1);

  const speciesDiversity = new Set(trees.map((tree) => tree.species)).size;

  const healthStatusCounts = trees.reduce((acc, tree) => {
    const status = tree.conditionAssessment?.overallCondition || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="dashboard-card-enhanced h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
          <BarChart className="h-5 w-5 text-green-600" /> Tree Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <Sprout className="h-6 w-6 text-green-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Total Trees</p>
            <p className="text-xl font-bold text-green-800">{totalTrees}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Ruler className="h-6 w-6 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Avg. Height</p>
            <p className="text-xl font-bold text-blue-800">{totalTrees > 0 ? `${averageHeight} ft` : 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <CircleDot className="h-6 w-6 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Avg. DBH</p>
            <p className="text-xl font-bold text-purple-800">{totalTrees > 0 ? `${averageDBH} in` : 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <Leaf className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Species Diversity</p>
            <p className="text-xl font-bold text-emerald-800">{speciesDiversity}</p>
          </div>
        </div>
        <div className="col-span-full p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Health Status Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(healthStatusCounts).map(([status, count]) => (
              <span key={status} className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-800">
                {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
              </span>
            ))}
            {totalTrees === 0 && <p className="text-sm text-gray-500">No data available.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
