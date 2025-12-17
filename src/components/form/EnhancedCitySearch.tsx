// Enhanced City Search Component with LOCAL DATABASE SEARCH FIRST + API validation
// CRITICAL: Prevents duplicate duty stations by checking local database first
import { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
  Chip,
  Alert,
  Button,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Public as PublicIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { searchCitiesNominatim, type CitySearchResult } from '../../services/locationService';
import { debounce } from '@mui/material/utils';
import { useAppData } from '../../hooks/useAppData';

interface EnhancedCitySearchProps {
  onCitySelect: (result: CitySearchResult) => void;
  onManualEntry?: (cityName: string) => void; // New callback for manual entry
  countryFilter?: string;
  countryName?: string;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

// Extended result type to include duplicate detection
interface ExtendedCitySearchResult extends CitySearchResult {
  isDuplicate?: boolean;
  existingCityCode?: string;
}

/**
 * Enhanced City Search Component
 * PHASE 1: Searches LOCAL database first to prevent duplicates (works with 2+ letters)
 * PHASE 2: Searches external API for NEW cities only (requires 4+ letters)
 */
export const EnhancedCitySearch: React.FC<EnhancedCitySearchProps> = ({
  onCitySelect,
  onManualEntry,
  countryFilter,
  countryName,
  label = 'City/Town Name',
  required = false,
  error = false,
  helperText,
}) => {
  const { dutyStations } = useAppData(); // Access local database
  const [inputValue, setInputValue] = useState('');
  const [lastSearchTerm, setLastSearchTerm] = useState(''); // Store the search term for manual entry
  const [options, setOptions] = useState<ExtendedCitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<ExtendedCitySearchResult | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [manualEntryMode, setManualEntryMode] = useState(false);
  const [showNoResultsHelp, setShowNoResultsHelp] = useState(false);

  // HYBRID SEARCH: Local database first, then API for new cities
  const searchCities = useCallback(
    debounce(async (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 2) {
        setOptions([]);
        setDuplicateWarning(null);
        setShowNoResultsHelp(false);
        return;
      }

      // Store search term for manual entry fallback
      setLastSearchTerm(searchTerm);
      setLoading(true);
      const allResults: ExtendedCitySearchResult[] = [];

      try {
        // ========================================
        // PHASE 1: SEARCH LOCAL DATABASE FIRST
        // ========================================
        // This prevents duplicates and works with 2+ letters
        const searchLower = searchTerm.toLowerCase().trim();
        
        // Filter duty stations by search term
        let localMatches = dutyStations.filter(station => {
          // Skip obsolete stations
          if (station.OBSOLETE === '1') return false;
          
          // Match by city name (starts with or contains)
          const cityNameMatch = station.CITY_NAME.toLowerCase().includes(searchLower);
          
          // Match by common name if available
          const commonNameMatch = station.CITY_COMMON_NAME?.toLowerCase().includes(searchLower);
          
          return cityNameMatch || commonNameMatch;
        });

        // Filter by country if specified
        if (countryName) {
          localMatches = localMatches.filter(station => 
            station.COUNTRY?.toLowerCase() === countryName.toLowerCase()
          );
        }

        // Convert local matches to CitySearchResult format and mark as duplicates
        const localResults: ExtendedCitySearchResult[] = localMatches.map(station => ({
          name: station.CITY_NAME,
          country: station.COUNTRY || 'Unknown',
          countryCode: station.COUNTRY_CODE,
          coordinates: {
            latitude: station.LATITUDE,
            longitude: station.LONGITUDE,
          },
          confidence: 'high' as const,
          isDuplicate: true, // CRITICAL: Mark as duplicate to prevent re-adding
          existingCityCode: station.CITY_CODE,
          summary: `${station.CITY_NAME}, ${station.COUNTRY} - ALREADY EXISTS in database`,
        }));

        // Sort local results by relevance (exact match first, then starts-with, then contains)
        localResults.sort((a, b) => {
          const aExact = a.name.toLowerCase() === searchLower;
          const bExact = b.name.toLowerCase() === searchLower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          const aStarts = a.name.toLowerCase().startsWith(searchLower);
          const bStarts = b.name.toLowerCase().startsWith(searchLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;

          return a.name.localeCompare(b.name);
        });

        allResults.push(...localResults);

        // ========================================
        // PHASE 2: SEARCH API FOR NEW CITIES
        // ========================================
        // Only search API if:
        // 1. User typed 3+ characters (API works better with more letters)
        // 2. We want to offer NEW cities not in local database
        if (searchTerm.length >= 3) {
          try {
            const apiResults = await searchCitiesNominatim(searchTerm, countryName);
            
            // Filter out cities that already exist in local database
            const newCities = apiResults.filter(apiCity => {
              // Check if this city already exists in local database
              const exists = dutyStations.some(station => {
                const sameName = station.CITY_NAME.toLowerCase() === apiCity.name.toLowerCase();
                const sameCountry = station.COUNTRY?.toLowerCase() === apiCity.country.toLowerCase();
                // Consider it a duplicate if name and country match
                return sameName && sameCountry;
              });
              return !exists; // Only include if NOT in local database
            });

            // Mark new cities as NOT duplicates
            const newCityResults: ExtendedCitySearchResult[] = newCities.map(city => ({
              ...city,
              isDuplicate: false,
              summary: `${city.name}, ${city.country} - NEW city (not in database)`,
            }));

            allResults.push(...newCityResults);
          } catch (apiError) {
            console.warn('API search failed, showing local results only:', apiError);
          }
        }

        setOptions(allResults);

        // Show warning if all results are duplicates
        if (allResults.length > 0 && allResults.every(r => r.isDuplicate)) {
          setDuplicateWarning(
            `All matching cities already exist in the database. Cannot request duplicates.`
          );
          setShowNoResultsHelp(false);
        } else {
          setDuplicateWarning(null);
          // Show help option if no results found after thorough search
          setShowNoResultsHelp(searchTerm.length >= 3 && allResults.length === 0);
        }

      } catch (error) {
        console.error('City search error:', error);
        setOptions([]);
        // Show help option on error too
        setShowNoResultsHelp(searchTerm.length >= 3);
      } finally {
        setLoading(false);
      }
    }, 500),
    [countryName, dutyStations]
  );

  useEffect(() => {
    searchCities(inputValue);
  }, [inputValue, searchCities]);

  const handleSelect = (_event: any, value: ExtendedCitySearchResult | null) => {
    if (value) {
      // CRITICAL: Block selection of duplicate cities
      if (value.isDuplicate) {
        setDuplicateWarning(
          `⚠️ DUPLICATE DETECTED: "${value.name}" already exists in the database (Code: ${value.existingCityCode}). ` +
          `You cannot request this city again. Please search for a different city or request a correction for the existing entry.`
        );
        setSelectedCity(null); // Clear selection
        return;
      }
      
      // Valid new city - proceed
      setSelectedCity(value);
      setDuplicateWarning(null);
      setManualEntryMode(false);
      onCitySelect(value);
    }
  };

  // Handle manual entry mode activation
  const handleManualEntry = () => {
    console.log('[Manual Entry] Button clicked, lastSearchTerm:', lastSearchTerm, 'length:', lastSearchTerm?.length);
    if (!onManualEntry) {
      console.error('[Manual Entry] onManualEntry callback not provided!');
      return;
    }
    if (!lastSearchTerm || lastSearchTerm.length < 2) {
      console.error('[Manual Entry] Search term too short:', lastSearchTerm);
      return;
    }
    
    console.log('[Manual Entry] Activating manual mode for:', lastSearchTerm);
    setManualEntryMode(true);
    setShowNoResultsHelp(false);
    onManualEntry(lastSearchTerm);
  };

  return (
    <Box>
      <Autocomplete
        options={options}
        loading={loading}
        value={selectedCity}
        onChange={handleSelect}
        inputValue={inputValue}
        onInputChange={(_, value) => setInputValue(value)}
        getOptionLabel={(option) => option.name}
        filterOptions={(x) => x} // Disable default filtering (we filter server-side)
        isOptionEqualToValue={(option, value) =>
          option.name === value.name && option.countryCode === value.countryCode
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            error={error}
            helperText={
              helperText ||
              (countryFilter
                ? `Search for a real city/town in ${countryName || 'the selected country'}`
                : 'Search for a real city/town name')
            }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => {
          const extendedOption = option as ExtendedCitySearchResult;
          return (
            <li 
              {...props} 
              key={`${option.name}-${option.countryCode}-${option.coordinates.latitude}`}
              style={{
                ...props.style,
                backgroundColor: extendedOption.isDuplicate ? '#fff3e0' : undefined,
                borderLeft: extendedOption.isDuplicate ? '4px solid #ff9800' : undefined,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {extendedOption.isDuplicate ? (
                    <BlockIcon fontSize="small" sx={{ color: 'warning.main' }} />
                  ) : (
                    <LocationIcon fontSize="small" color="action" />
                  )}
                  <Typography 
                    variant="body1"
                    sx={{ 
                      color: extendedOption.isDuplicate ? 'warning.dark' : 'inherit',
                      fontWeight: extendedOption.isDuplicate ? 600 : 400,
                    }}
                  >
                    {option.name}
                  </Typography>
                  {extendedOption.isDuplicate ? (
                    <Chip
                      label="EXISTS"
                      size="small"
                      color="warning"
                      icon={<WarningIcon />}
                      sx={{ ml: 'auto' }}
                    />
                  ) : (
                    <Chip
                      label="NEW"
                      size="small"
                      color="success"
                      icon={<CheckIcon />}
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 3 }}>
                  <PublicIcon fontSize="small" sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {option.country} • {option.coordinates.latitude.toFixed(4)}, {option.coordinates.longitude.toFixed(4)}
                  </Typography>
                </Box>
                {extendedOption.isDuplicate && (
                  <Typography 
                    variant="caption" 
                    sx={{ ml: 3, color: 'warning.dark', fontWeight: 500 }}
                  >
                    Code: {extendedOption.existingCityCode} - Cannot request (already in database)
                  </Typography>
                )}
              </Box>
            </li>
          );
        }}
        noOptionsText={
          inputValue.length < 2
            ? 'Type at least 2 characters to search local database'
            : loading
            ? 'Searching local database and external sources...'
            : 'No cities found - check spelling or country selection'
        }
      />

      {/* Duplicate Warning Alert - CRITICAL */}
      {duplicateWarning && (
        <Alert
          icon={<BlockIcon />}
          severity="error"
          sx={{ mt: 1 }}
        >
          <Typography variant="body2">
            <strong>DUPLICATE DETECTED:</strong>
          </Typography>
          <Typography variant="caption">
            {duplicateWarning}
          </Typography>
        </Alert>
      )}

      {/* Success - Valid NEW City Selected */}
      {selectedCity && !selectedCity.isDuplicate && (
        <Alert
          icon={<CheckIcon />}
          severity="success"
          sx={{ mt: 1 }}
        >
          <Typography variant="caption">
            <strong>✓ Valid NEW city:</strong> {selectedCity.name}, {selectedCity.country}
            <br />
            <strong>Coordinates:</strong> {selectedCity.coordinates.latitude.toFixed(6)}, {selectedCity.coordinates.longitude.toFixed(6)}
            <br />
            <strong>Status:</strong> Not in database - can be requested
          </Typography>
        </Alert>
      )}

      {/* Search Info */}
      {inputValue.length >= 2 && options.length > 0 && (
        <Alert
          severity="info"
          sx={{ mt: 1 }}
        >
          <Typography variant="caption">
            Found {options.filter(o => (o as ExtendedCitySearchResult).isDuplicate).length} existing cities and{' '}
            {options.filter(o => !(o as ExtendedCitySearchResult).isDuplicate).length} new cities.
            <br />
            <strong>⚠️ You can only request NEW cities.</strong> Existing cities are blocked to prevent duplicates.
          </Typography>
        </Alert>
      )}

      {/* Manual Entry Option - shown when no results found */}
      {showNoResultsHelp && !manualEntryMode && (
        <Alert
          severity="warning"
          sx={{ mt: 1 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<MapIcon />}
              onClick={handleManualEntry}
            >
              Enter Manually
            </Button>
          }
        >
          <Typography variant="subtitle2" gutterBottom>
            <strong>Location Not Found</strong>
          </Typography>
          <Typography variant="caption">
            The geocoding service couldn't find "<strong>{lastSearchTerm}</strong>". 
            <br />
            Click "Enter Manually" to proceed with manual coordinate selection on the map.
          </Typography>
        </Alert>
      )}

      {/* Manual Entry Mode Confirmation */}
      {manualEntryMode && (
        <Alert
          severity="info"
          sx={{ mt: 1 }}
          icon={<EditIcon />}
        >
          <Typography variant="subtitle2" gutterBottom>
            <strong>✓ Manual Entry Mode</strong>
          </Typography>
          <Typography variant="caption">
            Location name: <strong>{lastSearchTerm}</strong>
            <br />
            Scroll down to select the exact coordinates on the map.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

