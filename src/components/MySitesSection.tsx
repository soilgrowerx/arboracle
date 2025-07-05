'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, TreePine } from 'lucide-react';

interface MySitesSectionProps {
  // Add props as needed
}

export const MySitesSection: React.FC<MySitesSectionProps> = () => {
  // Mock data for now
  const sites = [
    {
      id: '1',
      name: 'Central Park Project',
      location: 'New York, NY',
      treeCount: 45,
      lastVisit: '2025-01-15',
      status: 'active'
    },
    {
      id: '2', 
      name: 'Downtown Restoration',
      location: 'San Francisco, CA',
      treeCount: 23,
      lastVisit: '2025-01-10',
      status: 'completed'
    }
  ];

  return (
    <Card className="dashboard-card-enhanced">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          My Sites
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sites.map((site) => (
          <div key={site.id} className="p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{site.name}</h4>
              <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                {site.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {site.location}
              </div>
              <div className="flex items-center gap-1">
                <TreePine className="h-3 w-3" />
                {site.treeCount} trees
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(site.lastVisit).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MySitesSection;