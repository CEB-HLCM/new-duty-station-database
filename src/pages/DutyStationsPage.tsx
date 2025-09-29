import { useState, useMemo } from 'react';
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
  Tooltip
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, GetApp as ExportIcon } from '@mui/icons-material';
import { useAppData } from '../hooks/useAppData';
import type { DutyStation } from '../types';

function DutyStationsPage() {
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
  const [searchField, setSearchField] = useState<'NAME' | 'COUNTRY' | 'COMMONNAME'>('NAME');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [showObsolete, setShowObsolete] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<keyof DutyStation>('NAME');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  // Export functionality (basic CSV export)
  const handleExport = () => {
    const csvContent = [
      // Header
      ['DS', 'CTY', 'NAME', 'COUNTRY', 'LATITUDE', 'LONGITUDE', 'COMMONNAME', 'OBSOLETE'].join(','),
      // Data rows
      ...filteredDutyStations.map(station =>
        [
          station.DS,
          station.CTY,
          `"${station.NAME}"`,
          `"${station.COUNTRY || ''}"`,
          station.LATITUDE,
          station.LONGITUDE,
          `"${station.COMMONNAME}"`,
          station.OBSOLETE
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `duty-stations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (loading && dutyStations.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={48} />
          <Typography variant="h6">Loading duty stations data...</Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching data from GitHub HR-Public-Codes repository
          </Typography>
        </Box>
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
      <Paper sx={{ p: 3, mb: 3 }}>
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
                <MenuItem value="NAME">Name</MenuItem>
                <MenuItem value="COUNTRY">Country</MenuItem>
                <MenuItem value="COMMONNAME">Common Name</MenuItem>
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
                {countries.map((country) => (
                  <MenuItem key={country.CTYCD} value={country.NAME}>
                    {country.NAME}
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
              <Tooltip title="Export CSV">
                <IconButton onClick={handleExport}>
                  <ExportIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

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
                <TableCell 
                  sortDirection={sortBy === 'DS' ? sortOrder : false}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('DS')}
                >
                  Code
                </TableCell>
                <TableCell 
                  sortDirection={sortBy === 'NAME' ? sortOrder : false}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('NAME')}
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
                  sortDirection={sortBy === 'COMMONNAME' ? sortOrder : false}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('COMMONNAME')}
                >
                  Common Name
                </TableCell>
                <TableCell align="right">Latitude</TableCell>
                <TableCell align="right">Longitude</TableCell>
                <TableCell align="center">Status</TableCell>
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
              {!loading && paginatedResults.data.map((station, index) => (
                <TableRow key={`${station.DS}-${station.CTY}-${index}`} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {station.DS}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {station.NAME}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {station.COUNTRY || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {station.COMMONNAME || '-'}
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
                </TableRow>
              ))}
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
