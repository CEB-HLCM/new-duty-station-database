// Search filters component for advanced search options
// Following CEB Donor Codes proven patterns

import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  type SelectChangeEvent,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { SearchType } from '../../types/search';
import type { UseSearchReturn } from '../../hooks/useSearch';

interface SearchFiltersProps {
  searchHook: UseSearchReturn;
  showAdvanced?: boolean;
  onToggleAdvanced?: (show: boolean) => void;
}

function SearchFilters({ 
  searchHook, 
  showAdvanced = false, 
  onToggleAdvanced 
}: SearchFiltersProps) {
  const {
    searchType,
    fields,
    countryFilter,
    showObsolete,
    setSearchType,
    setFields,
    setCountryFilter,
    setShowObsolete,
    countryOptions,
    fieldOptions,
    searchTypeOptions,
    totalResults,
    performanceMetrics,
  } = searchHook;

  const handleSearchTypeChange = (event: SelectChangeEvent) => {
    setSearchType(event.target.value as SearchType);
  };

  const handleCountryFilterChange = (event: SelectChangeEvent) => {
    setCountryFilter(event.target.value);
  };

  const handleFieldToggle = (fieldValue: string) => {
    const newFields = fields.includes(fieldValue)
      ? fields.filter(f => f !== fieldValue)
      : [...fields, fieldValue];
    
    // Ensure at least one field is selected
    if (newFields.length > 0) {
      setFields(newFields);
    }
  };

  const handleObsoleteToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowObsolete(event.target.checked);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Basic Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Search Type</InputLabel>
            <Select
              value={searchType}
              label="Search Type"
              onChange={handleSearchTypeChange}
            >
              {searchTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Country</InputLabel>
            <Select
              value={countryFilter}
              label="Country"
              onChange={handleCountryFilterChange}
            >
              {countryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showObsolete}
                  onChange={handleObsoleteToggle}
                  color="primary"
                />
              }
              label="Include Obsolete"
            />
          </Box>
        </Grid>
      </Grid>

      {/* Advanced Filters Accordion */}
      <Accordion expanded={showAdvanced} onChange={(_, expanded) => onToggleAdvanced?.(expanded)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="advanced-search-content"
          id="advanced-search-header"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon />
            <Typography>Advanced Filters</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Search Fields Selection */}
            <Grid xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Search In Fields:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {fieldOptions.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    onClick={() => handleFieldToggle(option.value)}
                    color={fields.includes(option.value) ? 'primary' : 'default'}
                    variant={fields.includes(option.value) ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Select which fields to search in. At least one field must be selected.
              </Typography>
            </Grid>

            {/* Search Type Descriptions */}
            <Grid xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Search Type Information:
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  • <strong>Exact Match:</strong> Find stations with exact field matches<br />
                  • <strong>Contains:</strong> Find stations where fields contain your search term<br />
                  • <strong>Fuzzy Search:</strong> Find stations with similar spelling (handles typos)<br />
                  • <strong>Sounds Like:</strong> Find stations that sound similar (phonetic matching)
                </Typography>
              </Box>
            </Grid>

            {/* Performance Metrics (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <Grid xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Performance Metrics:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  <Chip
                    size="small"
                    label={`Search Time: ${performanceMetrics.searchTime.toFixed(2)}ms`}
                    color={performanceMetrics.isSlowSearch ? 'warning' : 'success'}
                  />
                  <Chip
                    size="small"
                    label={`Results: ${totalResults}`}
                    color="info"
                  />
                  {performanceMetrics.isSlowSearch && (
                    <Chip
                      size="small"
                      label="Slow Search"
                      color="warning"
                    />
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Results Summary */}
      {totalResults > 0 && (
        <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Found {totalResults} duty station{totalResults !== 1 ? 's' : ''}
            {performanceMetrics.searchTime > 0 && (
              <> in {performanceMetrics.searchTime.toFixed(2)}ms</>
            )}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default SearchFilters;
