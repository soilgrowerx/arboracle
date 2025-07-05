'use client';

import { MySitesSection } from '@/components/MySitesSection';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SitesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <MySitesSection />
        </div>
      </div>
    </div>
  );
}