// Duty Station Code Generation Utility
import type { DutyStation } from '../types/dutyStation';
import type { DutyStationRequest } from '../schemas/dutyStationSchema';

/**
 * Deburr function - removes diacritics from strings
 * Simple implementation for code generation
 */
const deburr = (str: string): string => {
  const map: Record<string, string> = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
    'ý': 'y', 'ÿ': 'y',
    'ñ': 'n', 'ç': 'c',
  };
  
  return str
    .split('')
    .map(char => map[char.toLowerCase()] || char)
    .join('')
    .toUpperCase();
};

/**
 * Generate a unique Duty Station Code
 * Format: First 2 letters of city name (deburred) + 3-digit number (001-999)
 * 
 * @param cityName - Name of the city
 * @param existingStations - Array of existing duty stations to check for duplicates
 * @param existingRequests - Array of existing requests in basket to check for duplicates
 * @returns Generated code (e.g., "PA001", "GE042")
 */
export const generateDutyStationCode = (
  cityName: string,
  existingStations: DutyStation[] = [],
  existingRequests: DutyStationRequest[] = []
): string => {
  if (!cityName || cityName.length < 2) {
    throw new Error('City name must be at least 2 characters');
  }

  // Get first 2 letters, deburr, and uppercase
  const deburredName = deburr(cityName.trim());
  const firstTwoLetters = deburredName.slice(0, 2).toUpperCase();
  
  // Ensure we have exactly 2 letters (handle special characters)
  if (firstTwoLetters.length < 2 || !/^[A-Z]{2}$/.test(firstTwoLetters)) {
    // Fallback: use first 2 alphanumeric characters
    const alphanumeric = deburredName.replace(/[^A-Z0-9]/g, '').slice(0, 2);
    if (alphanumeric.length < 2) {
      throw new Error('City name must contain at least 2 letters');
    }
    const codePrefix = alphanumeric.padEnd(2, 'X').toUpperCase();
    return generateCodeWithPrefix(codePrefix, existingStations, existingRequests);
  }

  return generateCodeWithPrefix(firstTwoLetters, existingStations, existingRequests);
};

/**
 * Generate code with given prefix, checking for uniqueness
 */
const generateCodeWithPrefix = (
  prefix: string,
  existingStations: DutyStation[],
  existingRequests: DutyStationRequest[]
): string => {
  // Create array of numbers 1-999 and shuffle
  const numbers = Array.from({ length: 999 }, (_, i) => i + 1);
  const shuffled = numbers.sort(() => Math.random() - 0.5);

  // Check existing station codes
  const existingCodes = new Set<string>();
  existingStations.forEach(station => {
    if (station.CITY_CODE) {
      existingCodes.add(station.CITY_CODE.toUpperCase());
    }
  });

  // Check existing request codes (for ADD requests)
  existingRequests.forEach(request => {
    if (request.requestType === 'add' && request.proposedCode) {
      existingCodes.add(request.proposedCode.toUpperCase());
    }
  });

  // Find first available code
  for (const num of shuffled) {
    const code = `${prefix}${num.toString().padStart(3, '0')}`;
    if (!existingCodes.has(code)) {
      return code;
    }
  }

  // If all codes are taken (unlikely), throw error
  throw new Error(`Unable to generate unique code for prefix ${prefix}. All codes (001-999) are taken.`);
};

/**
 * Get region from country code
 */
export const getRegionFromCountryCode = (
  countryCode: string,
  countries: Array<{ COUNTRY_CODE: string; REGION?: string }>
): string | undefined => {
  const country = countries.find(c => c.COUNTRY_CODE === countryCode);
  return country?.REGION;
};

