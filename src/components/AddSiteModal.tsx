'use client';

import { useState } from 'react';
import { Site, SiteService } from '@/services/siteService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, MapPin } from 'lucide-react';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteAdded: () => void;
}

export function AddSiteModal({ isOpen, onClose, onSiteAdded }: AddSiteModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      SiteService.createSite({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
      });

      setFormData({ name: '', description: '', location: '' });
      onSiteAdded();
      onClose();
    } catch (error) {
      console.error('Error creating site:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Site</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
              Site Name *
            </label>
            <Input
              id="siteName"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Central Park East Side, Smith Property..."
              required
            />
          </div>

          <div>
            <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              id="siteDescription"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the site, management goals, or special notes..."
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="siteLocation" className="block text-sm font-medium text-gray-700 mb-2">
              Location/Address
            </label>
            <Input
              id="siteLocation"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., 123 Main St, New York, NY 10001"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.name.trim()}
            >
              Create Site
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}