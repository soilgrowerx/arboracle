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

export interface Project {
  id: string;
  name: string;
  address: string;
  client: string;
}

export interface NurseryItem {
  id: string;
  name: string;
  species: string;
  quantity: number;
  price: number; // per unit
  projectAssociation?: string; // Optional: Link to a project
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tree {
  id: string;
  species: string;
  commonName: string;
  generalNotes?: string;
  latitude: number;
  longitude: number;
  plusCode: string;
  height: number;
  dbh: number;
  multiStem: boolean;
  individualStemDiameters?: string;
  canopySpreadNS: number;
  canopySpreadEW: number;
  projectAssociation: string;
  conditionAssessment?: ConditionAssessment;
  managementActions?: string;
  photos: string[]; // Base64 encoded image strings
  plantedDate: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
  scientificName?: string;
  taxonomicRank?: string;
  iNaturalistId?: number;
  taxonomy?: TaxonomicHierarchy;
  seedSource?: string;
  nurseryStockId?: string;
  iNaturalistLink?: string;
  verificationStatus: 'verified' | 'manual' | 'pending';
  description?: string;
  distributionInfo?: string;
  conservationStatus?: string;
  ecosystemSpecies?: EcosystemSpecies[];
  associatedSpecies?: AssociatedSpecies[];
  landOwner?: string;
  siteName?: string;
  healthStatus?: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead';
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
  createdAt: string;
  updatedAt: string;
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
  structure: {
    codominantStems: boolean;
    includedBark: boolean;
    decay: boolean;
    cracks: boolean;
    previousFailure: boolean;
    rootProblems: boolean;
    notes: Record<string, string>;
  };
  canopyHealth: {
    leafDiscoloration: boolean;
    pestDisease: boolean;
    canopyDieback: boolean;
    thinning: boolean;
    notes: Record<string, string>;
  };
  pestsDiseases: {
    aphids: boolean;
    borers: boolean;
    fungus: boolean;
    cankers: boolean;
    notes: Record<string, string>;
  };
  siteConditions: {
    soilCompaction: boolean;
    drainageIssues: boolean;
    girdlingRoots: boolean;
    constructionImpact: boolean;
    notes: Record<string, string>;
  };
  // For construction monitoring
  tpzFencing?: 'good_condition' | 'not_installed' | 'damaged' | 'breached';
  tpzIncursions?: 'none' | 'partial' | 'significant';
  tpzMulch?: 'adequate' | 'inadequate' | 'none';
  crzImpacts?: {
    rootSeverance: boolean;
    soilCompaction: boolean;
    gradeChange: boolean;
    chemicalSpill: boolean;
  };
  overallCondition?: 'excellent' | 'good' | 'fair' | 'poor' | 'dead';
  canopyDensity?: 'dense' | 'moderate' | 'sparse';
  canopyColor?: 'normal' | 'chlorotic' | 'necrotic';
  canopyDieback?: 'none' | 'minor' | 'moderate' | 'severe';
  canopyImpactNotes?: string;
  specificNotes?: string;
  recommendedAction?: string;
}

