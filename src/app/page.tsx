'use client';

import React, { useState, useEffect } from 'react';
import { Tree } from '@/types/tree';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddTreeModal } from '@/components/AddTreeModal';
import { MySitesSection } from '@/components/MySitesSection';
import { TreePine, Plus, Map, BarChart3, Leaf, TrendingUp, AlertTriangle, CheckCircle, PieChart, Activity, User, Calendar, MapPin } from 'lucide-react';

export default function Home() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [aiPersona, setAiPersona] = useState('Bodhi');
  const [isAddTreeModalOpen, setIsAddTreeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isClient, setIsClient] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mock data for demonstration
  const mockTrees: Tree[] = [
    {
      id: '1',
      species: 'Oak',
      commonName: 'White Oak',
      scientificName: 'Quercus alba',
      lat: 40.7128,
      lng: -74.0060,
      plus_code_global: '87G8Q23M+FG',
      plus_code_local: 'Q23M+FG',
      plus_code_precise: '87G8Q23M+FG2H',
      tree_address: 'Tree Address: 87G8+Q23M+FG2H',
      soil_responsibility_area: 9.8,
      date_planted: '2020-04-15',
      height_cm: 800,
      dbh_cm: 45,
      condition_assessment: {
        structure: [],
        canopy_health: [],
        pests_diseases: [],
        site_conditions: [],
        arborist_summary: '',
        health_status: 'Good',
        notes: {}
      },
      images: [],
      verification_status: 'verified',
      created_at: '2020-04-15T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }
  ];

  const displayTrees = trees.length > 0 ? trees : mockTrees;

  // Tree Statistics Component (inline)
  const TreeStatistics = () => {
    const totalTrees = displayTrees.length;
    const speciesCount = new Set(displayTrees.map(tree => tree.species)).size;
    const verifiedTrees = displayTrees.filter(tree => tree.verification_status === 'verified').length;
    const healthyTrees = displayTrees.filter(tree => 
      tree.condition_assessment?.health_status === 'Excellent' || 
      tree.condition_assessment?.health_status === 'Good'
    ).length;

    const stats = [
      { title: 'Total Trees', value: totalTrees, icon: TreePine, color: 'text-green-600', bgColor: 'bg-green-50' },
      { title: 'Species Diversity', value: speciesCount, icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      { title: 'Verified Trees', value: verifiedTrees, icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      { title: 'Healthy Trees', value: healthyTrees, icon: Leaf, color: 'text-green-600', bgColor: 'bg-green-50' }
    ];

    return (
      <Card className="dashboard-card-enhanced">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <TreePine className="h-5 w-5" />
            Tree Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`p-4 rounded-lg ${stat.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
          {totalTrees > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Health Status</span>
                <Badge variant="outline" className="text-green-600">
                  {Math.round((healthyTrees / totalTrees) * 100)}% Healthy
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Forest Health Score Component (inline)
  const ForestHealthScore = () => {
    const calculateHealthScore = () => {
      if (displayTrees.length === 0) return 85; // Default demo score
      
      const healthValues = { 'Excellent': 100, 'Good': 80, 'Fair': 60, 'Poor': 40, 'Dead': 0 };
      const totalScore = displayTrees.reduce((sum, tree) => {
        const status = tree.condition_assessment?.health_status || 'Good';
        return sum + (healthValues[status] || 80);
      }, 0);
      
      return Math.round(totalScore / displayTrees.length);
    };

    const healthScore = calculateHealthScore();
    const getScoreColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
    const getScoreIcon = (score: number) => score >= 80 ? CheckCircle : score >= 60 ? TrendingUp : AlertTriangle;
    const ScoreIcon = getScoreIcon(healthScore);

    return (
      <Card className="dashboard-card-enhanced">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Forest Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(healthScore)} flex items-center justify-center gap-2`}>
              <ScoreIcon className="h-8 w-8" />
              {healthScore}
            </div>
            <p className="text-sm text-gray-600 mt-1">Overall Health Score</p>
          </div>
          
          <Progress value={healthScore} className="h-3" />
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-semibold text-green-700">{displayTrees.length}</div>
              <div className="text-green-600">Total Trees</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-semibold text-blue-700">
                {displayTrees.filter(t => t.condition_assessment?.health_status === 'Excellent' || t.condition_assessment?.health_status === 'Good').length}
              </div>
              <div className="text-blue-600">Healthy Trees</div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">AI Persona:</span>
              <Badge variant="outline" className="text-green-600">{aiPersona}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Analytics Dashboard Component (inline)
  const AnalyticsDashboard = () => {
    const speciesData = displayTrees.reduce((acc, tree) => {
      acc[tree.species] = (acc[tree.species] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSpecies = Object.entries(speciesData).sort(([,a], [,b]) => b - a).slice(0, 5);

    return (
      <Card className="dashboard-card-enhanced">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Species Distribution
            </h4>
            <div className="space-y-2">
              {topSpecies.map(([species, count]) => (
                <div key={species} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{species}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(count / displayTrees.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Diversity Index:</span>
              <Badge variant="outline" className="text-blue-600">
                {Object.keys(speciesData).length} species
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2 flex items-center justify-center gap-3">
            <TreePine className="h-10 w-10" />
            Arboracle
          </h1>
          <p className="text-xl text-green-600">
            Revolutionary Climate AI Platform for Tree Management
          </p>
          <div className="mt-4">
            <Badge className="bg-green-600 text-white">
              🌍 Tree Addressing • 🏗️ Construction Monitoring • 📊 Project Management
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button 
            onClick={() => setIsAddTreeModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tree
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowMap(!showMap)}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Map className="h-4 w-4 mr-2" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trees">Trees</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Dashboard */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <TreeStatistics />
              </div>
              <div className="lg:col-span-1">
                <ForestHealthScore />
              </div>
            </div>

            {/* Revolutionary Features Showcase */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">🌍 Tree Addressing System</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 mb-2">Revolutionary Plus Code addressing - each tree gets its own precise address!</p>
                  <div className="bg-white p-2 rounded font-mono text-sm">
                    Tree Address: 87G8+Q23M+FG2H
                  </div>
                  <p className="text-xs text-green-600 mt-1">15-character precision down to centimeters</p>
                  <div className="mt-2 text-sm text-green-600">
                    Soil Area: 9.8 m²
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">🏗️ Construction Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700 mb-2">Professional TPZ/CRZ compliance tools for construction sites</p>
                  <div className="space-y-1 text-sm">
                    <div>✅ TPZ Fencing Status</div>
                    <div>✅ Root Zone Impact Assessment</div>
                    <div>✅ Professional PDF Reports</div>
                    <div>✅ ISA Standard Compliance</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">📊 Project Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-700 mb-2">Enterprise-grade project organization and tracking</p>
                  <div className="space-y-1 text-sm">
                    <div>✅ Multi-project organization</div>
                    <div>✅ Assessment history tracking</div>
                    <div>✅ Client management</div>
                    <div>✅ Progress reporting</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map View */}
            {showMap && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-green-800">Interactive Tree Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Interactive Map View</h3>
                      <p className="text-green-600">Enhanced mapping with tree locations and Plus Code addresses</p>
                      <p className="text-sm text-gray-500 mt-2">Add Google Maps API key to enable full functionality</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">Tree Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TreePine className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Tree Management</h3>
                  <p className="text-green-600 mb-4">Professional tree inventory with enhanced Plus Code addressing</p>
                  <Button onClick={() => setIsAddTreeModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Tree
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <MySitesSection />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>

        {/* AI Persona Display */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">
              AI Persona: {aiPersona}
            </h3>
            <p className="text-emerald-600">
              Your nature-aligned AI guide for professional tree management
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Tree Modal */}
      {isAddTreeModalOpen && (
        <AddTreeModal
          onClose={() => setIsAddTreeModalOpen(false)}
          onSubmit={(tree) => {
            setTrees([...trees, tree]);
            setIsAddTreeModalOpen(false);
          }}
        />
      )}
    </div>
  );
}