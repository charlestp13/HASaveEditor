// Core utilities
export { cn } from './cn';
export { WhiteTagFactory } from './white-tags';

// Types
export type {
  Person,
  PersonContract,
  PersonUpdate,
  WhiteTag,
  OverallValue,
  SaveInfo,
  StudioUpdate,
  CompetitorStudio,
  CompetitorUpdate,
} from './types';

// API
export { SaveManager, saveManager } from './api';

// Utils (re-export from submodule)
export { DateUtils, Formatter, ValueSteppers } from './utils';

// Person utilities (re-export from submodule)
export {
  PersonUtils,
  StudioUtils,
  PersonFilters,
  PersonSorter,
  PersonStateUpdater,
  NameSearcher,
  type FilterConfig,
  type GenderFilter,
  type ShadyFilter,
  type SortField,
  type SortOrder,
  type SortContext,
  type NameSearchResult,
} from './person';

// Game data (re-export from submodule)
export {
  Genres,
  Traits,
  Status,
  Studios,
  type Genre,
  type DisplayableTrait,
  type StatusType,
  type Studio,
  type StudioId,
} from './game-data';
