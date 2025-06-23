'use client';

import { useState, useEffect } from 'react';
import { Site, SiteService } from '@/services/siteService';
import { SiteCard } from '@/components/SiteCard';
import { AddSiteModal } from '@/components/AddSiteModal';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';

export function MySitesSection() {
  const [sites, setSites] = useState<Site[]>([]);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  const loadSites = () => {
    try {
      const allSites = SiteService.getAllSites();
      setSites(allSites);
    } catch (error) {
      console.error('Error loading sites:', error);
      setSites([]);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleSiteAdded = () => {
    loadSites();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            My Sites
          </h2>
          <p className="text-gray-600">Manage your project sites and locations</p>
        </div>
        <Button
          onClick={() => setIsAddSiteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Site
        </Button>
      </div>

      {sites.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sites Created Yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first site to organize trees by location or project
          </p>
          <Button
            onClick={() => setIsAddSiteModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Your First Site
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <SiteCard 
              key={site.id} 
              site={site}
              onClick={() => {
                // TODO: Navigate to site detail view or filter trees by site
                console.log('Site clicked:', site.name);
              }}
            />
          ))}
        </div>
      )}

      <AddSiteModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        onSiteAdded={handleSiteAdded}
      />
    </div>
  );
}