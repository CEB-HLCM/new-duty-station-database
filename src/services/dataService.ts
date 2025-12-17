// Data service following proven CEB pattern for CSV fetching

import type { DutyStation, Country, ApiResponse } from '../types';

// GitHub raw URLs for CSV data
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/CEB-HLCM/HR-Public-Codes/refs/heads/main';
const DUTY_STATIONS_CSV_URL = `${GITHUB_RAW_BASE}/DSCITYCD.csv`;
const COUNTRIES_CSV_URL = `${GITHUB_RAW_BASE}/DSCTRYCD.csv`;

// CSV parsing utility - handles quoted values with commas
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  
  // Parse CSV line respecting quotes
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    
    return result;
  };
  
  const headers = parseLine(lines[0]);
  
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const record: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    
    return record;
  });
}

// Fetch duty stations data
export async function fetchDutyStations(): Promise<DutyStation[]> {
  try {
    // Fetching duty stations from CSV
    
    const response = await fetch(DUTY_STATIONS_CSV_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const rawData = parseCSV(csvText);
    
    // Transform raw CSV data to DutyStation interface
    // Updated to use new CSV field names: CITY_CODE, CITY_NAME, CITY_COMMON_NAME, COUNTRY_CODE, COUNTRY_NAME
    const dutyStations: DutyStation[] = rawData.map(row => ({
      CITY_CODE: row.CITY_CODE || '',
      COUNTRY_CODE: row.COUNTRY_CODE || '',
      CITY_NAME: row.CITY_NAME || '',
      LATITUDE: parseFloat(row.LATITUDE?.replace(',', '.') || '0'),
      LONGITUDE: parseFloat(row.LONGITUDE?.replace(',', '.') || '0'),
      CITY_COMMON_NAME: row.CITY_COMMON_NAME || '',
      OBSOLETE: row.OBSOLETE || '0',
      REGION: row.REGION || '',
      // CLASS field removed - no longer in CSV
    }));
    
    // Return ALL stations including obsolete ones
    // UI components will handle filtering based on user preferences
    return dutyStations;
    
  } catch (error) {
    console.error('Failed to fetch duty stations:', error);
    throw new Error(`Failed to fetch duty stations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Fetch countries data
export async function fetchCountries(): Promise<Country[]> {
  try {
    // Fetching countries from CSV
    
    const response = await fetch(COUNTRIES_CSV_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const rawData = parseCSV(csvText);
    
    // DEBUG: Log the first few rows to see actual structure
    // Debug: Country CSV structure validation
    // console.debug('COUNTRIES CSV - First row keys:', Object.keys(rawData[0]));
    // console.debug('COUNTRIES CSV - First 3 rows:', rawData.slice(0, 3));
    
    // Transform raw CSV data to Country interface
    // Updated to use new CSV field names: COUNTRY_CODE, COUNTRY_NAME
    const countries = rawData.map(row => ({
      COUNTRY_CODE: row.COUNTRY_CODE || '',
      COUNTRY_NAME: row.COUNTRY_NAME || '',
      REGION: row.REGION || '',
      ISO2: row.ISO2 || '',
      ISO3: row.ISO3 || '',
      OBSOLETE: row.OBSOLETE || '0'
    }));
    
    // DEBUG: Log Eswatini/Swaziland entries specifically
    const eswatiniEntries = countries.filter(c => c.COUNTRY_CODE === '4030');
    // Debug: Eswatini/Swaziland obsolete status check
    // console.debug('ESWATINI/SWAZILAND ENTRIES:', eswatiniEntries);
    
    return countries;
    
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    throw new Error(`Failed to fetch countries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Fetch and combine duty stations with country names
export async function fetchDutyStationsWithCountries(): Promise<DutyStation[]> {
  try {
    const [dutyStations, countries] = await Promise.all([
      fetchDutyStations(),
      fetchCountries()
    ]);
    
    // Create country lookup map, filtering out obsolete countries
    // When duplicate country codes exist, prioritize non-obsolete entries
    const countryMap = new Map<string, string>();
    
    // DEBUG: Log country filtering process
    // Building country map (excluding obsolete countries)
    
    // First pass: add all non-obsolete countries
    countries.forEach(country => {
      if (country.OBSOLETE !== '1') {
        countryMap.set(country.COUNTRY_CODE, country.COUNTRY_NAME);
      }
    });
    
    // Second pass: add obsolete countries only if no non-obsolete entry exists
    // This ensures backward compatibility for edge cases
    countries.forEach(country => {
      if (country.OBSOLETE === '1' && !countryMap.has(country.COUNTRY_CODE)) {
        countryMap.set(country.COUNTRY_CODE, country.COUNTRY_NAME);
      }
    });
    
    // DEBUG: Check what's in the map for code 4030
    // Country map built successfully
    
    // Add country names to duty stations
    const enrichedDutyStations = dutyStations.map(station => ({
      ...station,
      COUNTRY: countryMap.get(station.COUNTRY_CODE) || 'N/A'
    }));
    
    // Sort by name
    enrichedDutyStations.sort((a, b) => a.CITY_NAME.localeCompare(b.CITY_NAME));
    
    // Successfully loaded duty stations with country data
    return enrichedDutyStations;
    
  } catch (error) {
    console.error('Failed to fetch duty stations with countries:', error);
    throw error;
  }
}

// Generic API response wrapper
export function createApiResponse<T>(
  data: T, 
  success: boolean = true, 
  error?: string
): ApiResponse<T> {
  return {
    data,
    success,
    error,
    timestamp: new Date()
  };
}

// Cache management
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCachedData<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
}

// Clear specific cache key or all cache
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
    // Cache cleared for specific key
  } else {
    cache.clear();
    // All cache cleared
  }
}

// Cached fetch functions
export async function fetchDutyStationsWithCountriesCached(forceRefresh: boolean = false): Promise<DutyStation[]> {
  const cacheKey = 'duty-stations-with-countries';
  
  // Clear cache if force refresh is requested
  if (forceRefresh) {
    clearCache(cacheKey);
  }
  
  const cached = getCachedData<DutyStation[]>(cacheKey);
  
  if (cached) {
    // Using cached duty stations data
    return cached;
  }
  
  // Fetching fresh duty stations data
  const data = await fetchDutyStationsWithCountries();
  setCachedData(cacheKey, data);
  return data;
}
