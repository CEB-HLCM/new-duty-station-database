// Search results component with professional table display
// Following CEB Donor Codes proven patterns

import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { DutyStation, SearchResult } from '../../types';
import type { UseSearchReturn } from '../../hooks/useSearch';

interface SearchResultsProps {
  searchHook: UseSearchReturn;
  onViewStation?: (station: DutyStation) => void;
  onExport?: () => void;
  showExport?: boolean;
}


type SortField = keyof DutyStation;
type SortOrder = 'asc' | 'desc';

function SearchResults({ 
  searchHook, 
  onViewStation, 
  onExport,
  showExport = true 
}: SearchResultsProps) {
  const {
    results,
    loading,
    error,
    hasQuery,
    isEmpty,
    totalResults,
    performanceMetrics,
  } = searchHook;

  const [sortField, setSortField] = useState<SortField>('NAME');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Handle sorting
  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Sort results
  const sortedResults = React.useMemo(() => {
    const sorted = [...results].sort((a, b) => {
      const aValue = a.item[sortField];
      const bValue = b.item[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'desc' ? -comparison : comparison;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortOrder === 'desc' ? -comparison : comparison;
      }
      
      return 0;
    });
    
    return sorted;
  }, [results, sortField, sortOrder]);

  // Paginate results
  const paginatedResults = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedResults.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedResults, page, rowsPerPage]);

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Render match highlights
  const renderHighlightedText = (text: string, matches?: SearchResult<DutyStation>['matches']) => {
    if (!matches || matches.length === 0) return text;
    
    // Simple highlighting - in a production app, you might want more sophisticated highlighting
    const match = matches[0];
    if (match.field && match.indices && match.indices.length > 0) {
      const [start, end] = match.indices[0];
      if (start >= 0 && end < text.length) {
        return (
          <>
            {text.substring(0, start)}
            <mark style={{ backgroundColor: '#fff3cd', padding: '0 2px' }}>
              {text.substring(start, end + 1)}
            </mark>
            {text.substring(end + 1)}
          </>
        );
      }
    }
    
    return text;
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Searching duty stations...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Search failed: {error}
        </Typography>
      </Alert>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No duty stations found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search terms or filters
        </Typography>
      </Box>
    );
  }

  // No query state
  if (!hasQuery) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Enter a search term to find duty stations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Use the search box above to search by name, country, or common name
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Results Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Search Results ({totalResults})
        </Typography>
        {showExport && totalResults > 0 && (
          <Button
            startIcon={<ExportIcon />}
            onClick={onExport}
            variant="outlined"
            size="small"
          >
            Export Results
          </Button>
        )}
      </Box>

      {/* Results Table */}
      <TableContainer component={Paper} elevation={1}>
        <Table aria-label="search results">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'DS'}
                  direction={sortField === 'DS' ? sortOrder : 'asc'}
                  onClick={() => handleSort('DS')}
                >
                  Code
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'NAME'}
                  direction={sortField === 'NAME' ? sortOrder : 'asc'}
                  onClick={() => handleSort('NAME')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'COUNTRY'}
                  direction={sortField === 'COUNTRY' ? sortOrder : 'asc'}
                  onClick={() => handleSort('COUNTRY')}
                >
                  Country
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'COMMONNAME'}
                  direction={sortField === 'COMMONNAME' ? sortOrder : 'asc'}
                  onClick={() => handleSort('COMMONNAME')}
                >
                  Common Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Latitude</TableCell>
              <TableCell align="right">Longitude</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResults.map((result, index) => {
              const station = result.item;
              const hasCoordinates = station.LATITUDE !== 0 || station.LONGITUDE !== 0;
              const uniqueKey = `${station.CITY_CODE}-${station.COUNTRY_CODE}-${index}`;
              
              return (
                <TableRow key={uniqueKey} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {station.CITY_CODE}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {renderHighlightedText(station.CITY_NAME, result.matches)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {renderHighlightedText(station.COUNTRY || 'N/A', result.matches)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {station.CITY_COMMON_NAME ? renderHighlightedText(station.CITY_COMMON_NAME, result.matches) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {hasCoordinates ? station.LATITUDE.toFixed(4) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {hasCoordinates ? station.LONGITUDE.toFixed(4) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={station.OBSOLETE === '1' ? 'Obsolete' : 'Active'}
                      color={station.OBSOLETE === '1' ? 'default' : 'success'}
                      size="small"
                      variant={station.OBSOLETE === '1' ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View details">
                      <IconButton
                        size="small"
                        onClick={() => onViewStation?.(station)}
                        color="primary"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalResults > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={totalResults}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Performance Info (Development) */}
      {import.meta.env.DEV && performanceMetrics.searchTime > 0 && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Search completed in {performanceMetrics.searchTime.toFixed(2)}ms
            {performanceMetrics.isSlowSearch && ' (slower than target)'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default SearchResults;
