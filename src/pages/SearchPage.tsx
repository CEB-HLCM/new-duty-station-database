// Professional search page with advanced search functionality
// Following CEB Donor Codes proven patterns

import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Paper,
  Alert,
  Fab,
  Zoom,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  TuneSharp as AdvancedIcon,
} from '@mui/icons-material';
import { useSearch } from '../hooks/useSearch';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import SearchSuggestions from '../components/search/SearchSuggestions';
import type { DutyStation } from '../types';

function SearchPage() {
  const searchHook = useSearch({
    debounceMs: 300,
    maxSuggestions: 10,
    enableSuggestions: true,
    enablePerformanceTracking: true,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    clearSearch,
    error,
    isReady,
    hasResults,
    suggestions,
  } = searchHook;

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setShowSuggestions(value.length >= 2 && suggestions.length > 0);
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (query.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  };

  // Handle clear search
  const handleClearSearch = () => {
    clearSearch();
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  // Handle view station (placeholder for future implementation)
  const handleViewStation = (station: DutyStation) => {
    console.log('View station:', station);
    // Future: Open station detail modal or navigate to detail page
  };

  // Handle export results (placeholder for future implementation)
  const handleExportResults = () => {
    console.log('Export results');
    // Future: Export search results to CSV
  };

  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Duty Stations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search through {isReady ? '4,295+ duty stations' : 'duty stations'} using multiple search algorithms. 
          Find stations by name, country, or common name with exact, partial, fuzzy, or phonetic matching.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => searchHook.clearError()}>
          {error}
        </Alert>
      )}

      {/* Search Input */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            ref={searchInputRef}
            fullWidth
            placeholder="Search duty stations by name, country, or common name..."
            value={query}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            disabled={!isReady}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color={isReady ? 'action' : 'disabled'} />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <Tooltip title="Clear search">
                    <Box
                      component="button"
                      onClick={handleClearSearch}
                      sx={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        p: 0.5,
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          />

          {/* Search Suggestions */}
          {isReady && (
            <SearchSuggestions
              searchHook={searchHook}
              anchorEl={searchInputRef.current}
              open={showSuggestions}
              onClose={() => setShowSuggestions(false)}
              onSuggestionSelect={handleSuggestionSelect}
            />
          )}
        </Box>
      </Paper>

      {/* Search Filters */}
      <SearchFilters
        searchHook={searchHook}
        showAdvanced={showAdvancedFilters}
        onToggleAdvanced={setShowAdvancedFilters}
      />

      {/* Search Results */}
      <SearchResults
        searchHook={searchHook}
        onViewStation={handleViewStation}
        onExport={handleExportResults}
        showExport={hasResults}
      />

      {/* Floating Action Button for Advanced Filters (Mobile) */}
      <Zoom in={!showAdvancedFilters}>
        <Fab
          color="primary"
          aria-label="advanced filters"
          onClick={toggleAdvancedFilters}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' },
          }}
        >
          <AdvancedIcon />
        </Fab>
      </Zoom>

      {/* Loading State Overlay */}
      {!isReady && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Loading duty stations data...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we fetch the latest data from GitHub
            </Typography>
          </Paper>
        </Box>
      )}
    </Container>
  );
}

export default SearchPage;
