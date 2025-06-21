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