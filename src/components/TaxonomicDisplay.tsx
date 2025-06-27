'use client';

import React from 'react';
import { TaxonomicHierarchy } from '@/types/tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaxonomicDisplayProps {
  taxonomy?: TaxonomicHierarchy;
  showTitle?: boolean;
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
}

export function TaxonomicDisplay({ 
  taxonomy, 
  showTitle = true, 
  variant = 'full',
  className 
}: TaxonomicDisplayProps) {
  if (!taxonomy) return null;

  // Define the taxonomic ranks in order
  const mainRanks = [
    { key: 'kingdom' as keyof TaxonomicHierarchy, label: 'Kingdom', icon: '👑', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { key: 'phylum' as keyof TaxonomicHierarchy, label: 'Phylum', icon: '🏛️', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { key: 'class' as keyof TaxonomicHierarchy, label: 'Class', icon: '🎓', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    { key: 'order' as keyof TaxonomicHierarchy, label: 'Order', icon: '📋', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    { key: 'family' as keyof TaxonomicHierarchy, label: 'Family', icon: '👨‍👩‍👧‍👦', color: 'bg-teal-100 text-teal-800 border-teal-300' },
    { key: 'genus' as keyof TaxonomicHierarchy, label: 'Genus', icon: '🧬', color: 'bg-green-100 text-green-800 border-green-300' },
    { key: 'species' as keyof TaxonomicHierarchy, label: 'Species', icon: '🌿', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
  ];

  const subRanks = [
    { key: 'subkingdom' as keyof TaxonomicHierarchy, label: 'Subkingdom', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { key: 'subphylum' as keyof TaxonomicHierarchy, label: 'Subphylum', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'subclass' as keyof TaxonomicHierarchy, label: 'Subclass', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { key: 'suborder' as keyof TaxonomicHierarchy, label: 'Suborder', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { key: 'subfamily' as keyof TaxonomicHierarchy, label: 'Subfamily', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { key: 'subgenus' as keyof TaxonomicHierarchy, label: 'Subgenus', color: 'bg-green-50 text-green-700 border-green-200' },
    { key: 'subspecies' as keyof TaxonomicHierarchy, label: 'Subspecies', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { key: 'variety' as keyof TaxonomicHierarchy, label: 'Variety', color: 'bg-lime-50 text-lime-700 border-lime-200' },
    { key: 'form' as keyof TaxonomicHierarchy, label: 'Form', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
  ];

  // Filter to only show ranks that have values
  const availableMainRanks = mainRanks.filter(rank => taxonomy[rank.key]);
  const availableSubRanks = subRanks.filter(rank => taxonomy[rank.key]);

  if (availableMainRanks.length === 0 && availableSubRanks.length === 0) {
    return null;
  }

  // Inline variant for compact display
  if (variant === 'inline') {
    return (
      <div className={cn("flex flex-wrap items-center gap-1", className)}>
        {availableMainRanks.slice(-2).map((rank) => (
          <Badge key={rank.key} variant="outline" className={cn("text-xs", rank.color)}>
            {rank.icon} {taxonomy[rank.key]}
          </Badge>
        ))}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        {showTitle && (
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            🧬 Taxonomic Classification
          </h4>
        )}
        <div className="grid grid-cols-1 gap-1">
          {availableMainRanks.map((rank) => (
            <div key={rank.key} className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 min-w-[60px]">{rank.label}:</span>
              <Badge variant="outline" className={cn("text-xs", rank.color)}>
                {rank.icon} {taxonomy[rank.key]}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full variant with complete display
  return (
    <Card className={cn("overflow-hidden", className)}>
      {showTitle && (
        <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-green-200 pb-3">
          <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-3">
            <span className="text-2xl">🧬</span>
            <span>Complete Taxonomic Classification</span>
          </CardTitle>
          <p className="text-sm text-green-600 mt-1">
            Full scientific hierarchy following Linnaean taxonomy
          </p>
        </CardHeader>
      )}
      <CardContent className="p-6">
        {/* Main Taxonomic Ranks */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableMainRanks.map((rank, index) => (
              <div
                key={rank.key}
                className="group relative p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-md"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {rank.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {rank.label}
                    </div>
                    <div className="font-semibold text-gray-900 text-base leading-tight">
                      {taxonomy[rank.key]}
                    </div>
                  </div>
                </div>
                
                {/* Connecting line to next rank */}
                {index < availableMainRanks.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 w-6 h-0.5 bg-gradient-to-r from-green-300 to-emerald-300 transform -translate-y-1/2 z-10">
                    <div className="absolute right-0 top-1/2 w-2 h-2 bg-emerald-400 rounded-full transform -translate-y-1/2 translate-x-1"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sub-ranks if available */}
          {availableSubRanks.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-lg">📋</span>
                Additional Classifications
              </h5>
              <div className="flex flex-wrap gap-2">
                {availableSubRanks.map((rank) => (
                  <Badge
                    key={rank.key}
                    variant="outline"
                    className={cn(
                      "text-xs font-medium transition-all duration-200 hover:scale-105",
                      rank.color
                    )}
                  >
                    <span className="font-medium">{rank.label}:</span>
                    <span className="ml-1 font-normal">{taxonomy[rank.key]}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Scientific notation explanation */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-lg">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Scientific Classification System</p>
                <p className="text-blue-700">
                  This hierarchical system, established by Carl Linnaeus, organizes life forms 
                  from broad kingdoms down to specific species, enabling precise scientific identification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for showing just the binomial nomenclature
export function BinomialNomenclature({ taxonomy }: { taxonomy?: TaxonomicHierarchy }) {
  if (!taxonomy?.genus || !taxonomy?.species) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
      <span className="text-sm text-green-600 font-medium">Scientific name:</span>
      <span className="font-serif italic text-green-800 font-semibold">
        {taxonomy.genus} {taxonomy.species}
      </span>
    </div>
  );
}

// Helper component for taxonomy breadcrumb
export function TaxonomyBreadcrumb({ taxonomy }: { taxonomy?: TaxonomicHierarchy }) {
  if (!taxonomy) return null;

  const hierarchy = [
    { label: 'K', value: taxonomy.kingdom, title: 'Kingdom' },
    { label: 'P', value: taxonomy.phylum, title: 'Phylum' },
    { label: 'C', value: taxonomy.class, title: 'Class' },
    { label: 'O', value: taxonomy.order, title: 'Order' },
    { label: 'F', value: taxonomy.family, title: 'Family' },
    { label: 'G', value: taxonomy.genus, title: 'Genus' },
    { label: 'S', value: taxonomy.species, title: 'Species' }
  ].filter(item => item.value);

  if (hierarchy.length === 0) return null;

  return (
    <div className="flex items-center gap-1 text-xs">
      {hierarchy.map((item, index) => (
        <React.Fragment key={item.label}>
          <span
            className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono hover:bg-gray-200 cursor-help transition-colors"
            title={`${item.title}: ${item.value}`}
          >
            {item.label}
          </span>
          {index < hierarchy.length - 1 && (
            <span className="text-gray-400">›</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}