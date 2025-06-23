'use client';

import { Site } from '@/services/siteService';
import { MapPin, TreePine, Calendar } from 'lucide-react';

interface SiteCardProps {
  site: Site;
  onClick?: () => void;
}

export function SiteCard({ site, onClick }: SiteCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 line-clamp-1">{site.name}</h3>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <TreePine className="h-4 w-4" />
          <span>{site.treeCount || 0}</span>
        </div>
      </div>

      {site.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {site.description}
        </p>
      )}

      {site.location && (
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {site.location}
        </p>
      )}

      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Calendar className="h-3 w-3" />
        <span>Created {formatDate(site.createdAt)}</span>
      </div>
    </div>
  );
}