import { EcosystemSpecies, EcosystemSpeciesFormData, Tree } from '@/types';
import { TreeService } from './treeService';
import { iNaturalistService } from './inaturalistService';
import { v4 as uuidv4 } from 'uuid';

const ECOSYSTEM_STORAGE_KEY = 'arboracle_ecosystem_species';

export class EcosystemService {
  /**
   * Get all ecosystem species from localStorage
   */
  static getAllEcosystemSpecies(): EcosystemSpecies[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(ECOSYSTEM_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading ecosystem species from localStorage:', error);
      return [];
    }
  }

  /**
   * Save ecosystem species to localStorage
   */
  static saveEcosystemSpecies(species: EcosystemSpecies[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(ECOSYSTEM_STORAGE_KEY, JSON.stringify(species));
    } catch (error) {
      console.error('Error saving ecosystem species to localStorage:', error);
    }
  }

  /**
   * Get ecosystem species for a specific tree
   */
  static getEcosystemSpeciesForTree(treeId: string): EcosystemSpecies[] {
    return this.getAllEcosystemSpecies().filter(species => species.treeId === treeId);
  }

  /**
   * Add new ecosystem species to a tree
   */
  static addEcosystemSpecies(treeId: string, formData: EcosystemSpeciesFormData): EcosystemSpecies {
    const allSpecies = this.getAllEcosystemSpecies();
    
    const newSpecies: EcosystemSpecies = {
      id: uuidv4(),
      treeId,
      speciesName: formData.speciesName,
      scientificName: formData.scientificName,
      category: formData.category,
      relationship: formData.relationship,
      observationDate: formData.observationDate,
      notes: formData.notes,
      iNaturalistId: formData.iNaturalistId,
      isVerified: formData.isVerified || !!formData.iNaturalistId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    allSpecies.push(newSpecies);
    this.saveEcosystemSpecies(allSpecies);
    
    // Update the tree's ecosystem species array
    this.updateTreeEcosystemSpecies(treeId);
    
    return newSpecies;
  }

  /**
   * Update existing ecosystem species
   */
  static updateEcosystemSpecies(speciesId: string, updates: Partial<EcosystemSpeciesFormData>): EcosystemSpecies | null {
    const allSpecies = this.getAllEcosystemSpecies();
    const index = allSpecies.findIndex(species => species.id === speciesId);
    
    if (index === -1) return null;

    const updatedSpecies = {
      ...allSpecies[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    allSpecies[index] = updatedSpecies;
    this.saveEcosystemSpecies(allSpecies);
    
    // Update the tree's ecosystem species array
    this.updateTreeEcosystemSpecies(updatedSpecies.treeId);
    
    return updatedSpecies;
  }

  /**
   * Delete ecosystem species
   */
  static deleteEcosystemSpecies(speciesId: string): boolean {
    const allSpecies = this.getAllEcosystemSpecies();
    const species = allSpecies.find(s => s.id === speciesId);
    
    if (!species) return false;
    
    const filteredSpecies = allSpecies.filter(s => s.id !== speciesId);
    this.saveEcosystemSpecies(filteredSpecies);
    
    // Update the tree's ecosystem species array
    this.updateTreeEcosystemSpecies(species.treeId);
    
    return true;
  }

  /**
   * Update tree's ecosystem species array in tree data
   */
  private static updateTreeEcosystemSpecies(treeId: string): void {
    const trees = TreeService.getAllTrees();
    const treeIndex = trees.findIndex(tree => tree.id === treeId);
    
    if (treeIndex === -1) return;

    const ecosystemSpecies = this.getEcosystemSpeciesForTree(treeId);
    
    // Update the tree with current ecosystem species
    trees[treeIndex] = {
      ...trees[treeIndex],
      ecosystemSpecies,
      updated_at: new Date().toISOString()
    };
    
    TreeService.saveTrees(trees);
  }

  /**
   * Search ecosystem species using iNaturalist API (unfiltered for ecosystem species)
   */
  static async searchEcosystemSpecies(query: string): Promise<any[]> {
    return iNaturalistService.searchEcosystemSpecies(query);
  }

  /**
   * Get ecosystem species statistics for a tree
   */
  static getEcosystemStatistics(treeId: string): {
    totalSpecies: number;
    categoryCounts: Record<string, number>;
    relationshipCounts: Record<string, number>;
    verifiedCount: number;
  } {
    const species = this.getEcosystemSpeciesForTree(treeId);
    
    const categoryCounts: Record<string, number> = {};
    const relationshipCounts: Record<string, number> = {};
    let verifiedCount = 0;

    species.forEach(s => {
      // Count categories
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
      
      // Count relationships
      relationshipCounts[s.relationship] = (relationshipCounts[s.relationship] || 0) + 1;
      
      // Count verified
      if (s.isVerified) verifiedCount++;
    });

    return {
      totalSpecies: species.length,
      categoryCounts,
      relationshipCounts,
      verifiedCount
    };
  }

  /**
   * Get all ecosystem species with search functionality
   */
  static searchEcosystemSpeciesLocal(query: string): EcosystemSpecies[] {
    const allSpecies = this.getAllEcosystemSpecies();
    const lowercaseQuery = query.toLowerCase();
    
    return allSpecies.filter(species => 
      species.speciesName.toLowerCase().includes(lowercaseQuery) ||
      (species.scientificName && species.scientificName.toLowerCase().includes(lowercaseQuery)) ||
      (species.notes && species.notes.toLowerCase().includes(lowercaseQuery)) ||
      species.category.toLowerCase().includes(lowercaseQuery) ||
      species.relationship.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get ecosystem species grouped by category for a tree
   */
  static getEcosystemSpeciesByCategory(treeId: string): Record<string, EcosystemSpecies[]> {
    const species = this.getEcosystemSpeciesForTree(treeId);
    const grouped: Record<string, EcosystemSpecies[]> = {};

    species.forEach(s => {
      if (!grouped[s.category]) {
        grouped[s.category] = [];
      }
      grouped[s.category].push(s);
    });

    return grouped;
  }

  /**
   * Get ecosystem species count for a tree (for display purposes)
   */
  static getEcosystemSpeciesCount(treeId: string): number {
    return this.getEcosystemSpeciesForTree(treeId).length;
  }

  /**
   * Enrich ecosystem species with iNaturalist data
   */
  static async enrichSpeciesWithiNaturalistData(speciesId: string): Promise<EcosystemSpecies | null> {
    const allSpecies = this.getAllEcosystemSpecies();
    const species = allSpecies.find(s => s.id === speciesId);
    
    if (!species || !species.iNaturalistId) return species || null;

    try {
      const detailedInfo = await iNaturalistService.getDetailedTaxonInfo(species.iNaturalistId);
      if (detailedInfo) {
        const enrichedSpecies = {
          ...species,
          photos: detailedInfo.enhanced_photos,
          updated_at: new Date().toISOString()
        };

        // Update in storage
        const index = allSpecies.findIndex(s => s.id === speciesId);
        if (index !== -1) {
          allSpecies[index] = enrichedSpecies;
          this.saveEcosystemSpecies(allSpecies);
        }

        return enrichedSpecies;
      }
    } catch (error) {
      console.error('Error enriching ecosystem species with iNaturalist data:', error);
    }
    
    return species;
  }

  /**
   * Get category display information with emojis and colors
   */
  static getCategoryDisplayInfo(category: string): { emoji: string; color: string; label: string } {
    const categoryMap: Record<string, { emoji: string; color: string; label: string }> = {
      plant: { emoji: '🌿', color: 'text-green-600', label: 'Plants' },
      fungus: { emoji: '🍄', color: 'text-orange-600', label: 'Fungi' },
      animal: { emoji: '🐾', color: 'text-blue-600', label: 'Animals' },
      insect: { emoji: '🐛', color: 'text-yellow-600', label: 'Insects' },
      bird: { emoji: '🐦', color: 'text-sky-600', label: 'Birds' },
      microorganism: { emoji: '🦠', color: 'text-purple-600', label: 'Microorganisms' },
      other: { emoji: '🔬', color: 'text-gray-600', label: 'Other' }
    };

    return categoryMap[category] || categoryMap.other;
  }

  /**
   * Get relationship display information with emojis and colors
   */
  static getRelationshipDisplayInfo(relationship: string): { emoji: string; color: string; label: string } {
    const relationshipMap: Record<string, { emoji: string; color: string; label: string }> = {
      symbiotic: { emoji: '🤝', color: 'text-green-600', label: 'Symbiotic' },
      parasitic: { emoji: '🩸', color: 'text-red-600', label: 'Parasitic' },
      commensal: { emoji: '🏠', color: 'text-blue-600', label: 'Commensal' },
      predatory: { emoji: '🦈', color: 'text-red-700', label: 'Predatory' },
      pollinator: { emoji: '🌺', color: 'text-pink-600', label: 'Pollinator' },
      seed_disperser: { emoji: '🌱', color: 'text-green-700', label: 'Seed Disperser' },
      epiphytic: { emoji: '🌿', color: 'text-emerald-600', label: 'Epiphytic' },
      competitive: { emoji: '⚔️', color: 'text-orange-600', label: 'Competitive' },
      neutral: { emoji: '⚪', color: 'text-gray-500', label: 'Neutral' },
      beneficial: { emoji: '✨', color: 'text-emerald-500', label: 'Beneficial' },
      detrimental: { emoji: '⚠️', color: 'text-amber-600', label: 'Detrimental' }
    };

    return relationshipMap[relationship] || relationshipMap.neutral;
  }
}