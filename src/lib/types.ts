export interface Person {
  id: string | number;
  firstNameId?: number;
  lastNameId?: number;
  customName?: string;
  birthDate?: string;
  deathDate?: string;
  causeOfDeath?: number;
  gender?: number;
  studioId?: number | string;
  mood?: number;
  attitude?: number;
  selfEsteem?: number;
  readiness?: number;
  state?: number;
  professions?: {
    [key: string]: string;
  };
  skill?: number;
  limit?: number;
  Limit?: number;
  whiteTagsNEW?: Record<string, WhiteTag>;
  portraitBaseId?: number;
  contract?: {
    contractType: number;
    amount: number;
    startAmount: number;
    initialFee: number;
    monthlySalary: number;
    weightToSalary: number;
    dateOfSigning: string;
  };
  labels?: string[];
  aSins?: string[];
  activeOrPlannedMovies?: any[];
}

export interface OverallValue {
  movieId: number;
  sourceType: number;
  value: number;
  dateAdded: string;
}

export interface WhiteTag {
  id: string;
  value: number;
  dateAdded: string;
  movieId: number;
  IsOverall: boolean;
  overallValues: OverallValue[];
}

export interface Studio {
  name: string;
  player?: boolean;
  budget?: number;
  cash?: number;
  reputation?: number;
  influence?: number;
}

export interface Movie {
  id: string;
  title?: string;
  year?: number;
  budget?: number;
  revenue?: number;
  rating?: number;
  genre?: string;
  studioId?: number;
  status?: string;
}

export interface SaveFile {
  year?: number;
  professions?: {
    [key: string]: Person[];
  };
  studios?: Studio[];
  movies?: Movie[];
}

export interface SaveInfo {
  current_date: string;
  player_studio_name: string;
  actors_count: number;
  directors_count: number;
  producers_count: number;
  writers_count: number;
  editors_count: number;
  composers_count: number;
  cinematographers_count: number;
  agents_count: number;
  executives_count: number;
  movies_count: number;
  studios_count: number;
  budget: number;
  cash: number;
  reputation: number;
  influence: number;
  studio_logo_id: number;
}

export interface PersonUpdate {
  customName?: string;
  gender?: number;
  studioId?: number;
  mood?: number;
  attitude?: number;
  selfEsteem?: number;
  readiness?: number;
  state?: number;
  skill?: number;
  limit?: number;
  art?: number | null;
  com?: number | null;
  addTrait?: string;
  removeTrait?: string;
}

export interface StudioUpdate {
  budget?: number;
  cash?: number;
  reputation?: number;
  influence?: number;
}