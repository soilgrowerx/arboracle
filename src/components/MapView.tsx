'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Tree } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the map component to avoid SSR issues
const DynamicMapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-green-50 rounded-lg border border-green-200 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="w-12 h-12 rounded-full mx-auto bg-green-200" />
        <Skeleton className="w-32 h-4 mx-auto bg-green-200" />
        <p className="text-green-600">Loading map...</p>
      </div>
    </div>
  )
});

interface MapViewProps {
  trees: Tree[];
  onTreeSelect?: (tree: Tree) => void;
}

export function MapView({ trees, onTreeSelect }: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-green-50 rounded-lg border border-green-200 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🗺️</div>
          <p className="text-green-600">Preparing map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Tree Locations</h3>
        <p className="text-sm text-green-600">
          {trees.length === 0 
            ? "No trees to display on map" 
            : `Showing ${trees.length} tree${trees.length !== 1 ? 's' : ''} on map`
          }
        </p>
      </div>
      
      <DynamicMapComponent trees={trees} onTreeSelect={onTreeSelect} />
    </div>
  );
}