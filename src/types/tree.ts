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
  // Genesis Sprint IV: Structured condition assessment (replaces condition_notes)
  condition_assessment?: ConditionAssessment;
  // Legacy field for backward compatibility (will be migrated)
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
  // Professional arborist fields for Genesis Sprint III
  land_owner?: string;
  site_name?: string;
  height_cm?: number;
  dbh_cm?: number; // Diameter at Breast Height
  health_status?: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead';
  // Genesis Sprint IV: Advanced Measurements
  is_multi_stem?: boolean;
  stem_diameters?: number[]; // Array of individual stem measurements in cm
  canopy_spread_ns?: number; // North-South canopy spread in meters
  canopy_spread_ew?: number; // East-West canopy spread in meters
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

export interface ConditionChecklistData {
  structure: string[];
  canopy_health: string[];
  pests_diseases: string[];
  site_conditions: string[];
}

export interface ConditionAssessment {
  checklist: ConditionChecklistData;
  arborist_summary: string;
  health_status?: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead';
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
  // Genesis Sprint IV: Structured condition assessment (replaces condition_notes)
  condition_assessment?: ConditionAssessment;
  management_actions?: string[];
  iNaturalist_link?: string;
  verification_status?: 'verified' | 'manual' | 'pending';
  // Associated ecosystem species
  associated_species?: AssociatedSpecies[];
  // Professional arborist fields for Genesis Sprint III
  land_owner?: string;
  site_name?: string;
  height_cm?: number;
  dbh_cm?: number; // Diameter at Breast Height
  health_status?: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead';
  // Genesis Sprint IV: Advanced Measurements
  is_multi_stem?: boolean;
  stem_diameters?: number[]; // Array of individual stem measurements in cm
  canopy_spread_ns?: number; // North-South canopy spread in meters
  canopy_spread_ew?: number; // East-West canopy spread in meters
}