// Advanced search service with multiple search algorithms
// Following CEB Donor Codes proven patterns

import Fuse, { type IFuseOptions } from 'fuse.js';
import soundex from 'soundex';
import type { DutyStation } from '../types';
import { SearchType, type SearchOptions, type SearchResult, type SearchFilters } from '../types/search';

// Fuse.js configuration for fuzzy search
const fuseOptions: IFuseOptions<DutyStation> = {
  includeScore: true,
  includeMatches: true,
  threshold: 0.3, // Lower = more strict matching
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: [
    {
      name: 'NAME',
      weight: 0.4,
    },
    {
      name: 'COMMONNAME',
      weight: 0.3,
    },
    {
      name: 'COUNTRY',
      weight: 0.2,
    },
    {
      name: 'CTY',
      weight: 0.1,
    },
  ],
};

// Cache for search instances
let fuseInstance: Fuse<DutyStation> | null = null;
let lastDataHash: string | null = null;

// Create or update Fuse instance
function getFuseInstance(data: DutyStation[]): Fuse<DutyStation> {
  const dataHash = JSON.stringify(data.map(d => d.DS)).slice(0, 100); // Simple hash
  
  if (!fuseInstance || lastDataHash !== dataHash) {
    fuseInstance = new Fuse(data, fuseOptions);
    lastDataHash = dataHash;
  }
  
  return fuseInstance;
}

// Exact search implementation
function exactSearch(
  data: DutyStation[], 
  query: string, 
  fields: (keyof DutyStation)[] = ['NAME', 'COMMONNAME', 'COUNTRY']
): SearchResult<DutyStation>[] {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) return [];
  
  const results: SearchResult<DutyStation>[] = [];
  
  for (const item of data) {
    // Check for exact matches in specified fields
    const exactMatches = fields.filter(field => {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase() === lowerQuery;
      }
      return false;
    });
    
    if (exactMatches.length > 0) {
      results.push({
        item,
        score: 0, // Perfect match
        matches: exactMatches.map(field => ({
          field: field as string,
          value: item[field] as string,
          indices: [[0, (item[field] as string).length - 1]] as [number, number][],
        })),
      });
    }
  }
  
  return results.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
}

// Partial search implementation (contains/includes)
function partialSearch(
  data: DutyStation[], 
  query: string, 
  fields: (keyof DutyStation)[] = ['NAME', 'COMMONNAME', 'COUNTRY']
): SearchResult<DutyStation>[] {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) return [];
  
  const results: SearchResult<DutyStation>[] = [];
  
  for (const item of data) {
    const matches: SearchResult<DutyStation>['matches'] = [];
    let bestScore = 1;
    
    fields.forEach(field => {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        const lowerFieldValue = fieldValue.toLowerCase();
        const index = lowerFieldValue.indexOf(lowerQuery);
        
        if (index !== -1) {
          // Calculate score based on position and length
          const score = index / lowerFieldValue.length;
          if (score < bestScore) bestScore = score;
          
          matches.push({
            field: field as string,
            value: fieldValue,
            indices: [[index, index + lowerQuery.length - 1]] as [number, number][],
          });
        }
      }
    });
    
    if (matches.length > 0) {
      results.push({
        item,
        score: bestScore,
        matches,
      });
    }
  }
  
  return results.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
}

// Fuzzy search implementation using Fuse.js
function fuzzySearch(
  data: DutyStation[], 
  query: string, 
  threshold: number = 0.3
): SearchResult<DutyStation>[] {
  if (!query.trim()) return [];
  
  const fuse = getFuseInstance(data);
  const results = fuse.search(query, { limit: 100 });
  
  return results
    .filter(result => (result.score || 0) <= threshold)
    .map(result => ({
      item: result.item,
      score: result.score || 0,
      matches: result.matches?.map(match => ({
        field: match.key || '',
        value: match.value || '',
        indices: (match.indices || []).map(([start, end]) => [start, end] as [number, number]) as [number, number][],
      })),
    }));
}

// Soundex search implementation
function soundexSearch(
  data: DutyStation[], 
  query: string, 
  fields: (keyof DutyStation)[] = ['NAME', 'COMMONNAME']
): SearchResult<DutyStation>[] {
  const querySoundex = soundex(query.trim());
  
  if (!querySoundex) return [];
  
  const results: SearchResult<DutyStation>[] = [];
  
  for (const item of data) {
    const matches: SearchResult<DutyStation>['matches'] = [];
    
    fields.forEach(field => {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        // Split field value into words and check soundex for each
        const words = fieldValue.split(/\s+/);
        words.forEach(word => {
          if (word.length > 2 && soundex(word) === querySoundex) {
            matches.push({
              field: field as string,
              value: fieldValue,
              indices: [[0, fieldValue.length - 1]] as [number, number][],
            });
          }
        });
      }
    });
    
    if (matches.length > 0) {
      results.push({
        item,
        score: 0.5, // Medium confidence for soundex matches
        matches,
      });
    }
  }
  
  return results;
}

// Main search function that combines all search types
export function searchDutyStations(
  data: DutyStation[], 
  filters: SearchFilters
): SearchResult<DutyStation>[] {
  const { query, searchType, fields, countryFilter, showObsolete } = filters;
  
  // Filter data based on additional filters
  let filteredData = [...data];
  
  // Apply country filter
  if (countryFilter && countryFilter !== 'all') {
    filteredData = filteredData.filter(station => 
      station.COUNTRY === countryFilter
    );
  }
  
  // Apply obsolete filter
  if (!showObsolete) {
    filteredData = filteredData.filter(station => station.OBSOLETE !== '1');
  }
  
  if (!query.trim()) {
    return filteredData.map(item => ({ item }));
  }
  
  // Determine search fields - convert string array to proper keys
  const validFields = ['NAME', 'COMMONNAME', 'COUNTRY', 'DS', 'CTY'] as const;
  const searchFields = fields.length > 0 
    ? fields.filter(f => validFields.includes(f as any)) as (keyof DutyStation)[]
    : ['NAME', 'COMMONNAME', 'COUNTRY'] as (keyof DutyStation)[];
  
  // Perform search based on type
  let results: SearchResult<DutyStation>[] = [];
  
  switch (searchType) {
    case 'exact':
      results = exactSearch(filteredData, query, searchFields);
      break;
    case 'partial':
      results = partialSearch(filteredData, query, searchFields);
      break;
    case 'fuzzy':
      results = fuzzySearch(filteredData, query, 0.3);
      break;
    case 'soundex':
      results = soundexSearch(filteredData, query, searchFields);
      break;
    default:
      // Default to partial search
      results = partialSearch(filteredData, query, searchFields);
  }
  
  return results;
}

// Search suggestions based on partial matching
export function getSearchSuggestions(
  data: DutyStation[], 
  query: string, 
  maxSuggestions: number = 10
): string[] {
  if (!query.trim() || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  const suggestions = new Set<string>();
  
  // Collect suggestions from different fields
  data.forEach(station => {
    // Name suggestions
    if (station.NAME.toLowerCase().includes(lowerQuery)) {
      suggestions.add(station.NAME);
    }
    
    // Common name suggestions
    if (station.COMMONNAME && station.COMMONNAME.toLowerCase().includes(lowerQuery)) {
      suggestions.add(station.COMMONNAME);
    }
    
    // Country suggestions
    if (station.COUNTRY && station.COUNTRY.toLowerCase().includes(lowerQuery)) {
      suggestions.add(station.COUNTRY);
    }
  });
  
  return Array.from(suggestions)
    .slice(0, maxSuggestions)
    .sort((a, b) => {
      // Prioritize suggestions that start with the query
      const aStarts = a.toLowerCase().startsWith(lowerQuery);
      const bStarts = b.toLowerCase().startsWith(lowerQuery);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return a.localeCompare(b);
    });
}

// Multi-type search that combines results from different algorithms
export function multiSearch(
  data: DutyStation[], 
  query: string, 
  options: Partial<SearchOptions> = {}
): SearchResult<DutyStation>[] {
  const {
    threshold = 0.3,
    maxResults = 50,
    fields = ['NAME', 'COMMONNAME', 'COUNTRY'],
  } = options;
  
  if (!query.trim()) return [];
  
  const searchFields = fields as (keyof DutyStation)[];
  const resultsMap = new Map<string, SearchResult<DutyStation>>();
  
  // Collect results from different search types
  const exactResults = exactSearch(data, query, searchFields);
  const partialResults = partialSearch(data, query, searchFields);
  const fuzzyResults = fuzzySearch(data, query, threshold);
  
  // Combine results, prioritizing exact matches
  [...exactResults, ...partialResults, ...fuzzyResults].forEach(result => {
    const key = result.item.DS;
    const existing = resultsMap.get(key);
    
    if (!existing || (result.score || 0) < (existing.score || 0)) {
      resultsMap.set(key, result);
    }
  });
  
  return Array.from(resultsMap.values())
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, maxResults);
}

// Search performance monitoring
export function measureSearchPerformance<T>(
  searchFunction: () => T,
  searchType: string,
  query: string
): { result: T; duration: number } {
  const startTime = performance.now();
  const result = searchFunction();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Log performance metrics (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`Search Performance - ${searchType}:`, {
      query,
      duration: `${duration.toFixed(2)}ms`,
      resultsCount: Array.isArray(result) ? result.length : 1,
    });
  }
  
  return { result, duration };
}

// Export search types for convenience
export { SearchType };
