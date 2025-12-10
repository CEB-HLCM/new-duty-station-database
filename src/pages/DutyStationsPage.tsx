import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  AlertTitle,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Checkbox,
  Button,
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, GetApp as ExportIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useAppData } from '../hooks/useAppData';
import type { DutyStation } from '../types';
import SelectionToolbar from '../components/table/SelectionToolbar';
import { exportDutyStationsToCSV, exportDutyStationsToExcel } from '../utils/exportUtils';
import { TableSkeleton, StatsCardSkeleton } from '../components/common/LoadingSkeleton';

function DutyStationsPage() {
  const navigate = useNavigate();
  const {
    dutyStations,
    countries,
    loading,
    error,
    refreshData,
    clearError,
    getFilteredDutyStations,
    getPaginatedDutyStations,
    getDataStatistics,
    isReady
  } = useAppData();

  // State for filters and pagination
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState<'CITY_NAME' | 'COUNTRY' | 'CITY_COMMON_NAME'>('CITY_NAME');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [showObsolete, setShowObsolete] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<keyof DutyStation>('CITY_NAME');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Get filtered and paginated data
  const filteredDutyStations = useMemo(() => {
    return getFilteredDutyStations({
      searchText,
      searchField,
      countryFilter: countryFilter === 'all' ? undefined : countryFilter,
      showObsolete
    });
  }, [getFilteredDutyStations, searchText, searchField, countryFilter, showObsolete]);

  const paginatedResults = useMemo(() => {
    return getPaginatedDutyStations(filteredDutyStations, {
      page: page + 1, // Convert to 1-based for service
      pageSize: rowsPerPage,
      sortBy,
      sortOrder
    });
  }, [getPaginatedDutyStations, filteredDutyStations, page, rowsPerPage, sortBy, sortOrder]);

  // Get statistics
  const stats = useMemo(() => getDataStatistics(), [getDataStatistics]);

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sorting
  const handleSort = (column: keyof DutyStation) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    setSortBy(column);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  // Handle refresh
  const handleRefresh = () => {
    clearError();
    refreshData();
  };

  // Export handlers
  const handleExportCSVAll = () => exportDutyStationsToCSV(filteredDutyStations, 'duty-stations');
  const handleExportExcelAll = () => exportDutyStationsToExcel(filteredDutyStations, 'duty-stations');
  const handleExportCSVSelected = (rows: DutyStation[]) => exportDutyStationsToCSV(rows, 'duty-stations-selected');
  const handleExportExcelSelected = (rows: DutyStation[]) => exportDutyStationsToExcel(rows, 'duty-stations-selected');

  // Selection helpers
  const getKey = (s: DutyStation, index?: number) => `${s.CITY_CODE}-${s.COUNTRY_CODE}${index !== undefined ? '-' + index : ''}`;
  const isSelected = (key: string) => selectedKeys.has(key);
  const clearSelection = () => setSelectedKeys(new Set());
  const toggleRow = (key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const toggleAll = () => {
    const allKeys = paginatedResults.data.map((s, idx) => getKey(s, idx));
    const allSelected = allKeys.every(k => selectedKeys.has(k));
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (allSelected) {
        allKeys.forEach(k => next.delete(k));
      } else {
        allKeys.forEach(k => next.add(k));
      }
      return next;
    });
  };

  // Loading state
  if (loading && dutyStations.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Duty Stations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Loading duty stations data from GitHub HR-Public-Codes repository...
        </Typography>
        
        {/* Statistics cards skeleton */}
        <StatsCardSkeleton count={4} />
        
        <Box sx={{ mt: 4 }} />
        
        {/* Table skeleton */}
        <Paper sx={{ p: 2 }}>
          <TableSkeleton rows={20} columns={8} />
        </Paper>
      </Container>
    );
  }

  // Error state
  if (error && dutyStations.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Data</AlertTitle>
          {error}
          <Box sx={{ mt: 2 }}>
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
            <Typography variant="caption" sx={{ ml: 1 }}>
              Click to retry
            </Typography>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Duty Stations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and search UN duty stations worldwide
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {stats.totalDutyStations.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Duty Stations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {stats.activeDutyStations.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Stations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main">
                {stats.totalCountries.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Countries/Territories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {filteredDutyStations.length.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filtered Results
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 1 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Search Field</InputLabel>
              <Select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as typeof searchField)}
                label="Search Field"
              >
                <MenuItem value="CITY_NAME">Name</MenuItem>
                <MenuItem value="COUNTRY">Country</MenuItem>
                <MenuItem value="CITY_COMMON_NAME">Common Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                label="Country"
              >
                <MenuItem value="all">All Countries</MenuItem>
                {countries
                  .filter((country) => country.OBSOLETE !== '1')
                  .map((country) => (
                    <MenuItem key={country.COUNTRY_CODE} value={country.COUNTRY_NAME}>
                      {country.COUNTRY_NAME}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={showObsolete ? "Show All" : "Active Only"}
                onClick={() => setShowObsolete(!showObsolete)}
                color={showObsolete ? "default" : "primary"}
                variant={showObsolete ? "outlined" : "filled"}
              />
              <Tooltip title="Refresh Data">
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export filtered results">
                <span>
                  <IconButton onClick={handleExportCSVAll} disabled={filteredDutyStations.length === 0}>
                    <ExportIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Button size="small" variant="outlined" onClick={handleExportExcelAll} disabled={filteredDutyStations.length === 0}>Excel</Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Selection Toolbar */}
      <SelectionToolbar
        selected={Array.from(selectedKeys).map(k => {
          // Map keys back to rows from current filtered list for export purposes
          // Use a quick lookup over current page + filtered set
          const found = paginatedResults.data.find((s, idx) => getKey(s, idx) === k);
          return found as DutyStation;
        }).filter(Boolean)}
        onClearSelection={clearSelection}
        onExportCSV={handleExportCSVSelected}
        onExportExcel={handleExportExcelSelected}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={clearError}>
          <AlertTitle>Warning</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <Paper>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedKeys.size > 0 && selectedKeys.size < paginatedResults.data.length}
                    checked={paginatedResults.data.length > 0 && selectedKeys.size === paginatedResults.data.length}
                    onChange={toggleAll}
                    inputProps={{ 'aria-label': 'select all on page' }}
                  />
                </TableCell>
                <TableCell 
                  sortDirection={sortBy === 'CITY_CODE' ? sortOrder : false}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('CITY_CODE')}
                >
                  Code
                </TableCell>
                <TableCell 
                  sortDirection={sortBy === 'CITY_NAME' ? sortOrder : false}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('CITY_NAME')}
                >
                  Name
                </TableCell>
                <TableCell 
                  sortDirection={sortBy === 'COUNTRY' ? sortOrder : false}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('COUNTRY')}
                >
                  Country
                </TableCell>
                <TableCell 
                  sortDirection={sortBy === 'CITY_COMMON_NAME' ? sortOrder : false}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('CITY_COMMON_NAME')}
                >
                  Common Name
                </TableCell>
                <TableCell align="right">Latitude</TableCell>
                <TableCell align="right">Longitude</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && paginatedResults.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No duty stations found matching the current filters
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading && paginatedResults.data.map((station, index) => {
                const key = `${station.CITY_CODE}-${station.COUNTRY_CODE}-${index}`;
                const selected = isSelected(key);
                return (
                <TableRow key={key} hover selected={selected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected}
                      onChange={() => toggleRow(key)}
                      inputProps={{ 'aria-label': `select ${station.CITY_CODE}` }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {station.CITY_CODE}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {station.CITY_NAME}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {station.COUNTRY || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {station.CITY_COMMON_NAME || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {station.LATITUDE.toFixed(4)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {station.LONGITUDE.toFixed(4)}
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
                        onClick={() => navigate(`/duty-stations/${station.CITY_CODE}/${station.COUNTRY_CODE}`)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );})}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={paginatedResults.totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
}

export default DutyStationsPage;
