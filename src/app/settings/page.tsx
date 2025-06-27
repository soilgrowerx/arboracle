'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, User, Bot, Settings, Palette, Bell, Shield, 
  Save, RefreshCw, Sparkles, TreePine, Heart, Brain
} from 'lucide-react';
import Link from 'next/link';

// AI Personalities Data
const aiPersonalities = [
  {
    id: 'bodhi',
    name: 'Bodhi',
    emoji: '🧘',
    description: 'Wise and contemplative tree sage focused on ecological wisdom and mindful cultivation',
    traits: ['Philosophical', 'Patient', 'Wise', 'Ecological'],
    expertise: 'Deep ecological knowledge, meditation on tree wisdom, sustainable practices',
    tone: 'Calm, thoughtful, and spiritually connected to nature'
  },
  {
    id: 'quercus',
    name: 'Quercus',
    emoji: '🌳',
    description: 'Scholarly oak spirit with encyclopedic knowledge of tree science and forestry',
    traits: ['Academic', 'Detailed', 'Methodical', 'Scholarly'],
    expertise: 'Tree taxonomy, forestry science, botanical research, historical knowledge',
    tone: 'Professional, precise, and richly informative'
  },
  {
    id: 'prunus',
    name: 'Prunus',
    emoji: '🌸',
    description: 'Enthusiastic cherry blossom personality celebrating beauty and seasonal cycles',
    traits: ['Cheerful', 'Seasonal', 'Aesthetic', 'Celebratory'],
    expertise: 'Ornamental trees, seasonal care, aesthetic landscaping, cultural significance',
    tone: 'Upbeat, inspiring, and focused on natural beauty'
  },
  {
    id: 'silva',
    name: 'Sequoia',
    emoji: '🌲',
    description: 'Practical forest guardian focused on conservation and ecosystem management',
    traits: ['Practical', 'Action-oriented', 'Conservation-minded', 'Protective'],
    expertise: 'Forest management, conservation strategies, ecosystem health, wildlife habitat',
    tone: 'Direct, passionate about conservation, solution-focused'
  },
  {
    id: 'willowmind',
    name: 'Willow',
    emoji: '🌿',
    description: 'Gentle and adaptive AI companion that flows with your learning style',
    traits: ['Adaptive', 'Gentle', 'Flexible', 'Supportive'],
    expertise: 'Personalized learning, emotional support, adaptive guidance, holistic growth',
    tone: 'Warm, encouraging, and intuitively responsive'
  },
  {
    id: 'cypress',
    name: 'Cypress',
    emoji: '🌲',
    description: 'Ancient and enduring spirit with deep knowledge of tree longevity and resilience',
    traits: ['Ancient', 'Resilient', 'Timeless', 'Enduring'],
    expertise: 'Tree longevity, resilience strategies, ancient forestry wisdom, climate adaptation',
    tone: 'Timeless, deeply grounded, speaks of centuries and generations'
  }
];

const STORAGE_KEY = 'arboracle_user_settings';

interface UserSettings {
  aiPersonality: string;
  displayName: string;
  email: string;
  notifications: {
    treeReminders: boolean;
    weeklyDigest: boolean;
    communityUpdates: boolean;
  };
  preferences: {
    theme: string;
    units: string;
    language: string;
  };
}

const defaultSettings: UserSettings = {
  aiPersonality: 'bodhi',
  displayName: 'Tree Enthusiast',
  email: 'user@example.com',
  notifications: {
    treeReminders: true,
    weeklyDigest: true,
    communityUpdates: false
  },
  preferences: {
    theme: 'auto',
    units: 'metric',
    language: 'en'
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast({
        title: "Settings Saved! ✨",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(defaultSettings);
      toast({
        title: "Settings Reset",
        description: "All settings have been restored to defaults.",
      });
    }
  };

  const selectedPersonality = aiPersonalities.find(p => p.id === settings.aiPersonality) || aiPersonalities[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚙️</div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                  <p className="text-gray-600">Customize your Arboracle experience</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleResetSettings}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw size={16} className="mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Save size={16} className="mr-2" />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-8">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot size={16} />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell size={16} />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette size={16} />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* AI Personality Settings */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-600" />
                  AI Personality Selection
                </CardTitle>
                <p className="text-gray-600">
                  Choose your AI companion personality to customize how Arboracle provides guidance and insights.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Selection Display */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{selectedPersonality.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-purple-800">{selectedPersonality.name}</h3>
                      <p className="text-purple-600">{selectedPersonality.description}</p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      <Brain size={14} className="mr-1" />
                      Active
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-2">Personality Traits</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPersonality.traits.map((trait) => (
                          <Badge key={trait} variant="outline" className="border-purple-300 text-purple-700">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-2">Communication Style</h4>
                      <p className="text-sm text-purple-700">{selectedPersonality.tone}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Expertise Areas</h4>
                    <p className="text-sm text-purple-700">{selectedPersonality.expertise}</p>
                  </div>
                </div>

                {/* Personality Selection */}
                <div>
                  <Label className="text-base font-semibold text-gray-800 mb-4 block">
                    Choose Your AI Companion
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiPersonalities.map((personality) => (
                      <Card 
                        key={personality.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          settings.aiPersonality === personality.id 
                            ? 'ring-2 ring-purple-400 bg-purple-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSettings({ ...settings, aiPersonality: personality.id })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl">{personality.emoji}</div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">{personality.name}</h3>
                              {settings.aiPersonality === personality.id && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs mt-1">
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{personality.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {personality.traits.slice(0, 2).map((trait) => (
                              <Badge key={trait} variant="outline" className="text-xs border-gray-300 text-gray-600">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} className="text-green-600" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                    placeholder="Your display name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} className="text-blue-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Tree Care Reminders</Label>
                    <p className="text-sm text-gray-600">Get notified about watering, pruning, and care schedules</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.notifications.treeReminders}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, treeReminders: e.target.checked }
                      })}
                      className="w-4 h-4"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-gray-600">Receive weekly summaries of your tree progress</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.weeklyDigest}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, weeklyDigest: e.target.checked }
                    })}
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Community Updates</Label>
                    <p className="text-sm text-gray-600">Stay informed about community events and updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.communityUpdates}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, communityUpdates: e.target.checked }
                    })}
                    className="w-4 h-4"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette size={20} className="text-orange-600" />
                  Display & Language Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <Select 
                    value={settings.preferences.theme} 
                    onValueChange={(value) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, theme: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Units</Label>
                  <Select 
                    value={settings.preferences.units} 
                    onValueChange={(value) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, units: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (meters, celsius)</SelectItem>
                      <SelectItem value="imperial">Imperial (feet, fahrenheit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Select 
                    value={settings.preferences.language} 
                    onValueChange={(value) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, language: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}