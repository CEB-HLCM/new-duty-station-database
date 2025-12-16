// Location Service - City validation and geocoding with GeoNames
import type { MapCoordinates } from '../types/dutyStation';

/**
 * GeoNames search result
 */
export interface GeoNamesResult {
  title: string;
  summary: string;
  lat: number;
  lng: number;
  countryCode: string;
  wikipediaUrl?: string;
}

/**
 * City search result with validation
 */
export interface CitySearchResult {
  name: string;
  country: string;
  countryCode: string;
  coordinates: MapCoordinates;
  summary?: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Search for cities using GeoNames Wikipedia API
 * This validates that the city name is real and provides accurate coordinates
 */
export const searchCities = async (
  cityName: string,
  countryFilter?: string
): Promise<CitySearchResult[]> => {
  if (!cityName || cityName.length < 2) {
    return [];
  }

  try {
    // Using GeoNames Wikipedia Search API (free, no API key needed for basic usage)
    // For production, register for a free username at geonames.org
    const username = 'demo'; // Replace with actual username for production
    const url = `https://secure.geonames.org/wikipediaSearchJSON?q=${encodeURIComponent(
      cityName
    )}&maxRows=20&username=${username}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('GeoNames API error:', response.status);
      return [];
    }

    const data = await response.json();

    if (!data.geonames || data.geonames.length === 0) {
      return [];
    }

    // Filter and map results
    let results: CitySearchResult[] = data.geonames
      .filter((result: GeoNamesResult) => {
        // Filter by country if specified
        if (countryFilter) {
          return result.countryCode === countryFilter;
        }
        return true;
      })
      .map((result: GeoNamesResult) => {
        // Determine confidence based on exact match
        const isExactMatch = result.title.toLowerCase() === cityName.toLowerCase();
        const isStartsWith = result.title.toLowerCase().startsWith(cityName.toLowerCase());
        
        return {
          name: result.title,
          country: result.countryCode, // We'll map this to full country name later
          countryCode: result.countryCode,
          coordinates: {
            latitude: result.lat,
            longitude: result.lng,
          },
          summary: result.summary,
          confidence: isExactMatch ? 'high' : isStartsWith ? 'medium' : 'low',
        };
      });

    // Sort by confidence
    results.sort((a, b) => {
      const confidenceOrder = { high: 0, medium: 1, low: 2 };
      return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
    });

    return results;
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
};

/**
 * Alternative: Search using Nominatim (OpenStreetMap)
 * More reliable for production without API key requirements
 */
export const searchCitiesNominatim = async (
  cityName: string,
  countryName?: string
): Promise<CitySearchResult[]> => {
  if (!cityName || cityName.length < 2) {
    return [];
  }

  try {
    // Search broadly first (without country constraint in query)
    // Then filter by country in results - this allows partial matching
    // "kin" can now match "Kingston" because we get broader results
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(cityName)}` +
      `&format=json&limit=50&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UN-Duty-Station-Codes-App', // Required by Nominatim
      },
    });

    // Rate limiting (1 request per second for Nominatim)
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!response.ok) {
      console.error('Nominatim API error:', response.status);
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Define interface for internal use with importance field
    interface CitySearchResultWithImportance extends CitySearchResult {
      importance: number;
    }

    const filtered: CitySearchResultWithImportance[] = data
      .filter((result: any) => {
        // STEP 1: Filter by country if specified (strict matching)
        if (countryName) {
          const resultCountry = result.address?.country?.toLowerCase() || null;
          const searchCountry = countryName.toLowerCase();
          
          // Reject if result has no country (e.g., "North Sea")
          if (!resultCountry) {
            return false;
          }
          
          // Must match the country name (partial match for flexibility)
          // e.g., "Jamaica" matches "jamaica" or "United States" matches "united states"
          if (!resultCountry.includes(searchCountry) && !searchCountry.includes(resultCountry)) {
            return false;
          }
        }
        
        // STEP 2: Include cities, towns, villages, capitals, and all settlement types
        // Less restrictive filtering to catch capitals like Kingston and small towns like Junction
        const validTypes = [
          'city', 'town', 'village', 'municipality', 'administrative',
          'suburb', 'neighbourhood', 'hamlet', 'locality',
          'capital', 'state_capital', 'county_seat',  // Capital cities
          'district', 'quarter', 'borough',  // Urban subdivisions
          'settlement', 'populated_place'  // General settlements
        ];
        const resultType = result.type?.toLowerCase() || '';
        const resultClass = result.class?.toLowerCase() || '';
        
        // Accept if type is valid OR if it's a place/boundary (less restrictive)
        return validTypes.includes(resultType) || resultClass === 'place' || resultClass === 'boundary';
      })
      .map((result: any): CitySearchResultWithImportance => {
        const displayName = result.display_name || '';
        const parts = displayName.split(',').map((p: string) => p.trim());
        const cityName = parts[0] || result.name;
        const country = result.address?.country || parts[parts.length - 1];
        const countryCode = result.address?.country_code?.toUpperCase() || '';
        const importance = result.importance || 0;
        const confidence: 'high' | 'medium' | 'low' = importance > 0.5 ? 'high' : importance > 0.3 ? 'medium' : 'low';

        return {
          name: cityName,
          country: country,
          countryCode: countryCode,
          coordinates: {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
          },
          summary: displayName,
          confidence: confidence,
          importance: importance,
        };
      });
    
    // Deduplicate by name and coordinate proximity (within ~5km = 0.05 degrees)
    const deduplicated = filtered.reduce((acc: CitySearchResultWithImportance[], current: CitySearchResultWithImportance) => {
      const isDuplicate = acc.some(item => 
        item.name === current.name &&
        Math.abs(item.coordinates.latitude - current.coordinates.latitude) < 0.05 &&
        Math.abs(item.coordinates.longitude - current.coordinates.longitude) < 0.05
      );
      
      if (!isDuplicate) {
        acc.push(current);
      } else {
        // Keep the one with higher importance
        const existingIndex = acc.findIndex(item => 
          item.name === current.name &&
          Math.abs(item.coordinates.latitude - current.coordinates.latitude) < 0.05 &&
          Math.abs(item.coordinates.longitude - current.coordinates.longitude) < 0.05
        );
        if (existingIndex !== -1 && current.importance > acc[existingIndex].importance) {
          acc[existingIndex] = current; // Replace with higher importance result
        }
      }
      
      return acc;
    }, [] as CitySearchResultWithImportance[]);
    
    // Sort by confidence (high > medium > low)
    const sorted = deduplicated.sort((a, b) => {
      const confidenceOrder: Record<'high' | 'medium' | 'low', number> = { high: 0, medium: 1, low: 2 };
      return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
    });
    
    // Remove temporary importance field before returning
    const results = sorted.map(({ importance, ...rest }) => rest);
    
    return results;
  } catch (error) {
    console.error('Error searching cities with Nominatim:', error);
    return [];
  }
};

/**
 * Validate if coordinates match a city location
 */
export const validateCoordinates = async (
  coordinates: MapCoordinates
): Promise<{ valid: boolean; cityName?: string; country?: string }> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.latitude}&lon=${coordinates.longitude}&format=json&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UN-Duty-Station-Codes-App',
      },
    });

    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit

    if (!response.ok) {
      return { valid: false };
    }

    const data = await response.json();

    if (data.address) {
      const cityName =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.municipality;
      const country = data.address.country;

      return {
        valid: !!cityName,
        cityName,
        country,
      };
    }

    return { valid: false };
  } catch (error) {
    console.error('Error validating coordinates:', error);
    return { valid: false };
  }
};

