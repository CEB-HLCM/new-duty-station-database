import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { DutyStation, DutyStationFilters, PaginatedResults, PaginationOptions } from '../types';

// Custom hook for app-wide data management
export function useAppData() {
  const dataContext = useData();

  // Memoized filtered duty stations based on filters
  const getFilteredDutyStations = useMemo(() => {
    return (filters: Partial<DutyStationFilters>) => {
      let filtered = [...dataContext.dutyStations];

      // Apply search text filter
      if (filters.searchText && filters.searchText.trim()) {
        const searchText = filters.searchText.toLowerCase().trim();
        const searchField = filters.searchField || 'NAME';

        filtered = filtered.filter(station => {
          switch (searchField) {
            case 'NAME':
              return station.CITY_NAME.toLowerCase().includes(searchText);
            case 'COUNTRY':
              return station.COUNTRY?.toLowerCase().includes(searchText) || false;
            case 'COMMONNAME':
              return station.CITY_COMMON_NAME.toLowerCase().includes(searchText);
            default:
              return station.CITY_NAME.toLowerCase().includes(searchText);
          }
        });
      }

      // Apply country filter
      if (filters.countryFilter && filters.countryFilter !== 'all') {
        filtered = filtered.filter(station => 
          station.COUNTRY === filters.countryFilter
        );
      }

      // Apply obsolete filter
      if (!filters.showObsolete) {
        filtered = filtered.filter(station => station.OBSOLETE !== '1');
      }

      return filtered;
    };
  }, [dataContext.dutyStations]);

  // Memoized pagination function
  const getPaginatedDutyStations = useMemo(() => {
    return (
      dutyStations: DutyStation[], 
      options: PaginationOptions
    ): PaginatedResults<DutyStation> => {
      const { page, pageSize, sortBy, sortOrder = 'asc' } = options;
      
      // Sort data if sortBy is specified
      let sortedData = [...dutyStations];
      if (sortBy) {
        sortedData.sort((a, b) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue);
            return sortOrder === 'desc' ? -comparison : comparison;
          }
          
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            const comparison = aValue - bValue;
            return sortOrder === 'desc' ? -comparison : comparison;
          }
          
          return 0;
        });
      }

      // Calculate pagination
      const totalCount = sortedData.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const data = sortedData.slice(startIndex, endIndex);

      return {
        data,
        totalCount,
        page,
        pageSize,
        totalPages,
      };
    };
  }, []);

  // Search duty stations by multiple criteria
  const searchDutyStations = useMemo(() => {
    return (searchTerm: string, searchFields: Array<keyof DutyStation> = ['NAME', 'COUNTRY', 'COMMONNAME']) => {
      if (!searchTerm.trim()) {
        return dataContext.dutyStations;
      }

      const term = searchTerm.toLowerCase();
      return dataContext.dutyStations.filter(station => {
        return searchFields.some(field => {
          const fieldValue = station[field];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(term);
          }
          return false;
        });
      });
    };
  }, [dataContext.dutyStations]);

  // Get duty stations by country
  const getDutyStationsByCountry = useMemo(() => {
    return (countryName: string) => {
      return dataContext.dutyStations.filter(station => 
        station.COUNTRY === countryName
      );
    };
  }, [dataContext.dutyStations]);

  // Get duty stations within coordinate bounds
  const getDutyStationsInBounds = useMemo(() => {
    return (
      northEast: { lat: number; lng: number },
      southWest: { lat: number; lng: number }
    ) => {
      return dataContext.dutyStations.filter(station => {
        const lat = station.LATITUDE;
        const lng = station.LONGITUDE;
        
        return (
          lat <= northEast.lat &&
          lat >= southWest.lat &&
          lng <= northEast.lng &&
          lng >= southWest.lng
        );
      });
    };
  }, [dataContext.dutyStations]);

  // Statistics and analytics
  const getDataStatistics = useMemo(() => {
    return () => {
      const stats = {
        totalDutyStations: dataContext.dutyStations.length,
        totalCountries: dataContext.countries.length,
        activeDutyStations: dataContext.dutyStations.filter(s => s.OBSOLETE !== '1').length,
        obsoleteDutyStations: dataContext.dutyStations.filter(s => s.OBSOLETE === '1').length,
        dutyStationsWithCoordinates: dataContext.dutyStations.filter(
          s => s.LATITUDE !== 0 && s.LONGITUDE !== 0
        ).length,
        countriesWithDutyStations: new Set(
          dataContext.dutyStations.map(s => s.COUNTRY).filter(Boolean)
        ).size,
      };
      
      return stats;
    };
  }, [dataContext.dutyStations, dataContext.countries]);

  // Validation functions
  const validateDutyStation = (station: Partial<DutyStation>): string[] => {
    const errors: string[] = [];
    
    if (!station.CITY_NAME?.trim()) {
      errors.push('Name is required');
    }
    
    if (!station.COUNTRY_CODE?.trim()) {
      errors.push('Country code is required');
    }
    
    if (station.LATITUDE !== undefined && (station.LATITUDE < -90 || station.LATITUDE > 90)) {
      errors.push('Latitude must be between -90 and 90');
    }
    
    if (station.LONGITUDE !== undefined && (station.LONGITUDE < -180 || station.LONGITUDE > 180)) {
      errors.push('Longitude must be between -180 and 180');
    }
    
    return errors;
  };

  // Check if duty station code exists
  const isDutyStationCodeExists = (code: string, excludeId?: string): boolean => {
    return dataContext.dutyStations.some(station => 
      station.CITY_CODE === code && station.CITY_CODE !== excludeId
    );
  };

  return {
    // Data from context
    ...dataContext,
    
    // Filtering and search functions
    getFilteredDutyStations,
    getPaginatedDutyStations,
    searchDutyStations,
    getDutyStationsByCountry,
    getDutyStationsInBounds,
    
    // Statistics and analytics
    getDataStatistics,
    
    // Validation functions
    validateDutyStation,
    isDutyStationCodeExists,
    
    // Convenience flags
    hasData: dataContext.dutyStations.length > 0,
    isEmpty: dataContext.dutyStations.length === 0,
    isReady: dataContext.isDataLoaded && !dataContext.loading && !dataContext.error,
  };
}

// Export type for the hook return value
export type UseAppDataReturn = ReturnType<typeof useAppData>;
