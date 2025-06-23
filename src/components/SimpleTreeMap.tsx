'use client';

import dynamic from 'next/dynamic';
import { Tree } from '@/types/tree';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '600px', width: '100%', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
      <p>Loading map...</p>
    </div>
  ),
});

interface SimpleTreeMapProps {
  trees: Tree[];
  onTreeSelect?: (tree: Tree) => void;
}

export function SimpleTreeMap({ trees, onTreeSelect }: SimpleTreeMapProps) {
  return <LeafletMap trees={trees} onTreeSelect={onTreeSelect} />;
}