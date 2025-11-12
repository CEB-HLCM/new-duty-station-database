// Core duty station interfaces based on CSV data structure
// Updated to match new CSV field names (December 2025)

export interface DutyStation {
  CITY_CODE: string;           // Duty Station Code (formerly DS)
  COUNTRY_CODE: string;        // Country Code (formerly CTY)
  CITY_NAME: string;          // City Name (formerly NAME)
  LATITUDE: number;            // Latitude coordinate
  LONGITUDE: number;           // Longitude coordinate
  CITY_COMMON_NAME: string;    // Common/Alternative name (formerly COMMONNAME)
  OBSOLETE: string;            // Obsolete flag ("0" or "1")
  COUNTRY?: string;            // Country name (joined from countries data)
  REGION?: string;             // Geographic region (Africa, Asia, Europe, Americas, Oceania)
  // CLASS field removed - no longer in CSV
}

export interface Country {
  COUNTRY_CODE: string;        // Country Code (formerly CTYCD)
  COUNTRY_NAME: string;        // Country Name (formerly NAME)
  REGION?: string;             // Geographic region (Africa, Asia, Europe, Americas, Oceania)
  ISO2?: string;               // ISO 2-letter country code
  ISO3?: string;               // ISO 3-letter country code
  OBSOLETE?: string;           // Obsolete flag ("0" or "1")
}

// Search and filter interfaces
export interface DutyStationFilters {
  searchText: string;
  searchField: 'CITY_NAME' | 'COUNTRY' | 'CITY_COMMON_NAME';
  showObsolete: boolean;
  countryFilter?: string;
}

export interface DutyStationSearchResult extends DutyStation {
  score?: number;       // For fuzzy search results
  matchedFields?: string[];
}

// Map-related interfaces
export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export interface MapBounds {
  northEast: MapCoordinates;
  southWest: MapCoordinates;
}

export interface DutyStationMarker extends DutyStation {
  isSelected?: boolean;
  isHighlighted?: boolean;
}

// Request management interfaces
export interface DutyStationRequest {
  id: string;
  type: 'ADD' | 'UPDATE' | 'REMOVE';
  dutyStation: Partial<DutyStation>;
  originalDutyStation?: DutyStation;
  justification: string;
  contactInfo: {
    name: string;
    email: string;
    organization: string;
  };
  status: 'DRAFT' | 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

// Form validation interfaces
export interface DutyStationFormData {
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  commonName?: string;
  justification: string;
}

// API response interfaces
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface DutyStationApiResponse extends ApiResponse<DutyStation[]> {
  totalCount: number;
  page?: number;
  pageSize?: number;
}

// Pagination interfaces
export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: keyof DutyStation;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResults<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
