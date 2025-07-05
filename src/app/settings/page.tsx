'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UnitService, UnitSystem } from '@/services/unitService';

export default function SettingsPage() {
  const { toast } = useToast();
  const [units, setUnits] = useState<UnitSystem>(UnitService.getPreferredUnitSystem());
  const [aiPersona, setAiPersona] = useState('Bodhi'); // New state for AI persona

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('arboracle_user_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setUnits(settings.preferences?.units || UnitService.getPreferredUnitSystem());
        setAiPersona(settings.preferences?.aiPersona || 'Bodhi');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const handleSaveSettings = () => {
    try {
      UnitService.setPreferredUnitSystem(units);
      const settings = {
        preferences: {
          units: units,
          aiPersona: aiPersona,
        },
      };
      localStorage.setItem('arboracle_user_settings', JSON.stringify(settings));
      toast({
        title: "Settings Saved!",
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-100">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-green-800 mt-4">Settings</h1>
        <p className="text-green-600">Manage your application preferences.</p>
      </header>

      <Card className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Unit Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="units" className="text-green-700">Measurement Units</Label>
            <Select value={units} onValueChange={setUnits}>
              <SelectTrigger className="w-full mt-1 border-green-200 focus:border-green-400">
                <SelectValue placeholder="Select units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (cm, m)</SelectItem>
                <SelectItem value="imperial">Imperial (in, ft)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="aiPersona" className="text-green-700">AI Assistant Persona</Label>
            <Select value={aiPersona} onValueChange={setAiPersona}>
              <SelectTrigger className="w-full mt-1 border-green-200 focus:border-green-400">
                <SelectValue placeholder="Select AI Persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bodhi">Bodhi (Balanced)</SelectItem>
                <SelectItem value="Sequoia">Sequoia (Scientific)</SelectItem>
                <SelectItem value="Willow">Willow (Practical)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSaveSettings} className="btn-primary-enhanced">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}