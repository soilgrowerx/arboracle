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

  static async searchSpecies(query: string): Promise<any[]> {
    try {
      const response = await axios.get(`${INATURALIST_API_BASE}/taxa`, {
        params: {
          q: query,
          rank: 'species,genus',
          iconic_taxa: 'Plantae',
          per_page: 20
        }
      });

      return response.data.results || [];
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

  static async searchTreeSpecies(query: string): Promise<any[]> {
    try {
      const response = await axios.get(`${INATURALIST_API_BASE}/taxa`, {
        params: {
          q: query,
          rank: 'species',
          iconic_taxa: 'Plantae',
          per_page: 20
        }
      });

      // Filter results to only return taxa where iconic_taxon_name === "Plantae" AND rank === "species"
      const results = response.data.results || [];
      return results.filter((taxon: any) => 
        taxon.iconic_taxon_name === 'Plantae' && 
        taxon.rank === 'species'
      );
    } catch (error) {
      console.error('Error searching tree species:', error);
      return [];
    }
  }
}