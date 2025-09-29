import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { DutyStation, Country } from '../types';
import { fetchDutyStationsWithCountriesCached } from '../services/dataService';

// Data state interface
interface DataState {
  dutyStations: DutyStation[];
  countries: Country[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Action types for reducer
type DataAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { dutyStations: DutyStation[]; countries: Country[] } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'REFRESH_DATA' };

// Initial state
const initialState: DataState = {
  dutyStations: [],
  countries: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Reducer function
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        dutyStations: action.payload.dutyStations,
        countries: action.payload.countries,
        lastUpdated: new Date(),
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'REFRESH_DATA':
      return {
        ...state,
        loading: true,
        error: null,
      };
    default:
      return state;
  }
}

// Context interface
interface DataContextType extends DataState {
  refreshData: () => Promise<void>;
  clearError: () => void;
  getDutyStationByCode: (code: string) => DutyStation | undefined;
  getCountriesList: () => Country[];
  getUniqueCountries: () => string[];
  isDataLoaded: boolean;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider props
interface DataProviderProps {
  children: ReactNode;
}

// Data provider component
export function DataProvider({ children }: DataProviderProps) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Fetch data function
  const fetchData = async () => {
    try {
      dispatch({ type: 'FETCH_START' });
      
      // Fetch duty stations with country data
      const dutyStations = await fetchDutyStationsWithCountriesCached();
      
      // Extract unique countries from duty stations data
      const countriesMap = new Map<string, Country>();
      dutyStations.forEach(station => {
        if (station.CTY && station.COUNTRY) {
          countriesMap.set(station.CTY, {
            CTYCD: station.CTY,
            NAME: station.COUNTRY,
          });
        }
      });
      
      const countries = Array.from(countriesMap.values()).sort((a, b) => 
        a.NAME.localeCompare(b.NAME)
      );

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { dutyStations, countries },
      });
      
      console.log(`DataContext: Loaded ${dutyStations.length} duty stations and ${countries.length} countries`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('DataContext: Failed to fetch data:', error);
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  };

  // Refresh data function
  const refreshData = async () => {
    dispatch({ type: 'REFRESH_DATA' });
    await fetchData();
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Utility functions
  const getDutyStationByCode = (code: string): DutyStation | undefined => {
    return state.dutyStations.find(station => station.DS === code);
  };

  const getCountriesList = (): Country[] => {
    return state.countries;
  };

  const getUniqueCountries = (): string[] => {
    return state.countries.map(country => country.NAME);
  };

  const isDataLoaded = state.dutyStations.length > 0 && !state.loading;

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Context value
  const contextValue: DataContextType = {
    ...state,
    refreshData,
    clearError,
    getDutyStationByCode,
    getCountriesList,
    getUniqueCountries,
    isDataLoaded,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

// Custom hook to use data context
export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Export context for advanced usage
export { DataContext };
