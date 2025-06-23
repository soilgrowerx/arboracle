export interface ConditionAssessment {
  id: string;
  treeId: string;
  assessmentDate: string;
  assessedBy?: string;
  health_status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead' | 'Hazardous';
  
  // Structured checklist data
  condition_checklist: {
    structure: StructureCondition[];
    canopy_health: CanopyHealthCondition[];
    pests_diseases: PestDiseaseCondition[];
    site_conditions: SiteCondition[];
  };
  
  arborist_summary: string;
  recommended_actions?: RecommendedAction[];
  follow_up_date?: string;
  photos?: string[];
  
  created_at: string;
  updated_at: string;
}

export type StructureCondition = 
  | 'co_dominant_stems'
  | 'included_bark'
  | 'dead_branches'
  | 'broken_branches'
  | 'cavity_decay'
  | 'lean_greater_15_degrees'
  | 'root_damage'
  | 'girdling_roots'
  | 'mechanical_damage'
  | 'lightning_damage'
  | 'cracks_splits'
  | 'weak_branch_unions';

export type CanopyHealthCondition =
  | 'sparse_foliage'
  | 'chlorosis'
  | 'wilting'
  | 'dieback'
  | 'epicormic_growth'
  | 'abnormal_leaf_size'
  | 'premature_leaf_drop'
  | 'dead_branches_canopy'
  | 'stunted_growth';

export type PestDiseaseCondition =
  | 'insect_presence'
  | 'boring_insects'
  | 'scale_insects'
  | 'fungal_fruiting_bodies'
  | 'cankers'
  | 'leaf_spots'
  | 'powdery_mildew'
  | 'rust'
  | 'bacterial_wetwood'
  | 'nematodes'
  | 'galls';

export type SiteCondition =
  | 'compacted_soil'
  | 'exposed_roots'
  | 'recent_grade_change'
  | 'poor_drainage'
  | 'drought_stress'
  | 'salt_damage'
  | 'herbicide_damage'
  | 'mechanical_injury'
  | 'construction_impact'
  | 'limited_root_space'
  | 'pavement_conflict'
  | 'utility_conflict';

export interface RecommendedAction {
  action: string;
  priority: 'immediate' | 'high' | 'medium' | 'low' | 'monitor';
  estimated_cost?: number;
  notes?: string;
}

export interface ConditionAssessmentFormData {
  health_status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead' | 'Hazardous';
  structure: StructureCondition[];
  canopy_health: CanopyHealthCondition[];
  pests_diseases: PestDiseaseCondition[];
  site_conditions: SiteCondition[];
  arborist_summary: string;
  recommended_actions?: RecommendedAction[];
  follow_up_date?: string;
}

// Checklist definitions for frontend
export const CONDITION_CHECKLISTS = {
  structure: [
    { value: 'co_dominant_stems', label: 'Co-dominant Stems' },
    { value: 'included_bark', label: 'Included Bark' },
    { value: 'dead_branches', label: 'Dead Branches' },
    { value: 'broken_branches', label: 'Broken Branches' },
    { value: 'cavity_decay', label: 'Cavity/Decay' },
    { value: 'lean_greater_15_degrees', label: 'Lean >15°' },
    { value: 'root_damage', label: 'Root Damage' },
    { value: 'girdling_roots', label: 'Girdling Roots' },
    { value: 'mechanical_damage', label: 'Mechanical Damage' },
    { value: 'lightning_damage', label: 'Lightning Damage' },
    { value: 'cracks_splits', label: 'Cracks/Splits' },
    { value: 'weak_branch_unions', label: 'Weak Branch Unions' }
  ],
  canopy_health: [
    { value: 'sparse_foliage', label: 'Sparse Foliage' },
    { value: 'chlorosis', label: 'Chlorosis' },
    { value: 'wilting', label: 'Wilting' },
    { value: 'dieback', label: 'Dieback' },
    { value: 'epicormic_growth', label: 'Epicormic Growth' },
    { value: 'abnormal_leaf_size', label: 'Abnormal Leaf Size' },
    { value: 'premature_leaf_drop', label: 'Premature Leaf Drop' },
    { value: 'dead_branches_canopy', label: 'Dead Branches in Canopy' },
    { value: 'stunted_growth', label: 'Stunted Growth' }
  ],
  pests_diseases: [
    { value: 'insect_presence', label: 'Insect Presence' },
    { value: 'boring_insects', label: 'Boring Insects' },
    { value: 'scale_insects', label: 'Scale Insects' },
    { value: 'fungal_fruiting_bodies', label: 'Fungal Fruiting Bodies' },
    { value: 'cankers', label: 'Cankers' },
    { value: 'leaf_spots', label: 'Leaf Spots' },
    { value: 'powdery_mildew', label: 'Powdery Mildew' },
    { value: 'rust', label: 'Rust' },
    { value: 'bacterial_wetwood', label: 'Bacterial Wetwood' },
    { value: 'nematodes', label: 'Nematodes' },
    { value: 'galls', label: 'Galls' }
  ],
  site_conditions: [
    { value: 'compacted_soil', label: 'Compacted Soil' },
    { value: 'exposed_roots', label: 'Exposed Roots' },
    { value: 'recent_grade_change', label: 'Recent Grade Change' },
    { value: 'poor_drainage', label: 'Poor Drainage' },
    { value: 'drought_stress', label: 'Drought Stress' },
    { value: 'salt_damage', label: 'Salt Damage' },
    { value: 'herbicide_damage', label: 'Herbicide Damage' },
    { value: 'mechanical_injury', label: 'Mechanical Injury' },
    { value: 'construction_impact', label: 'Construction Impact' },
    { value: 'limited_root_space', label: 'Limited Root Space' },
    { value: 'pavement_conflict', label: 'Pavement Conflict' },
    { value: 'utility_conflict', label: 'Utility Conflict' }
  ]
};