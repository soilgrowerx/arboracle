export interface User {
  id: string;
  name: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  trees_count: number;
  joined_date: string;
}