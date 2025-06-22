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
  // Associated ecosystem species
  associated_species?: AssociatedSpecies[];
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