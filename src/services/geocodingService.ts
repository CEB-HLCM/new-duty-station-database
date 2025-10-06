// Geocoding service for address <-> coordinates conversion
// Uses OpenStreetMap Nominatim API for free geocoding

import type { MapCoordinates } from '../types/dutyStation';

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    country?: string;
    country_code?: string;
  };
}

interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  city?: string;
  country?: string;
  countryCode?: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const REQUEST_DELAY = 1000; // Nominatim requires 1 request per second
let lastRequestTime = 0;

// Rate limiting helper
const waitForRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
};

/**
 * Convert address to coordinates (forward geocoding)
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  try {
    await waitForRateLimit();

    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1',
      addressdetails: '1'
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'UN-Duty-Station-Database/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data: NominatimResponse[] = await response.json();

    if (data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      city: result.address?.city,
      country: result.address?.country,
      countryCode: result.address?.country_code?.toUpperCase()
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Convert coordinates to address (reverse geocoding)
 */
export const reverseGeocode = async (
  coordinates: MapCoordinates
): Promise<GeocodingResult | null> => {
  try {
    await waitForRateLimit();

    const params = new URLSearchParams({
      lat: coordinates.latitude.toString(),
      lon: coordinates.longitude.toString(),
      format: 'json',
      addressdetails: '1'
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
      headers: {
        'User-Agent': 'UN-Duty-Station-Database/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const data: NominatimResponse = await response.json();

    return {
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lon),
      displayName: data.display_name,
      city: data.address?.city,
      country: data.address?.country,
      countryCode: data.address?.country_code?.toUpperCase()
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Validate coordinates are within valid ranges
 */
export const validateCoordinates = (coordinates: MapCoordinates): boolean => {
  const { latitude, longitude } = coordinates;
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Calculate distance between two points in kilometers (Haversine formula)
 */
export const calculateDistance = (
  point1: MapCoordinates,
  point2: MapCoordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Find nearby duty stations within a given radius
 */
export const findNearbyStations = (
  center: MapCoordinates,
  stations: Array<{ LATITUDE: number; LONGITUDE: number }>,
  radiusKm: number
): Array<{ LATITUDE: number; LONGITUDE: number; distance: number }> => {
  return stations
    .map(station => ({
      ...station,
      distance: calculateDistance(center, {
        latitude: station.LATITUDE,
        longitude: station.LONGITUDE
      })
    }))
    .filter(station => station.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};


