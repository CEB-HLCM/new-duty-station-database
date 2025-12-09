// Custom hook for search functionality with debouncing and state management
// Following CEB Donor Codes proven patterns

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppData } from './useAppData';
import { searchDutyStations, getSearchSuggestions, multiSearch, measureSearchPerformance } from '../services/searchService';
import { SearchType, type SearchFilters, type SearchResult } from '../types/search';
import type { DutyStation } from '../types';

// Search state interface
interface SearchState {
  query: string;
  searchType: SearchType;
  fields: string[];
  countryFilter: string;
  showObsolete: boolean;
  results: SearchResult<DutyStation>[];
  suggestions: string[];
  loading: boolean;
  error: string | null;
  searchTime: number;
  totalResults: number;
}

// Search hook options
interface UseSearchOptions {
  debounceMs?: number;
  maxSuggestions?: number;
  enableSuggestions?: boolean;
  enablePerformanceTracking?: boolean;
}

// Custom hook for search functionality
export function useSearch(options: UseSearchOptions = {}) {
  const {
    debounceMs = 300,
    maxSuggestions = 10,
    enableSuggestions = true,
    enablePerformanceTracking = true,
  } = options;

  const { dutyStations, countries, isReady } = useAppData();

  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    searchType: SearchType.PARTIAL,
    fields: ['CITY_NAME', 'CITY_COMMON_NAME', 'COUNTRY'],
    countryFilter: 'all',
    showObsolete: false,
    results: [],
    suggestions: [],
    loading: false,
    error: null,
    searchTime: 0,
    totalResults: 0,
  });

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchState.query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchState.query, debounceMs]);

  // Perform search when debounced query or filters change
  useEffect(() => {
    if (!isReady) return;

    const performSearch = () => {
      setSearchState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const filters: SearchFilters = {
          query: debouncedQuery,
          searchType: searchState.searchType,
          fields: searchState.fields,
          countryFilter: searchState.countryFilter,
          showObsolete: searchState.showObsolete,
        };

        let results: SearchResult<DutyStation>[] = [];
        let searchTime = 0;

        if (enablePerformanceTracking) {
          const { result, duration } = measureSearchPerformance(
            () => searchDutyStations(dutyStations, filters),
            searchState.searchType,
            debouncedQuery
          );
          results = result;
          searchTime = duration;
        } else {
          results = searchDutyStations(dutyStations, filters);
        }

        setSearchState(prev => ({
          ...prev,
          results,
          loading: false,
          searchTime,
          totalResults: results.length,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Search failed';
        setSearchState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          results: [],
          totalResults: 0,
        }));
      }
    };

    performSearch();
  }, [debouncedQuery, searchState.searchType, searchState.fields, searchState.countryFilter, searchState.showObsolete, dutyStations, isReady, enablePerformanceTracking]);

  // Update suggestions when query changes (immediate, no debounce for UX)
  useEffect(() => {
    if (!isReady || !enableSuggestions) return;

    if (searchState.query.length >= 2) {
      const suggestions = getSearchSuggestions(dutyStations, searchState.query, maxSuggestions);
      setSearchState(prev => ({ ...prev, suggestions }));
    } else {
      setSearchState(prev => ({ ...prev, suggestions: [] }));
    }
  }, [searchState.query, dutyStations, isReady, enableSuggestions, maxSuggestions]);

  // Action functions
  const setQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  }, []);

  const setSearchType = useCallback((searchType: SearchType) => {
    setSearchState(prev => ({ ...prev, searchType }));
  }, []);

  const setFields = useCallback((fields: string[]) => {
    setSearchState(prev => ({ ...prev, fields }));
  }, []);

  const setCountryFilter = useCallback((countryFilter: string) => {
    setSearchState(prev => ({ ...prev, countryFilter }));
  }, []);

  const setShowObsolete = useCallback((showObsolete: boolean) => {
    setSearchState(prev => ({ ...prev, showObsolete }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      query: '',
      results: [],
      suggestions: [],
      error: null,
      totalResults: 0,
      searchTime: 0,
    }));
    setDebouncedQuery('');
  }, []);

  const clearError = useCallback(() => {
    setSearchState(prev => ({ ...prev, error: null }));
  }, []);

  // Advanced search function for multi-type search
  const performMultiSearch = useCallback((query: string, maxResults: number = 50) => {
    if (!isReady) return [];

    const { result, duration } = measureSearchPerformance(
      () => multiSearch(dutyStations, query, { maxResults }),
      'multi',
      query
    );

    setSearchState(prev => ({
      ...prev,
      results: result,
      searchTime: duration,
      totalResults: result.length,
    }));

    return result;
  }, [dutyStations, isReady]);

  // Quick search for specific duty station codes
  const searchByCode = useCallback((code: string): DutyStation | null => {
    if (!isReady || !code.trim()) return null;

    const station = dutyStations.find(station => 
      station.CITY_CODE.toLowerCase() === code.toLowerCase().trim()
    );

    return station || null;
  }, [dutyStations, isReady]);

  // Search by coordinates (within radius)
  const searchByLocation = useCallback((
    latitude: number, 
    longitude: number, 
    radiusKm: number = 50
  ): DutyStation[] => {
    if (!isReady) return [];

    // Simple distance calculation (Haversine formula approximation)
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    
    return dutyStations.filter(station => {
      if (station.LATITUDE === 0 && station.LONGITUDE === 0) return false;

      const lat1 = toRadians(latitude);
      const lat2 = toRadians(station.LATITUDE);
      const deltaLat = toRadians(station.LATITUDE - latitude);
      const deltaLng = toRadians(station.LONGITUDE - longitude);

      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371 * c; // Earth's radius in km

      return distance <= radiusKm;
    });
  }, [dutyStations, isReady]);

  // Memoized country options for filters (excluding obsolete countries)
  const countryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Countries' },
      ...countries
        .filter(country => country.OBSOLETE !== '1')
        .map(country => ({
          value: country.COUNTRY_NAME,
          label: country.COUNTRY_NAME,
        })),
    ];
  }, [countries]);

  // Memoized search field options
  const fieldOptions = useMemo(() => [
    { value: 'CITY_NAME', label: 'Station Name' },
    { value: 'CITY_COMMON_NAME', label: 'Common Name' },
    { value: 'COUNTRY', label: 'Country' },
    { value: 'COUNTRY_CODE', label: 'Country Code' },
  ], []);

  // Search type options
  const searchTypeOptions = useMemo(() => [
    { value: SearchType.EXACT, label: 'Exact Match' },
    { value: SearchType.PARTIAL, label: 'Contains' },
    { value: SearchType.FUZZY, label: 'Fuzzy Search' },
    { value: SearchType.SOUNDEX, label: 'Sounds Like' },
  ], []);

  // Performance metrics
  const performanceMetrics = useMemo(() => ({
    searchTime: searchState.searchTime,
    isSlowSearch: searchState.searchTime > 50, // Flag searches over 50ms
    resultsCount: searchState.totalResults,
    hasResults: searchState.totalResults > 0,
    isEmpty: searchState.totalResults === 0 && debouncedQuery.length > 0,
  }), [searchState.searchTime, searchState.totalResults, debouncedQuery]);

  return {
    // Current search state
    query: searchState.query,
    searchType: searchState.searchType,
    fields: searchState.fields,
    countryFilter: searchState.countryFilter,
    showObsolete: searchState.showObsolete,
    results: searchState.results,
    suggestions: searchState.suggestions,
    loading: searchState.loading,
    error: searchState.error,
    totalResults: searchState.totalResults,

    // Data from useAppData
    dutyStations,
    countries,

    // Action functions
    setQuery,
    setSearchType,
    setFields,
    setCountryFilter,
    setShowObsolete,
    clearSearch,
    clearError,

    // Advanced search functions
    performMultiSearch,
    searchByCode,
    searchByLocation,

    // Options for UI components
    countryOptions,
    fieldOptions,
    searchTypeOptions,

    // Performance and status
    performanceMetrics,
    isReady,
    hasQuery: debouncedQuery.length > 0,
    hasResults: searchState.results.length > 0,
    isEmpty: searchState.results.length === 0 && debouncedQuery.length > 0,
  };
}

// Export type for the hook return value
export type UseSearchReturn = ReturnType<typeof useSearch>;
