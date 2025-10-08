// Enhanced City Search Component with GeoNames validation
import { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Public as PublicIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { searchCitiesNominatim, type CitySearchResult } from '../../services/locationService';
import { debounce } from '@mui/material/utils';

interface EnhancedCitySearchProps {
  onCitySelect: (result: CitySearchResult) => void;
  countryFilter?: string;
  countryName?: string;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

/**
 * Enhanced City Search Component
 * Searches real cities using Nominatim/GeoNames and validates names
 */
export const EnhancedCitySearch: React.FC<EnhancedCitySearchProps> = ({
  onCitySelect,
  countryFilter,
  countryName,
  label = 'City/Town Name',
  required = false,
  error = false,
  helperText,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null);

  // Debounced search function
  const searchCities = useCallback(
    debounce(async (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchCitiesNominatim(searchTerm, countryName);
        
        // No additional filtering needed - Nominatim already filters by country name
        // The countryFilter was causing issues because it uses ISO3 codes ("FRA") 
        // while Nominatim returns ISO2 codes ("FR")
        console.log(`City search: Found ${results.length} results for "${searchTerm}" in ${countryName}`);
        
        setOptions(results);
      } catch (error) {
        console.error('City search error:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    [countryName]
  );

  useEffect(() => {
    searchCities(inputValue);
  }, [inputValue, searchCities]);

  const handleSelect = (_event: any, value: CitySearchResult | null) => {
    if (value) {
      setSelectedCity(value);
      onCitySelect(value);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      default:
        return 'default';
    }
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
        renderOption={(props, option) => (
          <li {...props} key={`${option.name}-${option.countryCode}-${option.coordinates.latitude}`}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body1">{option.name}</Typography>
                <Chip
                  label={option.confidence}
                  size="small"
                  color={getConfidenceColor(option.confidence) as any}
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 3 }}>
                <PublicIcon fontSize="small" sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {option.country} • {option.coordinates.latitude.toFixed(4)}, {option.coordinates.longitude.toFixed(4)}
                </Typography>
              </Box>
            </Box>
          </li>
        )}
        noOptionsText={
          inputValue.length < 2
            ? 'Type at least 2 characters to search'
            : loading
            ? 'Searching...'
            : 'No cities found - check spelling or country selection'
        }
      />

      {selectedCity && (
        <Alert
          icon={<CheckIcon />}
          severity="success"
          sx={{ mt: 1 }}
        >
          <Typography variant="caption">
            <strong>Valid city:</strong> {selectedCity.name}, {selectedCity.country}
            <br />
            <strong>Coordinates:</strong> {selectedCity.coordinates.latitude.toFixed(6)}, {selectedCity.coordinates.longitude.toFixed(6)}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

