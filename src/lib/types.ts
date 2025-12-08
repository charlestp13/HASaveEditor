// ─────────────────────────────────────────────────────────────────────────────
// Person Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Person {
  id: number;
  firstNameId?: string;
  lastNameId?: string;
  customName?: string | null;
  birthDate?: string;
  deathDate?: string;
  causeOfDeath?: number;
  gender?: number;
  studioId?: string | null;
  portraitBaseId?: number;
  mood?: number;
  attitude?: number;
  selfEsteem?: string;
  readiness?: number;
  limit?: number;
  Limit?: number;
  state?: number;
  professions?: Record<string, string>;
  skill?: number;
  whiteTagsNEW?: Record<string, WhiteTag>;
  contract?: PersonContract;
  labels?: string[];
  aSins?: string[];
  activeOrPlannedMovies?: unknown[];
  isShady?: boolean;
  isOnTheHook?: boolean;
  mayHaveSins?: boolean | null;
  prefIlGift?: number;
}

export interface PersonContract {
  contractType: number;
  amount: number;
  startAmount: number;
  initialFee: string;
  monthlySalary: string;
  weightToSalary: string;
  dateOfSigning: string;
}

export interface PersonUpdate {
  firstNameId?: string;
  lastNameId?: string;
  customName?: string | null;
  gender?: number;
  studioId?: string | null;
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
  addGenre?: string;
  removeGenre?: string;
  portraitBaseId?: number;
  birthYear?: number;
  isShady?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// White Tag Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WhiteTag {
  id: string;
  value: string;
  dateAdded: string;
  movieId: number;
  IsOverall: boolean;
  overallValues: OverallValue[];
}

export interface OverallValue {
  movieId: number;
  sourceType: number;
  value: string;
  dateAdded: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Save File Types
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Studio Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StudioUpdate {
  budget?: number;
  cash?: number;
  reputation?: number;
  influence?: number;
}

export interface CompetitorStudio {
  id: string;
  last_budget: number;
  income_this_month: number;
  ip: number;
  is_dead: boolean;
  budget_cheats_remaining: number;
}

export interface CompetitorUpdate {
  lastBudget?: number;
  ip?: number;
  budgetCheatsRemaining?: number;
}
