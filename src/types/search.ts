// Search-related types following CEB pattern

export enum SearchType {
  EXACT = 'exact',
  PARTIAL = 'partial',
  FUZZY = 'fuzzy',
  SOUNDEX = 'soundex'
}

export interface SearchOptions {
  searchType: SearchType;
  threshold: number;
  includeScore: boolean;
  maxResults?: number;
  fields?: string[];
}

export interface SearchResult<T = any> {
  item: T;
  score?: number;
  matches?: {
    field: string;
    value: string;
    indices: [number, number][];
  }[];
}

export interface SearchFilters {
  query: string;
  searchType: SearchType;
  fields: string[];
  countryFilter?: string;
  showObsolete: boolean;
}
