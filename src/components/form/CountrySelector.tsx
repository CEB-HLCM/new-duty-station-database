// Country Selector with Region Filtering
import { useState } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from '@mui/material';
import { Public as PublicIcon } from '@mui/icons-material';
import { useAppData } from '../../hooks/useAppData';
import type { Country } from '../../types/dutyStation';

interface CountrySelectorProps {
  onCountrySelect: (country: Country | null) => void;
  selectedRegion?: string;
  onRegionChange?: (region: string | null) => void;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const REGIONS = [
  { value: 'Africa', label: 'Africa', emoji: '🌍' },
  { value: 'Americas', label: 'Americas', emoji: '🌎' },
  { value: 'Asia', label: 'Asia', emoji: '🌏' },
  { value: 'Europe', label: 'Europe', emoji: '🇪🇺' },
  { value: 'Oceania', label: 'Oceania', emoji: '🏝️' },
];

/**
 * Country Selector with optional region filtering
 * Uses real country data from DSCTRYCD.csv
 */
export const CountrySelector: React.FC<CountrySelectorProps> = ({
  onCountrySelect,
  selectedRegion,
  onRegionChange,
  label = 'Country',
  required = false,
  error = false,
  helperText,
}) => {
  const { countries, loading } = useAppData();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [region, setRegion] = useState<string | null>(selectedRegion || null);

  // Debug log
  console.log('CountrySelector - Total countries:', countries.length);
  console.log('CountrySelector - Sample country:', countries[0]);
  console.log('CountrySelector - Selected region:', region);

  // Filter countries by region and exclude obsolete countries
  const filteredCountries = region
    ? countries.filter((c: Country) => c.REGION === region && c.OBSOLETE !== '1')
    : countries.filter((c: Country) => c.OBSOLETE !== '1');

  console.log('CountrySelector - Filtered countries:', filteredCountries.length);
  if (region) {
    console.log('CountrySelector - Sample filtered country:', filteredCountries[0]);
  }

  // Sort countries alphabetically
  const sortedCountries = [...filteredCountries].sort((a, b) =>
    a.NAME.localeCompare(b.NAME)
  );

  const handleRegionChange = (_event: React.MouseEvent<HTMLElement>, newRegion: string | null) => {
    setRegion(newRegion);
    setSelectedCountry(null); // Clear country when region changes
    onCountrySelect(null);
    if (onRegionChange) {
      onRegionChange(newRegion);
    }
  };

  const handleCountryChange = (_event: any, value: Country | null) => {
    setSelectedCountry(value);
    onCountrySelect(value);
  };

  return (
    <Box>
      {/* Region Filter */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Filter by Region (Optional)
        </Typography>
        <ToggleButtonGroup
          value={region}
          exclusive
          onChange={handleRegionChange}
          aria-label="region filter"
          size="small"
          fullWidth
          sx={{ flexWrap: 'wrap' }}
        >
          {REGIONS.map((r) => (
            <ToggleButton key={r.value} value={r.value} sx={{ flex: '1 1 auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span>{r.emoji}</span>
                <Typography variant="caption">{r.label}</Typography>
              </Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {region && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Showing {filteredCountries.length} countries in {region}
          </Typography>
        )}
      </Paper>

      {/* Country Autocomplete */}
      <Autocomplete
        options={sortedCountries}
        value={selectedCountry}
        onChange={handleCountryChange}
        getOptionLabel={(option) => option.NAME}
        isOptionEqualToValue={(option, value) => option.CTYCD === value.CTYCD}
        loading={loading}
        disabled={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            error={error}
            helperText={
              helperText ||
              (loading
                ? 'Loading countries...'
                : region
                ? `${filteredCountries.length} countries in ${region}`
                : `${countries.length} countries available - filter by region for easier selection`)
            }
          />
        )}
        renderOption={(props, option: Country) => (
          <li {...props} key={option.CTYCD}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <PublicIcon fontSize="small" color="action" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">{option.NAME}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.REGION || 'Unknown region'}
                </Typography>
              </Box>
              <Chip label={option.CTYCD} size="small" variant="outlined" />
            </Box>
          </li>
        )}
        noOptionsText={
          loading
            ? 'Loading countries...'
            : region
            ? `No countries found in ${region} region`
            : 'No countries found - try selecting a region first'
        }
      />

      {selectedCountry && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'success.lighter', borderRadius: 1 }}>
          <Typography variant="caption" color="success.dark">
            ✓ Selected: <strong>{selectedCountry.NAME}</strong> (Code: {selectedCountry.CTYCD})
          </Typography>
        </Box>
      )}
    </Box>
  );
};

