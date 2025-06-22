export interface TaxonomicHierarchy {
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  // Additional taxonomic levels for completeness
  subkingdom?: string;
  subphylum?: string;
  subclass?: string;
  suborder?: string;
  subfamily?: string;
  subgenus?: string;
  subspecies?: string;
  variety?: string;
  form?: string;
}

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
  // Full taxonomic hierarchy for scientific rigor
  taxonomy?: TaxonomicHierarchy;
  // Enhanced forestry management fields
  seed_source?: string;
  nursery_stock_id?: string;
  condition_notes?: string;
  management_actions?: string[];
  iNaturalist_link?: string;
  verification_status: 'verified' | 'manual' | 'pending';
  // Enhanced species data from iNaturalist
  description?: string;
  distribution_info?: string;
  conservation_status?: string;
  photos?: EnhancedPhoto[];
  // Tree Ecosystem Management
  ecosystemSpecies?: EcosystemSpecies[];
  // Associated ecosystem species
  associated_species?: AssociatedSpecies[];
}

export interface User {
  id: string;
  name: string;
}

// Tree Ecosystem Management Types
export interface EcosystemSpecies {
  id: string;
  treeId: string;
  speciesName: string;
  scientificName?: string;
  category: EcosystemCategory;
  relationship: EcosystemRelationship;
  observationDate: string;
  notes?: string;
  iNaturalistId?: number;
  isVerified: boolean;
  photos?: EnhancedPhoto[];
  created_at: string;
  updated_at: string;
}

export type EcosystemCategory = 
  | 'plant' 
  | 'fungus' 
  | 'animal' 
  | 'insect' 
  | 'bird' 
  | 'microorganism' 
  | 'other';

export type EcosystemRelationship = 
  | 'symbiotic' 
  | 'parasitic' 
  | 'commensal' 
  | 'predatory' 
  | 'pollinator' 
  | 'seed_disperser' 
  | 'epiphytic' 
  | 'competitive' 
  | 'neutral' 
  | 'beneficial' 
  | 'detrimental';

export interface EcosystemSpeciesFormData {
  speciesName: string;
  scientificName?: string;
  category: EcosystemCategory;
  relationship: EcosystemRelationship;
  observationDate: string;
  notes?: string;
  iNaturalistId?: number;
  isVerified?: boolean;
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

export interface AssociatedSpecies {
  id: string;
  name: string;
  scientificName?: string;
  commonName?: string;
  taxonomicRank?: string;
  iNaturalistId?: number;
  relationship: 'symbiotic' | 'pollinator' | 'disperser' | 'parasitic' | 'competitive' | 'neutral';
  notes?: string;
  dateAdded: string;
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
  // Full taxonomic hierarchy for scientific rigor
  taxonomy?: TaxonomicHierarchy;
  // Enhanced forestry management fields
  seed_source?: string;
  nursery_stock_id?: string;
  condition_notes?: string;
  management_actions?: string[];
  iNaturalist_link?: string;
  verification_status?: 'verified' | 'manual' | 'pending';
  // Associated ecosystem species
  associated_species?: AssociatedSpecies[];
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