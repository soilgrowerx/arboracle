export interface Tree {
  id: string;
  species: string;
  location: {
    lat: number;
    lng: number;
  };
  plus_code_global: string;
  plus_code_local: string;
  date_planted: string;
  notes: string;
  images: string[];
}

export interface User {
  id: string;
  name: string;
}

export interface TreeFormData {
  species: string;
  location: {
    lat: number;
    lng: number;
  };
  date_planted: string;
  notes: string;
  images: string[];
}