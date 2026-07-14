export interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
  region: string;
  type: 'государственный' | 'частный';
  rating: number;
  students: number;
  specialties: string[];
  minScore: number;
  budgetPlaces: number;
  paidPlaces: number;
  website: string;
  description: string;
  hasDormitory: boolean;
  hasMilitary: boolean;
}

export interface Filters {
  query: string;
  region: string;
  city: string;
  type: string;
  specialty: string;
  minScore: number;
  hasDormitory: boolean;
  sortBy: 'rating' | 'minScore' | 'name';
}
