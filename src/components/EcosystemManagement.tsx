'use client';

import React, { useState } from 'react';
import { Tree, EcosystemSpecies, EcosystemCategory, EcosystemRelationship } from '@/types/tree';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { EcosystemService } from '@/services/ecosystemService';
import { useToast } from '@/components/ui/use-toast';

interface EcosystemManagementProps {
  treeId: string;
  initialEcosystemSpecies?: EcosystemSpecies[];
  onUpdateEcosystemSpecies: (species: EcosystemSpecies[]) => void;
}

export const EcosystemManagement: React.FC<EcosystemManagementProps> = ({
  treeId,
  initialEcosystemSpecies = [],
  onUpdateEcosystemSpecies,
}) => {
  const { toast } = useToast();
  const [ecosystemSpecies, setEcosystemSpecies] = useState<EcosystemSpecies[]>(initialEcosystemSpecies);
  const [newSpeciesName, setNewSpeciesName] = useState('');
  const [newScientificName, setNewScientificName] = useState('');
  const [newCategory, setNewCategory] = useState<EcosystemCategory | ''>('');
  const [newRelationship, setNewRelationship] = useState<EcosystemRelationship | ''>('');
  const [newObservationDate, setNewObservationDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');

  const handleAddSpecies = () => {
    if (newSpeciesName && newCategory && newRelationship) {
      const newSpecies: EcosystemSpecies = {
        id: `eco-${Date.now()}`,
        treeId,
        speciesName: newSpeciesName,
        scientificName: newScientificName || undefined,
        category: newCategory as EcosystemCategory,
        relationship: newRelationship as EcosystemRelationship,
        observationDate: newObservationDate,
        notes: newNotes || undefined,
        isVerified: false, // Default to false, can be changed later
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedSpecies = [...ecosystemSpecies, newSpecies];
      setEcosystemSpecies(updatedSpecies);
      onUpdateEcosystemSpecies(updatedSpecies);
      EcosystemService.addEcosystemSpecies(newSpecies); // Persist to service
      toast({
        title: "Ecosystem Species Added",
        description: `${newSpeciesName} has been added to the ecosystem.`,
      });
      // Clear form
      setNewSpeciesName('');
      setNewScientificName('');
      setNewCategory('');
      setNewRelationship('');
      setNewObservationDate(new Date().toISOString().split('T')[0]);
      setNewNotes('');
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for the new ecosystem species.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSpecies = (id: string) => {
    const updatedSpecies = ecosystemSpecies.filter(s => s.id !== id);
    setEcosystemSpecies(updatedSpecies);
    onUpdateEcosystemSpecies(updatedSpecies);
    EcosystemService.deleteEcosystemSpecies(id); // Persist to service
    toast({
      title: "Ecosystem Species Removed",
      description: "The ecosystem species has been removed.",
    });
  };

  const categories: EcosystemCategory[] = [
    'plant', 'fungus', 'animal', 'insect', 'bird', 'microorganism', 'other'
  ];

  const relationships: EcosystemRelationship[] = [
    'symbiotic', 'parasitic', 'commensal', 'predatory', 'pollinator', 
    'seed_disperser', 'epiphytic', 'competitive', 'neutral', 'beneficial', 'detrimental'
  ];

  return (
    <div className="space-y-6 p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-xl font-semibold text-green-800">Ecosystem Management</h3>

      {/* Add New Ecosystem Species Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 mb-4">
        <div className="col-span-full">
          <h4 className="text-lg font-medium text-green-700 mb-2">Add New Associated Species</h4>
        </div>
        <div>
          <Label htmlFor="newSpeciesName">Species Name</Label>
          <Input id="newSpeciesName" value={newSpeciesName} onChange={(e) => setNewSpeciesName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="newScientificName">Scientific Name (Optional)</Label>
          <Input id="newScientificName" value={newScientificName} onChange={(e) => setNewScientificName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="newCategory">Category</Label>
          <Select value={newCategory} onValueChange={(value: EcosystemCategory) => setNewCategory(value)}>
            <SelectTrigger id="newCategory">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="newRelationship">Relationship</Label>
          <Select value={newRelationship} onValueChange={(value: EcosystemRelationship) => setNewRelationship(value)}>
            <SelectTrigger id="newRelationship">
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              {relationships.map(rel => (
                <SelectItem key={rel} value={rel}>{rel.charAt(0).toUpperCase() + rel.slice(1).replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="newObservationDate">Observation Date</Label>
          <Input id="newObservationDate" type="date" value={newObservationDate} onChange={(e) => setNewObservationDate(e.target.value)} />
        </div>
        <div className="col-span-full">
          <Label htmlFor="newNotes">Notes (Optional)</Label>
          <Textarea id="newNotes" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
        </div>
        <div className="col-span-full flex justify-end">
          <Button onClick={handleAddSpecies} className="flex items-center gap-2">
            <PlusCircle size={18} /> Add Species
          </Button>
        </div>
      </div>

      {/* List of Associated Ecosystem Species */}
      <div>
        <h4 className="text-lg font-medium text-green-700 mb-2">Current Associated Species</h4>
        {ecosystemSpecies.length === 0 ? (
          <p className="text-gray-500">No associated ecosystem species yet.</p>
        ) : (
          <div className="space-y-3">
            {ecosystemSpecies.map(species => (
              <div key={species.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                <div>
                  <p className="font-medium">{species.speciesName} ({species.scientificName || 'N/A'})</p>
                  <p className="text-sm text-gray-600">Category: {species.category}, Relationship: {species.relationship}</p>
                  {species.notes && <p className="text-xs text-gray-500">Notes: {species.notes}</p>}
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteSpecies(species.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EcosystemManagement;
