'use client';

import React, { useState } from 'react';
import { Tree } from '@/types/tree';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TreePine, Plus, Map, BarChart3 } from 'lucide-react';

export default function Home() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [aiPersona, setAiPersona] = useState('Bodhi');

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
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <TreePine className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-800">{trees.length}</div>
              <div className="text-sm text-green-600">Total Trees</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">5</div>
              <div className="text-sm text-blue-600">Species</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Map className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">3</div>
              <div className="text-sm text-purple-600">Projects</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-800">95%</div>
              <div className="text-sm text-orange-600">Health Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button className="bg-green-600 hover:bg-green-700">
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

        {/* Revolutionary Features Showcase */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">🌍 Tree Addressing System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-2">Revolutionary Plus Code addressing - each tree gets its own precise address!</p>
              <div className="bg-white p-2 rounded font-mono text-sm">
                Tree Address: 8FW4+VX23456789
              </div>
              <p className="text-xs text-green-600 mt-1">15-character precision down to centimeters</p>
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Placeholder */}
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
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Persona Display */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
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
    </div>
  );
}