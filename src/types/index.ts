export interface Tree {
  id: string;
  species: string;
  lat: number;
  lng: number;
  plus_code_global: string;
  plus_code_local: string;
  date_planted: string;
  notes?: string;
  images: string[];
  created_at: string;
  updated_at: string;
  scientificName?: string;
  commonName?: string;
  taxonomicRank?: string;
  iNaturalistId?: number;
  // Enhanced forestry management fields
  seed_source?: string;
  condition_notes?: string;
  management_actions?: string[];
  nursery_stock_id?: string;
  // Enhanced species data from iNaturalist
  description?: string;
  distribution_info?: string;
  conservation_status?: string;
  photos?: EnhancedPhoto[];
}

export interface User {
  id: string;
  name: string;
}

export interface EnhancedPhoto {
  id: number;
  url: string;
  attribution?: string;
  license?: string;
  size_variants?: {
    square: string;
    small: string;
    medium: string;
    large: string;
  };
}

export interface TreeFormData {
  species: string;
  location: {
    lat: number;
    lng: number;
  };
  date_planted: string;
  notes?: string;
  images: string[];
  scientificName?: string;
  commonName?: string;
  taxonomicRank?: string;
  iNaturalistId?: number;
  // Enhanced forestry management fields
  seed_source?: string;
  condition_notes?: string;
  management_actions?: string[];
  nursery_stock_id?: string;
}

// Export iNaturalist types
export interface iNaturalistObservation {
  id: number;
  species_guess: string;
  taxon?: {
    id: number;
    name: string;
    preferred_common_name?: string;
    rank: string;
    iconic_taxon_name: string;
  };
  location?: string;
  latitude?: number;
  longitude?: number;
  positional_accuracy?: number;
  observed_on?: string;
  time_observed_at?: string;
  photos: iNaturalistPhoto[];
  user: {
    id: number;
    login: string;
    name?: string;
  };
  quality_grade: 'casual' | 'needs_id' | 'research';
  identifications_count: number;
  comments_count: number;
}

export interface iNaturalistPhoto {
  id: number;
  license_code?: string;
  url: string;
  attribution: string;
  original_dimensions?: {
    width: number;
    height: number;
  };
}

export interface iNaturalistSearchParams {
  q?: string;
  taxon_name?: string;
  place_id?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  d1?: string; // date from
  d2?: string; // date to
  per_page?: number;
  page?: number;
  quality_grade?: 'casual' | 'needs_id' | 'research';
}