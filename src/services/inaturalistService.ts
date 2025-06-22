import axios from 'axios';
import { iNaturalistObservation, iNaturalistSearchParams } from '@/types';

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
          
          // Common tree family indicators
          const treeIndicators = [
            'tree', 'oak', 'maple', 'pine', 'elm', 'birch', 'cedar', 'fir',
            'spruce', 'poplar', 'willow', 'ash', 'cherry', 'apple', 'walnut',
            'beech', 'hickory', 'basswood', 'linden', 'sycamore', 'magnolia',
            'tulip', 'dogwood', 'redbud', 'catalpa', 'locust', 'cottonwood'
          ];

          // Check if it's likely a tree based on name or ancestry
          const hasTreeIndicator = treeIndicators.some(indicator => 
            name.includes(indicator) || commonName.includes(indicator)
          );

          // Check rank - prefer species and genus level
          const appropriateRank = ['species', 'genus'].includes(taxon.rank?.toLowerCase());

          return hasTreeIndicator && appropriateRank;
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
}