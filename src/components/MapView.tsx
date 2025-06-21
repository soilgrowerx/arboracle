'use client';

import { Tree } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  trees: Tree[];
}

export function MapView({ trees }: MapViewProps) {
  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="bg-white/70 backdrop-blur-sm border border-green-200 rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-full">
            <MapPin className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-800">Map View</h2>
            <p className="text-green-600">Tree locations and coordinates</p>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">
            📍 Showing {trees.length} tree location{trees.length !== 1 ? 's' : ''} 
            {trees.length > 0 && ' - Click on any tree card to view details'}
          </p>
        </div>
      </div>

      {/* Tree Location Grid */}
      {trees.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white/70 backdrop-blur-sm border border-green-200 rounded-lg p-12 shadow-lg max-w-md mx-auto">
            <div className="text-6xl mb-6">🗺️</div>
            <h3 className="text-2xl font-bold text-green-800 mb-4">No Tree Locations</h3>
            <p className="text-green-700">
              Add trees to see their locations on the map view
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {trees.map((tree) => (
            <Card key={tree.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 border-green-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">🌳</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-green-800 truncate mb-1">
                      {tree.commonName || tree.species}
                    </h3>
                    
                    {/* Coordinates */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-green-600 flex-shrink-0" />
                        <span className="text-green-700 font-mono text-xs">
                          {tree.location.lat.toFixed(6)}, {tree.location.lng.toFixed(6)}
                        </span>
                      </div>
                      
                      {/* Plus Code */}
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <div className="text-xs text-green-600 font-medium mb-1">Plus Code:</div>
                        <div className="font-mono text-xs text-green-800 break-all">
                          {tree.plus_code_local}
                        </div>
                      </div>
                    </div>

                    {/* Scientific Name */}
                    {tree.scientificName && (
                      <div className="mt-2 text-xs text-green-600 italic truncate">
                        {tree.scientificName}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}