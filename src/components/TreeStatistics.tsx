'use client';

import { Tree } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { TreePine, FlaskConical, Shield, Calendar } from 'lucide-react';
import { calculateTreeAge } from '@/lib/utils';

interface TreeStatisticsProps {
  trees: Tree[];
}

export function TreeStatistics({ trees }: TreeStatisticsProps) {
  // Calculate statistics
  const totalTrees = trees.length;
  
  const uniqueSpecies = new Set(
    trees.map(tree => tree.commonName || tree.species)
  ).size;
  
  const iNaturalistVerified = trees.filter(tree => tree.iNaturalistId).length;
  
  const averageAge = trees.length > 0 
    ? trees.reduce((sum, tree) => {
        const age = calculateTreeAge(tree.date_planted);
        return sum + age.totalDays;
      }, 0) / trees.length / 365 // Convert to years
    : 0;

  const stats = [
    {
      id: 'total',
      title: 'Total Trees',
      value: totalTrees.toLocaleString(),
      icon: TreePine,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    {
      id: 'species',
      title: 'Unique Species',
      value: uniqueSpecies.toLocaleString(),
      icon: FlaskConical,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'verified',
      title: 'iNaturalist Verified',
      value: iNaturalistVerified.toLocaleString(),
      icon: Shield,
      gradient: 'from-teal-500 to-cyan-600',
      bgGradient: 'from-teal-50 to-cyan-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-800',
      iconColor: 'text-teal-600'
    },
    {
      id: 'age',
      title: 'Average Age',
      value: averageAge > 0 ? `${averageAge.toFixed(1)} years` : 'N/A',
      icon: Calendar,
      gradient: 'from-cyan-500 to-blue-600',
      bgGradient: 'from-cyan-50 to-blue-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-800',
      iconColor: 'text-cyan-600'
    }
  ];

  if (totalTrees === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          
          return (
            <Card
              key={stat.id}
              className={`
                statistics-card-enhanced 
                bg-gradient-to-br ${stat.bgGradient} 
                border-2 ${stat.borderColor} 
                hover:border-opacity-60 
                transition-all duration-300 ease-in-out 
                transform hover:scale-105 hover:-translate-y-1
                shadow-lg hover:shadow-xl
                backdrop-blur-sm
                relative overflow-hidden
              `}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${stat.textColor} opacity-80 mb-1 uppercase tracking-wide`}>
                      {stat.title}
                    </h3>
                    <p className={`text-3xl font-bold ${stat.textColor} mb-0`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`
                    p-3 rounded-full 
                    bg-gradient-to-br ${stat.gradient} 
                    shadow-lg 
                    transform transition-transform duration-300
                    hover:scale-110 hover:rotate-12
                  `}>
                    <IconComponent 
                      size={24} 
                      className="text-white drop-shadow-sm"
                    />
                  </div>
                </div>
                
                {/* Decorative background pattern */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <div className={`w-full h-full bg-gradient-to-br ${stat.gradient} rounded-full transform translate-x-6 -translate-y-6`} />
                </div>
                <div className="absolute bottom-0 left-0 w-16 h-16 opacity-5">
                  <div className={`w-full h-full bg-gradient-to-tr ${stat.gradient} rounded-full transform -translate-x-4 translate-y-4`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}