// Interactive mapping page for UN Duty Stations
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Autocomplete,
  Button,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  MyLocation as MyLocationIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { InteractiveMap } from '../components/mapping/InteractiveMap';
import { MapControls, type TileLayer } from '../components/mapping/MapControls';
import { useAppData } from '../hooks/useAppData';
import { useGeolocation } from '../hooks/useGeolocation';
import { geocodeAddress } from '../services/geocodingService';
import type { DutyStation, MapCoordinates } from '../types/dutyStation';

function MapsPage() {
  const navigate = useNavigate();
  const { dutyStations, countries, loading, error, refreshData } = useAppData();
  
  const [selectedLayer, setSelectedLayer] = useState<TileLayer>('osm');
  const [showObsolete, setShowObsolete] = useState(false);
  const [showClustering, setShowClustering] = useState(true);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<DutyStation | null>(null);
  const [mapCenter, setMapCenter] = useState<MapCoordinates>({ latitude: 20, longitude: 0 });
  const [mapZoom, setMapZoom] = useState(2);
  const [geocoding, setGeocoding] = useState(false);

  const {
    coordinates: userLocation,
    getCurrentPosition,
    loading: locationLoading,
    error: locationError
  } = useGeolocation();

  // Filter stations based on obsolete toggle and region
  const filteredStations = useMemo(() => {
    return dutyStations.filter(station => {
      // Filter by obsolete
      const obsoleteMatch = showObsolete || station.OBSOLETE === '0';
      
      // Filter by region
      const regionMatch = regionFilter === 'all' || station.REGION === regionFilter;
      
      return obsoleteMatch && regionMatch;
    });
  }, [dutyStations, showObsolete, regionFilter]);

  // Search functionality for autocomplete with relevance sorting
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    
    const query = searchQuery.toLowerCase();
    
    // Filter stations matching the query
    const matchedStations = dutyStations.filter(station => 
      station.NAME.toLowerCase().includes(query) ||
      station.COUNTRY?.toLowerCase().includes(query) ||
      station.DS.toLowerCase().includes(query) ||
      station.COMMONNAME.toLowerCase().includes(query)
    );
    
    // Sort by relevance:
    // 1. Exact NAME match first
    // 2. NAME starts with query
    // 3. COUNTRY exact match
    // 4. COUNTRY starts with query
    // 5. Everything else alphabetically
    return matchedStations
      .sort((a, b) => {
        const aName = a.NAME.toLowerCase();
        const bName = b.NAME.toLowerCase();
        const aCountry = (a.COUNTRY || '').toLowerCase();
        const bCountry = (b.COUNTRY || '').toLowerCase();
        
        // Exact NAME matches first
        if (aName === query && bName !== query) return -1;
        if (bName === query && aName !== query) return 1;
        
        // NAME starts with query
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
        
        // Exact COUNTRY match
        if (aCountry === query && bCountry !== query) return -1;
        if (bCountry === query && aCountry !== query) return 1;
        
        // COUNTRY starts with query
        if (aCountry.startsWith(query) && !bCountry.startsWith(query)) return -1;
        if (bCountry.startsWith(query) && !aCountry.startsWith(query)) return 1;
        
        // Alphabetical by NAME
        return aName.localeCompare(bName);
      })
      .slice(0, 50); // Limit results for performance
  }, [dutyStations, searchQuery]);

  const handleStationSelect = (station: DutyStation | null) => {
    if (station) {
      setSelectedStation(station);
      setMapCenter({
        latitude: station.LATITUDE,
        longitude: station.LONGITUDE
      });
      setMapZoom(12);
    }
  };

  const handleSearchByAddress = async () => {
    if (!searchQuery) return;

    setGeocoding(true);
    const result = await geocodeAddress(searchQuery);
    setGeocoding(false);

    if (result) {
      setMapCenter({
        latitude: result.latitude,
        longitude: result.longitude
      });
      setMapZoom(12);
    }
  };

  const handleUseMyLocation = () => {
    getCurrentPosition();
  };

  // Watch for userLocation changes and update map when available
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(12);
    }
  }, [userLocation]);

  const handleResetView = () => {
    setMapCenter({ latitude: 20, longitude: 0 });
    setMapZoom(2);
    setSelectedStation(null);
  };

  // Statistics
  const activeStations = dutyStations.filter(s => s.OBSOLETE === '0').length;
  const obsoleteStations = dutyStations.filter(s => s.OBSOLETE === '1').length;

  return (
    <Container maxWidth={false} disableGutters sx={{ height: 'calc(100vh - 64px)' }}>
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
            Interactive Map
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Explore {dutyStations.length.toLocaleString()} UN Duty Stations worldwide
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Location Error Alert */}
        {locationError && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => {}}>
            {locationError}
          </Alert>
        )}

        {/* Search and Controls Bar */}
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            {/* Station Search Autocomplete */}
            <Autocomplete
              sx={{ flex: 1, minWidth: 300 }}
              options={searchResults}
              filterOptions={(options) => options} // Bypass MUI's built-in filtering
              getOptionLabel={(option) => 
                `${option.NAME} - ${option.COUNTRY || option.CTY} (${option.DS})`
              }
              value={selectedStation}
              onChange={(_, value) => handleStationSelect(value)}
              inputValue={searchQuery}
              onInputChange={(_, value, reason) => {
                if (reason !== 'reset') {
                  setSearchQuery(value);
                }
              }}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Duty Stations"
                  placeholder="Search by name, country, or code..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={`${option.DS}-${option.CTY}`}>
                  <Stack>
                    <Typography variant="body2">
                      {option.NAME}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.COUNTRY || option.CTY} • {option.DS}
                      {option.OBSOLETE === '1' && ' • Obsolete'}
                    </Typography>
                  </Stack>
                </li>
              )}
              noOptionsText="No stations found"
            />

            {/* Address Search Button */}
            <Button
              variant="outlined"
              onClick={handleSearchByAddress}
              disabled={!searchQuery || geocoding}
              startIcon={geocoding ? <CircularProgress size={16} /> : <SearchIcon />}
            >
              Search Address
            </Button>

            {/* My Location Button */}
            <Button
              variant="outlined"
              onClick={handleUseMyLocation}
              disabled={locationLoading}
              startIcon={locationLoading ? <CircularProgress size={16} /> : <MyLocationIcon />}
            >
              My Location
            </Button>

            {/* Reset View Button */}
            <Button
              variant="outlined"
              onClick={handleResetView}
              startIcon={<RefreshIcon />}
            >
              Reset
            </Button>

            {/* Refresh Data Button */}
            <Button
              variant="outlined"
              onClick={refreshData}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            >
              Refresh
            </Button>
          </Stack>

          {/* Statistics Chips */}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
            <Chip
              label={`Total: ${dutyStations.length.toLocaleString()}`}
              color="primary"
              size="small"
            />
            <Chip
              label={`Active: ${activeStations.toLocaleString()}`}
              color="success"
              size="small"
            />
            <Chip
              label={`Obsolete: ${obsoleteStations.toLocaleString()}`}
              color="error"
              size="small"
            />
            <Chip
              label={`Countries: ${countries.length}`}
              color="info"
              size="small"
            />
            <Chip
              label={`Visible: ${filteredStations.length.toLocaleString()}`}
              variant="outlined"
              size="small"
            />
          </Stack>
        </Paper>

        {/* Map Container */}
        <Box sx={{ flex: 1, position: 'relative', minHeight: 400 }}>
          {loading ? (
            <Paper
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <CircularProgress size={60} />
              <Typography variant="h6" color="text.secondary">
                Loading map data...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Preparing {dutyStations.length.toLocaleString()} duty stations
              </Typography>
            </Paper>
          ) : (
            <>
              <InteractiveMap
                key={`${mapCenter.latitude}-${mapCenter.longitude}-${mapZoom}`}
                stations={filteredStations}
                center={mapCenter}
                zoom={mapZoom}
                height="100%"
                tileLayer={selectedLayer}
                showClustering={showClustering}
                enableCoordinatePicker={false}
                onStationClick={(station) => {
                  setSelectedStation(station);
                  console.log('Station clicked:', station);
                }}
              />

              {/* Map Controls Overlay */}
              <MapControls
                selectedLayer={selectedLayer}
                onLayerChange={setSelectedLayer}
                showObsolete={showObsolete}
                onShowObsoleteChange={setShowObsolete}
                showClustering={showClustering}
                onShowClusteringChange={setShowClustering}
                regionFilter={regionFilter}
                onRegionFilterChange={setRegionFilter}
                stationCount={dutyStations.length}
                visibleCount={filteredStations.length}
              />
            </>
          )}
        </Box>

        {/* Selected Station Info */}
        {selectedStation && (
          <Paper elevation={2} sx={{ mt: 2, p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">
                  {selectedStation.NAME}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStation.COUNTRY || selectedStation.CTY} • Code: {selectedStation.DS}
                  {selectedStation.OBSOLETE === '1' && ' • Status: Obsolete'}
        </Typography>
                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                  {selectedStation.LATITUDE.toFixed(6)}, {selectedStation.LONGITUDE.toFixed(6)}
        </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => navigate(`/duty-stations/${selectedStation.DS}/${selectedStation.CTY}`)}
                >
                  View Details
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedStation(null)}
                >
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default MapsPage;
