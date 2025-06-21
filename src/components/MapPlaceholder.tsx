'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';

interface MapPlaceholderProps {
  trees?: any[];
  className?: string;
}

export function MapPlaceholder({ trees = [], className = '' }: MapPlaceholderProps) {
  return (
    <Card className={`bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 ${className}`}>
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <Navigation size={20} />
          Tree Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-green-100 rounded-lg border-2 border-dashed border-green-300 flex flex-col items-center justify-center text-green-600">
          <div className="text-6xl mb-4">🗺️</div>
          <div className="text-center space-y-2">
            <p className="font-semibold">Interactive Map Coming Soon</p>
            <p className="text-sm opacity-75">
              {trees.length > 0 
                ? `${trees.length} tree${trees.length !== 1 ? 's' : ''} ready to display`
                : 'Add trees to see them on the map'
              }
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>Precise Locations</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🌍</span>
                <span>Plus Codes</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>GPS Coordinates</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}