'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tree } from '@/types';
import { TreeService } from '@/services/treeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, MapPin, Calendar, Shield, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadTrees = useCallback(() => {
    try {
      const allTrees = TreeService.getAllTrees();
      setTrees(allTrees);
    } catch (error) {
      console.error('Error loading trees:', error);
      toast({
        title: "Error",
        description: "Failed to load trees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTrees();
  }, [loadTrees]);

  const handleDeleteTree = (treeId: string, species: string) => {
    if (confirm(`Are you sure you want to delete the ${species} tree? This action cannot be undone.`)) {
      try {
        const success = TreeService.deleteTree(treeId);
        if (success) {
          setTrees(trees.filter(tree => tree.id !== treeId));
          toast({
            title: "Tree Deleted",
            description: `${species} has been removed from the system.`,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete tree",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error deleting tree:', error);
        toast({
          title: "Error",
          description: "Failed to delete tree",
          variant: "destructive"
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'manual':
        return <Shield size={16} className="text-blue-600" />;
      case 'pending':
        return <Clock size={16} className="text-amber-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-green-700">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
              <ArrowLeft size={16} className="mr-2" />
              Back to Main
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-green-800 mb-2">🛠️ Admin Panel</h1>
        <p className="text-green-600">Manage all trees in the Arboracle system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🌳</span>
            Tree Management ({trees.length} trees)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No trees found in the system.
            </div>
          ) : (
            <div className="space-y-4">
              {trees.map((tree) => (
                <div
                  key={tree.id}
                  className="flex items-center justify-between p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-green-800">
                        {tree.commonName || tree.species}
                      </h3>
                      {getVerificationIcon(tree.verification_status)}
                      <span className="text-sm text-green-600 capitalize">
                        {tree.verification_status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{tree.lat.toFixed(4)}, {tree.lng.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Added {formatDate(tree.created_at)}</span>
                      </div>
                      {tree.date_planted && (
                        <div className="flex items-center gap-1">
                          <span>🌱</span>
                          <span>Planted {formatDate(tree.date_planted)}</span>
                        </div>
                      )}
                    </div>
                    
                    {tree.scientificName && (
                      <div className="text-sm italic text-green-700 mt-1">
                        {tree.scientificName}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTree(tree.id, tree.commonName || tree.species)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}