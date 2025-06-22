'use client';

import { Tree } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreePine, FlaskConical, Shield, Calendar, TrendingUp, TrendingDown, Minus, Leaf, Database } from 'lucide-react';
import { calculateTreeAge } from '@/lib/utils';
import { EcosystemService } from '@/services/ecosystemService';

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
  const verificationRate = totalTrees > 0 ? (iNaturalistVerified / totalTrees) * 100 : 0;
  
  const averageAge = trees.length > 0 
    ? trees.reduce((sum, tree) => {
        const age = calculateTreeAge(tree.date_planted);
        return sum + age.totalDays;
      }, 0) / trees.length / 365 // Convert to years
    : 0;

  // Calculate ecosystem species
  const totalEcosystemSpecies = trees.reduce((total, tree) => {
    return total + EcosystemService.getEcosystemSpeciesCount(tree.id);
  }, 0);

  // Calculate species diversity index (Shannon's diversity)
  const speciesCount = trees.reduce((acc, tree) => {
    const species = tree.commonName || tree.species;
    acc[species] = (acc[species] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const diversityIndex = uniqueSpecies > 1 
    ? Object.values(speciesCount).reduce((shannon, count) => {
        const proportion = count / totalTrees;
        return shannon - (proportion * Math.log2(proportion));
      }, 0)
    : 0;

  // Calculate health score based on multiple factors
  const healthScore = totalTrees > 0 
    ? Math.round(
        (verificationRate * 0.4) + // 40% verification rate
        (Math.min(diversityIndex / 3, 1) * 30) + // 30% diversity (capped at 3)
        (Math.min(averageAge / 5, 1) * 20) + // 20% maturity (capped at 5 years)
        (Math.min(totalEcosystemSpecies / totalTrees, 1) * 10) // 10% ecosystem richness
      )
    : 0;

  // Calculate growth trends (last 30 days vs previous 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recentTrees = trees.filter(tree => new Date(tree.created_at) >= thirtyDaysAgo).length;
  const previousTrees = trees.filter(tree => {
    const date = new Date(tree.created_at);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  }).length;

  const getGrowthTrend = () => {
    if (previousTrees === 0) return recentTrees > 0 ? 'up' : 'stable';
    const growthRate = ((recentTrees - previousTrees) / previousTrees) * 100;
    if (growthRate > 10) return 'up';
    if (growthRate < -10) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-green-600" />;
      case 'down': return <TrendingDown size={14} className="text-red-600" />;
      default: return <Minus size={14} className="text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const growthTrend = getGrowthTrend();

  const stats = [
    {
      id: 'total',
      title: 'Total Trees',
      value: totalTrees.toLocaleString(),
      subtitle: `+${recentTrees} this month`,
      trend: growthTrend,
      icon: TreePine,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    {
      id: 'diversity',
      title: 'Species Diversity',
      value: `${diversityIndex.toFixed(1)}`,
      subtitle: `${uniqueSpecies} unique species`,
      trend: uniqueSpecies > 3 ? 'up' : uniqueSpecies < 2 ? 'down' : 'stable',
      icon: FlaskConical,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'health',
      title: 'Forest Health Score',
      value: `${healthScore}%`,
      subtitle: `${verificationRate.toFixed(0)}% verified`,
      trend: healthScore >= 70 ? 'up' : healthScore < 50 ? 'down' : 'stable',
      icon: Shield,
      gradient: 'from-teal-500 to-cyan-600',
      bgGradient: 'from-teal-50 to-cyan-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-800',
      iconColor: 'text-teal-600'
    },
    {
      id: 'ecosystem',
      title: 'Ecosystem Species',
      value: totalEcosystemSpecies.toLocaleString(),
      subtitle: `Avg ${(totalEcosystemSpecies / Math.max(totalTrees, 1)).toFixed(1)} per tree`,
      trend: totalEcosystemSpecies > totalTrees ? 'up' : totalEcosystemSpecies === 0 ? 'down' : 'stable',
      icon: Leaf,
      gradient: 'from-cyan-500 to-blue-600',
      bgGradient: 'from-cyan-50 to-blue-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-800',
      iconColor: 'text-cyan-600'
    },
    {
      id: 'maturity',
      title: 'Average Maturity',
      value: averageAge > 0 ? `${averageAge.toFixed(1)} years` : 'N/A',
      subtitle: 'Forest development',
      trend: averageAge >= 3 ? 'up' : averageAge < 1 ? 'down' : 'stable',
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      iconColor: 'text-purple-600'
    },
    {
      id: 'data',
      title: 'Data Quality',
      value: `${Math.round((trees.filter(t => t.scientificName && t.lat && t.lng).length / Math.max(totalTrees, 1)) * 100)}%`,
      subtitle: 'Complete records',
      trend: Math.round((trees.filter(t => t.scientificName && t.lat && t.lng).length / Math.max(totalTrees, 1)) * 100) >= 80 ? 'up' : 'stable',
      icon: Database,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600'
    }
  ];

  if (totalTrees === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-xs font-semibold ${stat.textColor} opacity-80 uppercase tracking-wide`}>
                        {stat.title}
                      </h3>
                      {stat.trend && (
                        <div className={`${getTrendColor(stat.trend)}`}>
                          {getTrendIcon(stat.trend)}
                        </div>
                      )}
                    </div>
                    <p className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                      {stat.value}
                    </p>
                    {stat.subtitle && (
                      <p className={`text-xs ${stat.textColor} opacity-60`}>
                        {stat.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`
                    p-2 rounded-full 
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