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
    console.log('Fetching duty stations from:', DUTY_STATIONS_CSV_URL);
    
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
    console.log('Fetching countries from:', COUNTRIES_CSV_URL);
    
    const response = await fetch(COUNTRIES_CSV_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const rawData = parseCSV(csvText);
    
    // DEBUG: Log the first few rows to see actual structure
    console.log('🔍 COUNTRIES CSV - First row keys:', Object.keys(rawData[0]));
    console.log('🔍 COUNTRIES CSV - First 3 rows:', rawData.slice(0, 3));
    
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
    console.log('🔍 ESWATINI/SWAZILAND ENTRIES:', eswatiniEntries);
    eswatiniEntries.forEach(entry => {
      console.log(`   - ${entry.COUNTRY_NAME}: OBSOLETE="${entry.OBSOLETE}" (type: ${typeof entry.OBSOLETE}, value: ${JSON.stringify(entry.OBSOLETE)})`);
    });
    
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
    console.log('🔍 Building country map...');
    
    // First pass: add all non-obsolete countries
    countries.forEach(country => {
      if (country.COUNTRY_CODE === '4030') {
        console.log(`🔍 Checking ${country.COUNTRY_NAME}: OBSOLETE="${country.OBSOLETE}" (comparing !== '1': ${country.OBSOLETE !== '1'})`);
      }
      
      if (country.OBSOLETE !== '1') {
        countryMap.set(country.COUNTRY_CODE, country.COUNTRY_NAME);
        if (country.COUNTRY_CODE === '4030') {
          console.log('✅ Added NON-OBSOLETE:', country);
        }
      } else if (country.COUNTRY_CODE === '4030') {
        console.log('❌ Skipped OBSOLETE:', country);
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
    console.log('🔍 Country code 4030 maps to:', countryMap.get('4030'));
    
    // Add country names to duty stations
    const enrichedDutyStations = dutyStations.map(station => ({
      ...station,
      COUNTRY: countryMap.get(station.COUNTRY_CODE) || 'N/A'
    }));
    
    // Sort by name
    enrichedDutyStations.sort((a, b) => a.CITY_NAME.localeCompare(b.CITY_NAME));
    
    console.log(`Successfully loaded ${enrichedDutyStations.length} duty stations with country data`);
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
    console.log(`Cache cleared for key: ${key}`);
  } else {
    cache.clear();
    console.log('All cache cleared');
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
    console.log('Using cached duty stations data');
    return cached;
  }
  
  console.log('Fetching fresh duty stations data...');
  const data = await fetchDutyStationsWithCountries();
  setCachedData(cacheKey, data);
  return data;
}
