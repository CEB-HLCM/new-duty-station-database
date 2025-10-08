// Data service following proven CEB pattern for CSV fetching

import type { DutyStation, Country, ApiResponse } from '../types';

// GitHub raw URLs for CSV data
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/CEB-HLCM/HR-Public-Codes/refs/heads/main';
const DUTY_STATIONS_CSV_URL = `${GITHUB_RAW_BASE}/DSCITYCD.csv`;
const COUNTRIES_CSV_URL = `${GITHUB_RAW_BASE}/DSCTRYCD.csv`;

// CSV parsing utility
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
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
    const dutyStations: DutyStation[] = rawData.map(row => ({
      DS: row.DS || '',
      CTY: row.CTY || '',
      NAME: row.NAME || '',
      LATITUDE: parseFloat(row.LATITUDE?.replace(',', '.') || '0'),
      LONGITUDE: parseFloat(row.LONGITUDE?.replace(',', '.') || '0'),
      COMMONNAME: row.COMMONNAME || '',
      OBSOLETE: row.OBSOLETE || '0',
      REGION: row.REGION || '',
      CLASS: row.CLASS || ''
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
    
    // Transform raw CSV data to Country interface
    return rawData.map(row => ({
      CTYCD: row.CTYCD || '',
      NAME: row.NAME || '',
      REGION: row.REGION || '',
      ISO2: row.ISO2 || '',
      ISO3: row.ISO3 || ''
    }));
    
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
    
    // Create country lookup map
    const countryMap = new Map<string, string>();
    countries.forEach(country => {
      countryMap.set(country.CTYCD, country.NAME);
    });
    
    // Add country names to duty stations
    const enrichedDutyStations = dutyStations.map(station => ({
      ...station,
      COUNTRY: countryMap.get(station.CTY) || 'N/A'
    }));
    
    // Sort by name
    enrichedDutyStations.sort((a, b) => a.NAME.localeCompare(b.NAME));
    
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

// Cached fetch functions
export async function fetchDutyStationsWithCountriesCached(): Promise<DutyStation[]> {
  const cacheKey = 'duty-stations-with-countries';
  const cached = getCachedData<DutyStation[]>(cacheKey);
  
  if (cached) {
    console.log('Using cached duty stations data');
    return cached;
  }
  
  const data = await fetchDutyStationsWithCountries();
  setCachedData(cacheKey, data);
  return data;
}
