// Interactive mapping page for UN Duty Stations
import { useState, useMemo, useEffect } from 'react';
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
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { InteractiveMap } from '../components/mapping/InteractiveMap';
import { MapControls, type TileLayer } from '../components/mapping/MapControls';
import { useAppData } from '../hooks/useAppData';
import { useGeolocation } from '../hooks/useGeolocation';
import { geocodeAddress } from '../services/geocodingService';
import type { DutyStation, MapCoordinates } from '../types/dutyStation';

function MapsPage() {
  const { dutyStations, countries, loading, error, refreshData } = useAppData();
  
  const [selectedLayer, setSelectedLayer] = useState<TileLayer>('osm');
  const [showObsolete, setShowObsolete] = useState(false);
  const [showClustering, setShowClustering] = useState(true);
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

  // Filter stations based on obsolete toggle
  const filteredStations = useMemo(() => {
    return dutyStations.filter(station => 
      showObsolete || station.OBSOLETE === '0'
    );
  }, [dutyStations, showObsolete]);

  // Search functionality for autocomplete
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    
    const query = searchQuery.toLowerCase();
    return dutyStations
      .filter(station => 
        station.NAME.toLowerCase().includes(query) ||
        station.COUNTRY?.toLowerCase().includes(query) ||
        station.DS.toLowerCase().includes(query) ||
        station.COMMONNAME.toLowerCase().includes(query)
      )
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
              getOptionLabel={(option) => 
                `${option.NAME} - ${option.COUNTRY || option.CTY} (${option.DS})`
              }
              value={selectedStation}
              onChange={(_, value) => handleStationSelect(value)}
              onInputChange={(_, value) => setSearchQuery(value)}
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
                <li {...props} key={option.DS}>
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
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSelectedStation(null)}
              >
                Clear Selection
              </Button>
            </Stack>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default MapsPage;
