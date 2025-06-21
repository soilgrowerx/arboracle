'use client';

import { Tree } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, StickyNote } from 'lucide-react';

interface TreeCardProps {
  tree: Tree;
  onClick?: () => void;
}

export function TreeCard({ tree, onClick }: TreeCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow bg-green-50 border-green-200 hover:border-green-300"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
          <span className="text-green-600">🌳</span>
          {tree.species}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-green-700">
          <MapPin size={16} />
          <span className="font-mono text-xs bg-green-100 px-2 py-1 rounded">
            {tree.plus_code_local}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-green-700">
          <Calendar size={16} />
          <span>Planted: {formatDate(tree.date_planted)}</span>
        </div>

        {tree.notes && (
          <div className="flex items-start gap-2 text-sm text-green-700">
            <StickyNote size={16} className="mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{tree.notes}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {tree.images.length > 0 && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              📸 {tree.images.length} photo{tree.images.length !== 1 ? 's' : ''}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs border-green-300 text-green-600">
            Added {formatDate(tree.created_at)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}