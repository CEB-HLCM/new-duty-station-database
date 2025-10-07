// Search-related types following CEB pattern

export type SearchType = 'exact' | 'partial' | 'fuzzy' | 'soundex';

export const SearchType = {
  EXACT: 'exact' as const,
  PARTIAL: 'partial' as const,
  FUZZY: 'fuzzy' as const,
  SOUNDEX: 'soundex' as const
};

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
