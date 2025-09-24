// Core duty station interfaces based on CSV data structure

export interface DutyStation {
  DS: string;           // Duty Station Code
  CTY: string;          // Country Code  
  NAME: string;         // City Name
  LATITUDE: number;     // Latitude coordinate
  LONGITUDE: number;    // Longitude coordinate
  COMMONNAME: string;   // Common/Alternative name
  OBSOLETE: string;     // Obsolete flag ("0" or "1")
  COUNTRY?: string;     // Country name (joined from countries data)
}

export interface Country {
  CTYCD: string;        // Country Code
  NAME: string;         // Country Name
}

// Search and filter interfaces
export interface DutyStationFilters {
  searchText: string;
  searchField: 'NAME' | 'COUNTRY' | 'COMMONNAME';
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
