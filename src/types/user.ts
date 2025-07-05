export interface User {
  id: string;
  name: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  unitSystem: 'imperial' | 'metric';
  aiPersona: 'Bodhi' | 'Sequoia' | 'Willow';
}

export interface UserProfile {
  id: string;
  name: string;
  trees_count: number;
  joined_date: string;
}