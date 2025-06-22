import { Tree, TreeFormData } from '@/types';
import { PlusCodeService } from './plusCodeService';
import { iNaturalistService } from './inaturalistService';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'arboracle_trees';

export class TreeService {
  static getAllTrees(): Tree[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const trees = data ? JSON.parse(data) : [];
      
      // Migrate trees that have coordinates instead of Plus Codes
      const migratedTrees = trees.map((tree: any) => {
        let migratedTree = { ...tree };
        
        // Check if plus_code_local contains coordinates (has comma)
        if (tree.plus_code_local && tree.plus_code_local.includes(',')) {
          const plusCodes = PlusCodeService.encode(tree.lat, tree.lng);
          migratedTree.plus_code_global = plusCodes.global;
          migratedTree.plus_code_local = plusCodes.local;
        }
        // Check if plus_code_local is missing or empty, or needs precision upgrade
        if (!tree.plus_code_local || !tree.plus_code_global || 
            (tree.plus_code_global && tree.plus_code_global.length < 12)) {
          const plusCodes = PlusCodeService.encode(tree.lat, tree.lng);
          migratedTree.plus_code_global = plusCodes.global;
          migratedTree.plus_code_local = plusCodes.local;
        }
        
        // Migrate to new required fields
        if (!tree.verification_status) {
          migratedTree.verification_status = tree.iNaturalistId ? 'verified' : 'pending';
        }
        
        // Ensure management_actions is an array
        if (!Array.isArray(tree.management_actions)) {
          migratedTree.management_actions = [];
        }
        
        // Ensure ecosystemSpecies is an array
        if (!Array.isArray(tree.ecosystemSpecies)) {
          migratedTree.ecosystemSpecies = [];
        }
        
        return migratedTree as Tree;
      });
      
      // Save migrated trees back to localStorage
      if (JSON.stringify(trees) !== JSON.stringify(migratedTrees)) {
        this.saveTrees(migratedTrees);
      }
      
      return migratedTrees;
    } catch (error) {
      console.error('Error loading trees from localStorage:', error);
      return [];
    }
  }

  static getTreeById(id: string): Tree | undefined {
    const trees = this.getAllTrees();
    return trees.find(tree => tree.id === id);
  }

  static saveTrees(trees: Tree[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
    } catch (error) {
      console.error('Error saving trees to localStorage:', error);
    }
  }

  static addTree(formData: TreeFormData): Tree {
    const trees = this.getAllTrees();
    const plusCodes = PlusCodeService.encode(formData.location.lat, formData.location.lng);
    
    const newTree: Tree = {
      id: uuidv4(),
      species: formData.species,
      lat: formData.location.lat,
      lng: formData.location.lng,
      plus_code_global: plusCodes.global,
      plus_code_local: plusCodes.local,
      date_planted: formData.date_planted,
      notes: formData.notes,
      images: formData.images,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      scientificName: formData.scientificName,
      commonName: formData.commonName,
      taxonomicRank: formData.taxonomicRank,
      iNaturalistId: formData.iNaturalistId,
      // Enhanced forestry management fields
      seed_source: formData.seed_source,
      nursery_stock_id: formData.nursery_stock_id,
      condition_notes: formData.condition_notes,
      management_actions: formData.management_actions || [],
      iNaturalist_link: formData.iNaturalist_link,
      verification_status: formData.verification_status || (formData.iNaturalistId ? 'verified' : 'pending')
    };

    trees.push(newTree);
    this.saveTrees(trees);
    
    return newTree;
  }

  static updateTree(id: string, updates: Partial<TreeFormData>): Tree | null {
    const trees = this.getAllTrees();
    const index = trees.findIndex(tree => tree.id === id);
    
    if (index === -1) return null;

    const updatedTree = {
      ...trees[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.location) {
      const plusCodes = PlusCodeService.encode(updates.location.lat, updates.location.lng);
      updatedTree.lat = updates.location.lat;
      updatedTree.lng = updates.location.lng;
      updatedTree.plus_code_global = plusCodes.global;
      updatedTree.plus_code_local = plusCodes.local;
    }

    trees[index] = updatedTree;
    this.saveTrees(trees);
    
    return updatedTree;
  }

  static deleteTree(id: string): boolean {
    const trees = this.getAllTrees();
    const filteredTrees = trees.filter(tree => tree.id !== id);
    
    if (filteredTrees.length === trees.length) return false;
    
    this.saveTrees(filteredTrees);
    return true;
  }

  static getTreesCount(): number {
    return this.getAllTrees().length;
  }

  static getRecentTrees(limit: number = 5): Tree[] {
    const trees = this.getAllTrees();
    return trees
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  static searchTrees(query: string): Tree[] {
    const trees = this.getAllTrees();
    const lowercaseQuery = query.toLowerCase();
    
    return trees.filter(tree => 
      tree.species.toLowerCase().includes(lowercaseQuery) ||
      (tree.notes && tree.notes.toLowerCase().includes(lowercaseQuery)) ||
      (tree.scientificName && tree.scientificName.toLowerCase().includes(lowercaseQuery)) ||
      (tree.commonName && tree.commonName.toLowerCase().includes(lowercaseQuery)) ||
      (tree.seed_source && tree.seed_source.toLowerCase().includes(lowercaseQuery)) ||
      (tree.condition_notes && tree.condition_notes.toLowerCase().includes(lowercaseQuery)) ||
      (tree.nursery_stock_id && tree.nursery_stock_id.toLowerCase().includes(lowercaseQuery)) ||
      (tree.management_actions && tree.management_actions.some(action => 
        action.toLowerCase().includes(lowercaseQuery)
      )) ||
      tree.verification_status.toLowerCase().includes(lowercaseQuery) ||
      tree.plus_code_global.includes(query.toUpperCase()) ||
      tree.plus_code_local.includes(query.toUpperCase())
    );
  }

  static async enrichTreeWithSpeciesData(tree: Tree): Promise<Tree> {
    if (!tree.iNaturalistId) return tree;

    try {
      const detailedInfo = await iNaturalistService.getDetailedTaxonInfo(tree.iNaturalistId);
      if (detailedInfo) {
        return {
          ...tree,
          description: detailedInfo.description,
          distribution_info: detailedInfo.distribution_info,
          conservation_status: detailedInfo.conservation_status,
          photos: detailedInfo.enhanced_photos,
          updated_at: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error enriching tree with species data:', error);
    }
    
    return tree;
  }

  static async enrichAllTreesWithSpeciesData(): Promise<Tree[]> {
    const trees = this.getAllTrees();
    const enrichedTrees = await Promise.all(
      trees.map(tree => this.enrichTreeWithSpeciesData(tree))
    );
    
    this.saveTrees(enrichedTrees);
    return enrichedTrees;
  }

  static updateTreeEcosystemSpecies(treeId: string, ecosystemSpecies: any[]): Tree | null {
    const trees = this.getAllTrees();
    const index = trees.findIndex(tree => tree.id === treeId);
    
    if (index === -1) return null;

    const updatedTree = {
      ...trees[index],
      ecosystemSpecies,
      updated_at: new Date().toISOString()
    };

    trees[index] = updatedTree;
    this.saveTrees(trees);
    
    return updatedTree;
  }
}