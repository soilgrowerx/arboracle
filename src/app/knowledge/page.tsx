'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KnowledgePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the introduction page of the knowledge base
    router.replace('/learn');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="text-green-700 flex items-center gap-2">
        <span className="animate-spin">📚</span> Loading knowledge base...
      </div>
    </div>
  );
}