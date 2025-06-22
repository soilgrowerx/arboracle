import axios from 'axios';
import { iNaturalistObservation, iNaturalistSearchParams } from '@/types';
import { TaxonomicHierarchy } from '@/types/tree';

const INATURALIST_API_BASE = 'https://api.inaturalist.org/v1';

export class iNaturalistService {
  static async searchObservations(params: iNaturalistSearchParams): Promise<iNaturalistObservation[]> {
    try {
      const response = await axios.get(`${INATURALIST_API_BASE}/observations`, {
        params: {
          ...params,
          iconic_taxa: 'Plantae', // Focus on plants for tree identification
          order: 'desc',
          order_by: 'created_at'
        }
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching iNaturalist observations:', error);
      return [];
    }
  }

  static async getObservationById(id: number): Promise<iNaturalistObservation | null> {
    try {
      const response = await axios.get(`${INATURALIST_API_BASE}/observations/${id}`);
      return response.data.results?.[0] || null;
    } catch (error) {
      console.error('Error fetching iNaturalist observation:', error);
      return null;
    }
  }

  static async searchSpecies(query: string, filterTrees: boolean = false): Promise<any[]> {
    try {
      const params: any = {
        q: query,
        rank: 'species,genus',
        iconic_taxa: 'Plantae',
        per_page: 20
      };

      // Add tree-specific filtering
      if (filterTrees) {
        // Common tree-related terms to help filter for trees
        params.taxon_name = query;
        // You can also add ancestry filtering for common tree families
        // This is a basic approach - could be enhanced with a tree taxonomy database
      }

      const response = await axios.get(`${INATURALIST_API_BASE}/taxa`, {
        params
      });

      let results = response.data.results || [];

      // Post-process filtering for trees if requested
      if (filterTrees) {
        results = results.filter((taxon: any) => {
          // Filter based on common tree indicators
          const name = (taxon.name || '').toLowerCase();
          const commonName = (taxon.preferred_common_name || '').toLowerCase();
          
          // Common tree family indicators and characteristics
          const treeIndicators = [
            'tree', 'oak', 'maple', 'pine', 'elm', 'birch', 'cedar', 'fir',
            'spruce', 'poplar', 'willow', 'ash', 'cherry', 'apple', 'walnut',
            'beech', 'hickory', 'basswood', 'linden', 'sycamore', 'magnolia',
            'tulip', 'dogwood', 'redbud', 'catalpa', 'locust', 'cottonwood',
            'juniper', 'hemlock', 'chestnut', 'ginkgo', 'cypress', 'redwood',
            'sequoia', 'eucalyptus', 'palm', 'bamboo', 'acacia', 'alder',
            'aspen', 'balsam', 'basswood', 'buttonwood', 'cork', 'hazel',
            'hawthorn', 'ironwood', 'laurel', 'mahogany', 'mulberry', 'persimmon',
            'plane', 'sweetgum', 'tamarack', 'tupelo', 'yellowwood'
          ];

          // Tree family names (scientific families known to contain trees)
          const treeFamilies = [
            'fagaceae', 'pinaceae', 'cupressaceae', 'rosaceae', 'salicaceae',
            'betulaceae', 'juglandaceae', 'oleaceae', 'aceraceae', 'sapindaceae',
            'magnoliaceae', 'lauraceae', 'moraceae', 'ulmaceae', 'tiliaceae'
          ];

          // Check if it's likely a tree based on name or ancestry
          const hasTreeIndicator = treeIndicators.some(indicator => 
            name.includes(indicator) || commonName.includes(indicator)
          );

          // Check if it belongs to a tree family
          const ancestryString = (taxon.ancestry || '').toLowerCase();
          const hasTreeFamily = treeFamilies.some(family => 
            ancestryString.includes(family) || name.includes(family)
          );

          // Check rank - prefer species and genus level
          const appropriateRank = ['species', 'genus'].includes(taxon.rank?.toLowerCase());

          // Additional filtering - exclude obvious non-trees
          const excludeTerms = ['herb', 'shrub', 'vine', 'fern', 'moss', 'lichen', 'fungus'];
          const isExcluded = excludeTerms.some(term => 
            name.includes(term) || commonName.includes(term)
          );

          return (hasTreeIndicator || hasTreeFamily) && appropriateRank && !isExcluded;
        });
      }

      return results;
    } catch (error) {
      console.error('Error searching species:', error);
      return [];
    }
  }

  static async getNearbyObservations(
    lat: number, 
    lng: number, 
    radius: number = 10
  ): Promise<iNaturalistObservation[]> {
    return this.searchObservations({
      lat,
      lng,
      radius,
      per_page: 50,
      quality_grade: 'research'
    });
  }

  static buildObservationUrl(observation: iNaturalistObservation): string {
    return `https://www.inaturalist.org/observations/${observation.id}`;
  }

  static getPhotoUrl(photo: any, size: 'square' | 'small' | 'medium' | 'large' = 'medium'): string {
    const sizeMap = {
      square: 's',
      small: 'm', 
      medium: 'l',
      large: 'xl'
    };
    
    return photo.url.replace('/square/', `/${sizeMap[size]}/`);
  }

  static async getDetailedTaxonInfo(taxonId: number): Promise<any> {
    try {
      const response = await axios.get(`${INATURALIST_API_BASE}/taxa/${taxonId}`);
      const taxon = response.data.results?.[0];
      
      if (taxon) {
        // Get additional photos for this taxon
        const photosResponse = await axios.get(`${INATURALIST_API_BASE}/taxa/${taxonId}/photos`);
        const photos = photosResponse.data.results || [];
        
        return {
          ...taxon,
          enhanced_photos: photos.map((photo: any) => ({
            id: photo.id,
            url: photo.url,
            attribution: photo.attribution,
            license: photo.license_code,
            size_variants: {
              square: this.getPhotoUrl(photo, 'square'),
              small: this.getPhotoUrl(photo, 'small'),
              medium: this.getPhotoUrl(photo, 'medium'),
              large: this.getPhotoUrl(photo, 'large')
            }
          })),
          description: taxon.wikipedia_summary || taxon.description,
          distribution_info: taxon.establishment_means || 'Unknown',
          conservation_status: taxon.conservation_status?.status_name || 'Not Evaluated'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching detailed taxon info:', error);
      return null;
    }
  }

  static async searchTreeSpecies(query: string): Promise<any[]> {
    return this.searchSpecies(query, true);
  }

  static async searchEcosystemSpecies(query: string): Promise<any[]> {
    return this.searchSpecies(query, false);
  }

  /**
   * Parse full taxonomic hierarchy from iNaturalist taxon data
   */
  static parseTaxonomicHierarchy(taxon: any): TaxonomicHierarchy {
    const taxonomy: TaxonomicHierarchy = {};
    
    if (!taxon) return taxonomy;

    // Set the current taxon's rank and name
    if (taxon.rank && taxon.name) {
      const rank = taxon.rank.toLowerCase();
      const name = taxon.name;
      
      switch (rank) {
        case 'kingdom':
          taxonomy.kingdom = name;
          break;
        case 'phylum':
          taxonomy.phylum = name;
          break;
        case 'class':
          taxonomy.class = name;
          break;
        case 'order':
          taxonomy.order = name;
          break;
        case 'family':
          taxonomy.family = name;
          break;
        case 'genus':
          taxonomy.genus = name;
          break;
        case 'species':
          taxonomy.species = name;
          break;
        case 'subkingdom':
          taxonomy.subkingdom = name;
          break;
        case 'subphylum':
          taxonomy.subphylum = name;
          break;
        case 'subclass':
          taxonomy.subclass = name;
          break;
        case 'suborder':
          taxonomy.suborder = name;
          break;
        case 'subfamily':
          taxonomy.subfamily = name;
          break;
        case 'subgenus':
          taxonomy.subgenus = name;
          break;
        case 'subspecies':
          taxonomy.subspecies = name;
          break;
        case 'variety':
          taxonomy.variety = name;
          break;
        case 'form':
          taxonomy.form = name;
          break;
      }
    }

    // Parse ancestors for complete hierarchy
    if (taxon.ancestors && Array.isArray(taxon.ancestors)) {
      taxon.ancestors.forEach((ancestor: any) => {
        if (ancestor.rank && ancestor.name) {
          const rank = ancestor.rank.toLowerCase();
          const name = ancestor.name;
          
          switch (rank) {
            case 'kingdom':
              taxonomy.kingdom = name;
              break;
            case 'phylum':
              taxonomy.phylum = name;
              break;
            case 'class':
              taxonomy.class = name;
              break;
            case 'order':
              taxonomy.order = name;
              break;
            case 'family':
              taxonomy.family = name;
              break;
            case 'genus':
              taxonomy.genus = name;
              break;
            case 'species':
              taxonomy.species = name;
              break;
            case 'subkingdom':
              taxonomy.subkingdom = name;
              break;
            case 'subphylum':
              taxonomy.subphylum = name;
              break;
            case 'subclass':
              taxonomy.subclass = name;
              break;
            case 'suborder':
              taxonomy.suborder = name;
              break;
            case 'subfamily':
              taxonomy.subfamily = name;
              break;
            case 'subgenus':
              taxonomy.subgenus = name;
              break;
          }
        }
      });
    }

    return taxonomy;
  }

  /**
   * Get detailed taxon information including full taxonomic hierarchy
   */
  static async getDetailedTaxonWithHierarchy(taxonId: number): Promise<any> {
    try {
      const response = await axios.get(`${INATURALIST_API_BASE}/taxa/${taxonId}`);
      const taxon = response.data.results?.[0];
      
      if (taxon) {
        // Get additional photos for this taxon
        const photosResponse = await axios.get(`${INATURALIST_API_BASE}/taxa/${taxonId}/photos`);
        const photos = photosResponse.data.results || [];
        
        return {
          ...taxon,
          taxonomy: this.parseTaxonomicHierarchy(taxon),
          enhanced_photos: photos.map((photo: any) => ({
            id: photo.id,
            url: photo.url,
            attribution: photo.attribution,
            license: photo.license_code,
            size_variants: {
              square: this.getPhotoUrl(photo, 'square'),
              small: this.getPhotoUrl(photo, 'small'),
              medium: this.getPhotoUrl(photo, 'medium'),
              large: this.getPhotoUrl(photo, 'large')
            }
          })),
          description: taxon.wikipedia_summary || taxon.description,
          distribution_info: taxon.establishment_means || 'Unknown',
          conservation_status: taxon.conservation_status?.status_name || 'Not Evaluated'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching detailed taxon info with hierarchy:', error);
      return null;
    }
  }
}