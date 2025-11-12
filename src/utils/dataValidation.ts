import type { DutyStation, Country } from '../types';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// CSV validation configuration
export interface ValidationConfig {
  requiredFields: string[];
  optionalFields: string[];
  coordinateValidation: boolean;
  duplicateCheck: boolean;
}

// Default validation configurations
// Updated to use new CSV field names (December 2025)
export const DUTY_STATION_VALIDATION_CONFIG: ValidationConfig = {
  requiredFields: ['CITY_CODE', 'COUNTRY_CODE', 'CITY_NAME'],
  optionalFields: ['LATITUDE', 'LONGITUDE', 'CITY_COMMON_NAME', 'OBSOLETE'],
  coordinateValidation: true,
  duplicateCheck: true,
};

export const COUNTRY_VALIDATION_CONFIG: ValidationConfig = {
  requiredFields: ['COUNTRY_CODE', 'COUNTRY_NAME'],
  optionalFields: [],
  coordinateValidation: false,
  duplicateCheck: true,
};

// Validate individual duty station
export function validateDutyStation(station: Partial<DutyStation>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (!station.CITY_CODE?.trim()) {
    errors.push('Duty Station code (CITY_CODE) is required');
  } else if (!/^[A-Z0-9]{2,6}$/.test(station.CITY_CODE.trim())) {
    warnings.push('Duty Station code should be 2-6 uppercase alphanumeric characters');
  }

  if (!station.COUNTRY_CODE?.trim()) {
    errors.push('Country code (COUNTRY_CODE) is required');
  } else if (!/^[A-Z0-9]{2,10}$/.test(station.COUNTRY_CODE.trim())) {
    warnings.push('Country code should be 2-10 alphanumeric characters');
  }

  if (!station.CITY_NAME?.trim()) {
    errors.push('City name (CITY_NAME) is required');
  } else if (station.CITY_NAME.trim().length < 2) {
    warnings.push('City name should be at least 2 characters long');
  }

  // Coordinate validation
  if (station.LATITUDE !== undefined) {
    const lat = Number(station.LATITUDE);
    if (isNaN(lat)) {
      errors.push('Latitude must be a valid number');
    } else if (lat < -90 || lat > 90) {
      errors.push('Latitude must be between -90 and 90 degrees');
    }
  }

  if (station.LONGITUDE !== undefined) {
    const lng = Number(station.LONGITUDE);
    if (isNaN(lng)) {
      errors.push('Longitude must be a valid number');
    } else if (lng < -180 || lng > 180) {
      errors.push('Longitude must be between -180 and 180 degrees');
    }
  }

  // Coordinate consistency check
  if (station.LATITUDE !== undefined && station.LONGITUDE !== undefined) {
    const lat = Number(station.LATITUDE);
    const lng = Number(station.LONGITUDE);
    
    if ((lat === 0 && lng === 0) && station.CITY_NAME !== 'Unknown') {
      warnings.push('Coordinates (0,0) may indicate missing location data');
    }
  }

  // OBSOLETE field validation
  if (station.OBSOLETE !== undefined && !['0', '1', ''].includes(station.OBSOLETE)) {
    errors.push('OBSOLETE field must be "0", "1", or empty');
  }

  // Common name validation
  if (station.CITY_COMMON_NAME && station.CITY_COMMON_NAME.trim().length < 2) {
    warnings.push('Common name should be at least 2 characters long if provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate individual country
export function validateCountry(country: Partial<Country>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (!country.COUNTRY_CODE?.trim()) {
    errors.push('Country code (COUNTRY_CODE) is required');
  } else if (!/^[A-Z0-9]{2,10}$/.test(country.COUNTRY_CODE.trim())) {
    warnings.push('Country code should be 2-10 alphanumeric characters');
  }

  if (!country.COUNTRY_NAME?.trim()) {
    errors.push('Country name (COUNTRY_NAME) is required');
  } else if (country.COUNTRY_NAME.trim().length < 2) {
    warnings.push('Country name should be at least 2 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate array of duty stations
export function validateDutyStationsArray(stations: Partial<DutyStation>[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const duplicateCodes = new Set<string>();
  const seenCodes = new Set<string>();

  // Validate each station
  stations.forEach((station, index) => {
    const result = validateDutyStation(station);
    
    // Add context to errors and warnings
    result.errors.forEach(error => {
      errors.push(`Row ${index + 1}: ${error}`);
    });
    
    result.warnings.forEach(warning => {
      warnings.push(`Row ${index + 1}: ${warning}`);
    });

    // Check for duplicate codes
    if (station.CITY_CODE?.trim()) {
      const code = station.CITY_CODE.trim();
      if (seenCodes.has(code)) {
        duplicateCodes.add(code);
      } else {
        seenCodes.add(code);
      }
    }
  });

  // Report duplicate codes
  duplicateCodes.forEach(code => {
    errors.push(`Duplicate duty station code found: ${code}`);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate array of countries
export function validateCountriesArray(countries: Partial<Country>[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const duplicateCodes = new Set<string>();
  const seenCodes = new Set<string>();

  // Validate each country
  countries.forEach((country, index) => {
    const result = validateCountry(country);
    
    // Add context to errors and warnings
    result.errors.forEach(error => {
      errors.push(`Row ${index + 1}: ${error}`);
    });
    
    result.warnings.forEach(warning => {
      warnings.push(`Row ${index + 1}: ${warning}`);
    });

    // Check for duplicate codes
    if (country.COUNTRY_CODE?.trim()) {
      const code = country.COUNTRY_CODE.trim();
      if (seenCodes.has(code)) {
        duplicateCodes.add(code);
      } else {
        seenCodes.add(code);
      }
    }
  });

  // Report duplicate codes
  duplicateCodes.forEach(code => {
    errors.push(`Duplicate country code found: ${code}`);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate CSV data structure
export function validateCSVStructure(
  data: Record<string, string>[],
  config: ValidationConfig
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || data.length === 0) {
    errors.push('CSV data is empty or invalid');
    return { isValid: false, errors, warnings };
  }

  // Check if all required fields are present in the first row
  const firstRow = data[0];
  const availableFields = Object.keys(firstRow);
  
  config.requiredFields.forEach(field => {
    if (!availableFields.includes(field)) {
      errors.push(`Required field "${field}" is missing from CSV structure`);
    }
  });

  // Check for unexpected fields
  const expectedFields = [...config.requiredFields, ...config.optionalFields];
  availableFields.forEach(field => {
    if (!expectedFields.includes(field)) {
      warnings.push(`Unexpected field "${field}" found in CSV data`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Cross-reference validation between duty stations and countries
export function validateDataConsistency(
  dutyStations: DutyStation[],
  countries: Country[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Create country code lookup
  const countryCodesSet = new Set(countries.map(c => c.COUNTRY_CODE));

  // Check if all duty station country codes exist in countries data
  const missingCountryCodes = new Set<string>();
  dutyStations.forEach(station => {
    if (station.COUNTRY_CODE && !countryCodesSet.has(station.COUNTRY_CODE)) {
      missingCountryCodes.add(station.COUNTRY_CODE);
    }
  });

  missingCountryCodes.forEach(code => {
    warnings.push(`Country code "${code}" used in duty stations but not found in countries data`);
  });

  // Check for countries with no duty stations
  const usedCountryCodes = new Set(dutyStations.map(s => s.COUNTRY_CODE));
  const unusedCountries = countries.filter(c => !usedCountryCodes.has(c.COUNTRY_CODE));
  
  if (unusedCountries.length > 0) {
    warnings.push(`${unusedCountries.length} countries have no associated duty stations`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Sanitize and clean CSV data
export function sanitizeCSVData<T>(data: Record<string, string>[]): T[] {
  return data.map(row => {
    const cleanRow: Record<string, any> = {};
    
    Object.entries(row).forEach(([key, value]) => {
      // Trim whitespace
      let cleanValue: any = typeof value === 'string' ? value.trim() : value;
      
      // Convert numeric strings to numbers for specific fields
      if (['LATITUDE', 'LONGITUDE'].includes(key) && typeof cleanValue === 'string') {
        // Handle comma decimal separators
        cleanValue = cleanValue.replace(',', '.');
        const numValue = parseFloat(cleanValue);
        cleanValue = isNaN(numValue) ? 0 : numValue;
      }
      
      // Normalize boolean-like fields
      if (key === 'OBSOLETE' && typeof cleanValue === 'string') {
        cleanValue = cleanValue === '1' ? '1' : '0';
      }
      
      cleanRow[key] = cleanValue;
    });
    
    return cleanRow as T;
  });
}

// Generate validation report
export function generateValidationReport(
  dutyStationsResult: ValidationResult,
  countriesResult: ValidationResult,
  consistencyResult: ValidationResult
): string {
  const report: string[] = [];
  
  report.push('=== DATA VALIDATION REPORT ===\n');
  
  // Duty stations validation
  report.push('DUTY STATIONS VALIDATION:');
  report.push(`Status: ${dutyStationsResult.isValid ? 'PASSED' : 'FAILED'}`);
  report.push(`Errors: ${dutyStationsResult.errors.length}`);
  report.push(`Warnings: ${dutyStationsResult.warnings.length}\n`);
  
  if (dutyStationsResult.errors.length > 0) {
    report.push('Errors:');
    dutyStationsResult.errors.forEach(error => report.push(`  - ${error}`));
    report.push('');
  }
  
  if (dutyStationsResult.warnings.length > 0) {
    report.push('Warnings:');
    dutyStationsResult.warnings.forEach(warning => report.push(`  - ${warning}`));
    report.push('');
  }
  
  // Countries validation
  report.push('COUNTRIES VALIDATION:');
  report.push(`Status: ${countriesResult.isValid ? 'PASSED' : 'FAILED'}`);
  report.push(`Errors: ${countriesResult.errors.length}`);
  report.push(`Warnings: ${countriesResult.warnings.length}\n`);
  
  if (countriesResult.errors.length > 0) {
    report.push('Errors:');
    countriesResult.errors.forEach(error => report.push(`  - ${error}`));
    report.push('');
  }
  
  if (countriesResult.warnings.length > 0) {
    report.push('Warnings:');
    countriesResult.warnings.forEach(warning => report.push(`  - ${warning}`));
    report.push('');
  }
  
  // Consistency validation
  report.push('DATA CONSISTENCY VALIDATION:');
  report.push(`Status: ${consistencyResult.isValid ? 'PASSED' : 'FAILED'}`);
  report.push(`Errors: ${consistencyResult.errors.length}`);
  report.push(`Warnings: ${consistencyResult.warnings.length}\n`);
  
  if (consistencyResult.errors.length > 0) {
    report.push('Errors:');
    consistencyResult.errors.forEach(error => report.push(`  - ${error}`));
    report.push('');
  }
  
  if (consistencyResult.warnings.length > 0) {
    report.push('Warnings:');
    consistencyResult.warnings.forEach(warning => report.push(`  - ${warning}`));
    report.push('');
  }
  
  const overallValid = dutyStationsResult.isValid && countriesResult.isValid && consistencyResult.isValid;
  report.push(`OVERALL STATUS: ${overallValid ? 'VALIDATION PASSED' : 'VALIDATION FAILED'}`);
  
  return report.join('\n');
}
