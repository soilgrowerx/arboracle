export interface Site {
  id: string;
  userId: string;
  name: string;
  description?: string;
  address?: string;
  client_name?: string;
  project_type?: 'residential' | 'commercial' | 'municipal' | 'conservation' | 'research' | 'other';
  site_area_sqm?: number;
  latitude?: number;
  longitude?: number;
  plus_code?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteFormData {
  name: string;
  description?: string;
  address?: string;
  client_name?: string;
  project_type?: 'residential' | 'commercial' | 'municipal' | 'conservation' | 'research' | 'other';
  site_area_sqm?: number;
  latitude?: number;
  longitude?: number;
}