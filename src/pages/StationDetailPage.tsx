// Individual duty station detail page with visual correction capabilities
// Phase 6.5 Implementation

import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Map as MapIcon,
  Public as PublicIcon,
  Place as PlaceIcon,
  Code as CodeIcon,
  CheckCircle as ActiveIcon,
  Cancel as ObsoleteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAppData } from '../hooks/useAppData';
import { useBasket } from '../hooks/useBasket';
import { InteractiveMap } from '../components/mapping/InteractiveMap';
import type { DutyStation, MapCoordinates } from '../types/dutyStation';
import type { DutyStationRequest } from '../schemas/dutyStationSchema';

function StationDetailPage() {
  const { ds, cty } = useParams<{ ds: string; cty: string }>();
  const navigate = useNavigate();
  const { dutyStations, loading, error } = useAppData();
  const { addToBasket } = useBasket();

  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [selectedCoordinates, setSelectedCoordinates] = useState<MapCoordinates | null>(null);
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const [coordinateError, setCoordinateError] = useState('');
  const [justification, setJustification] = useState('');

  // Find the station
  const station = useMemo(() => {
    if (!ds || !cty) return null;
    
    // Find station by DS code and country code
    return dutyStations.find(
      (s) => s.DS.toUpperCase() === ds.toUpperCase() && s.CTY.toUpperCase() === cty.toUpperCase()
    );
  }, [dutyStations, ds, cty]);

  // Handle coordinate selection from map
  const handleLocationPicked = useCallback((coordinates: MapCoordinates) => {
    setSelectedCoordinates(coordinates);
    setManualLatitude(coordinates.latitude.toFixed(6));
    setManualLongitude(coordinates.longitude.toFixed(6));
    setCoordinateError('');
  }, []);

  // Handle manual coordinate input
  const handleManualLatitudeChange = (value: string) => {
    setManualLatitude(value);
    const lat = parseFloat(value);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      const lng = parseFloat(manualLongitude);
      if (!isNaN(lng) && lng >= -180 && lng <= 180) {
        setSelectedCoordinates({ latitude: lat, longitude: lng });
        setCoordinateError('');
      }
    } else if (value && isNaN(lat)) {
      setCoordinateError('Invalid latitude value');
    } else if (value && (lat < -90 || lat > 90)) {
      setCoordinateError('Latitude must be between -90 and 90');
    }
  };

  const handleManualLongitudeChange = (value: string) => {
    setManualLongitude(value);
    const lng = parseFloat(value);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      const lat = parseFloat(manualLatitude);
      if (!isNaN(lat) && lat >= -90 && lat <= 90) {
        setSelectedCoordinates({ latitude: lat, longitude: lng });
        setCoordinateError('');
      }
    } else if (value && isNaN(lng)) {
      setCoordinateError('Invalid longitude value');
    } else if (value && (lng < -180 || lng > 180)) {
      setCoordinateError('Longitude must be between -180 and 180');
    }
  };

  // Handle opening correction dialog
  const handleOpenCorrectionDialog = () => {
    setCorrectionDialogOpen(true);
    setSelectedCoordinates(null);
    setManualLatitude('');
    setManualLongitude('');
    setCoordinateError('');
    setJustification('');
  };

  // Handle closing correction dialog
  const handleCloseCorrectionDialog = () => {
    setCorrectionDialogOpen(false);
    setSelectedCoordinates(null);
    setManualLatitude('');
    setManualLongitude('');
    setCoordinateError('');
    setJustification('');
  };

  // Handle submitting coordinate correction
  const handleSubmitCorrection = () => {
    if (!station) return;

    const newLat = selectedCoordinates?.latitude ?? station.LATITUDE;
    const newLng = selectedCoordinates?.longitude ?? station.LONGITUDE;

    const request: DutyStationRequest = {
      requestType: 'coordinate_update',
      ds: station.DS,
      cty: station.CTY,
      name: station.NAME,
      latitude: newLat,
      longitude: newLng,
      commonName: station.COMMONNAME || undefined,
      justification: justification || 'Coordinate correction requested',
    };

    addToBasket(request);
    handleCloseCorrectionDialog();

    // Show success notification
    alert(`Coordinate correction added to basket!\n\nNew coordinates:\nLatitude: ${newLat.toFixed(6)}\nLongitude: ${newLng.toFixed(6)}`);
  };

  // Loading state
  if (loading && dutyStations.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={48} />
          <Typography variant="h6">Loading duty station details...</Typography>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Data</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  // Station not found
  if (!station) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          <AlertTitle>Duty Station Not Found</AlertTitle>
          The duty station with code <strong>{ds}</strong> in country <strong>{cty}</strong> could not be found.
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => navigate('/duty-stations')}>
              View All Duty Stations
            </Button>
          </Box>
        </Alert>
      </Container>
    );
  }

  const isObsolete = station.OBSOLETE === '1';
  const hasCoordinates = station.LATITUDE !== 0 || station.LONGITUDE !== 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          Home
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/duty-stations"
          onClick={(e) => {
            e.preventDefault();
            navigate('/duty-stations');
          }}
        >
          Duty Stations
        </Link>
        <Typography color="text.primary">{station.NAME}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="large">
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {station.NAME}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                icon={isObsolete ? <ObsoleteIcon /> : <ActiveIcon />}
                label={isObsolete ? 'Obsolete' : 'Active'}
                color={isObsolete ? 'default' : 'success'}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                Code: {station.DS} | Country: {station.CTY}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleOpenCorrectionDialog}
          disabled={isObsolete}
        >
          Request Correction
        </Button>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Station Information Cards */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PublicIcon color="primary" />
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Duty Station Code
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
                    {station.DS}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Official Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {station.NAME}
                  </Typography>
                </Grid>
                {station.COMMONNAME && station.COMMONNAME !== station.NAME && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Common Name
                    </Typography>
                    <Typography variant="body1">
                      {station.COMMONNAME}
                    </Typography>
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Country
                  </Typography>
                  <Typography variant="body1">
                    {station.COUNTRY || 'N/A'} ({station.CTY})
                  </Typography>
                </Grid>
                {station.REGION && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Region
                    </Typography>
                    <Typography variant="body1">
                      {station.REGION}
                    </Typography>
                  </Grid>
                )}
                {station.CLASS && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Classification
                    </Typography>
                    <Typography variant="body1">
                      Class {station.CLASS}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Coordinates Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="primary" />
                Geographic Coordinates
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {hasCoordinates ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Latitude
                    </Typography>
                    <Typography variant="h6" fontFamily="monospace" color="primary">
                      {station.LATITUDE.toFixed(6)}°
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Longitude
                    </Typography>
                    <Typography variant="h6" fontFamily="monospace" color="primary">
                      {station.LONGITUDE.toFixed(6)}°
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        startIcon={<MapIcon />}
                        onClick={() => setShowMap(!showMap)}
                      >
                        {showMap ? 'Hide Map' : 'Show Map'}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={handleOpenCorrectionDialog}
                        disabled={isObsolete}
                        sx={{ ml: 1 }}
                      >
                        Correct Coordinates
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  No coordinates available for this duty station.
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={handleOpenCorrectionDialog}>
                      Add Coordinates
                    </Button>
                  </Box>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Map View */}
        <Grid size={{ xs: 12, md: 6 }}>
          {hasCoordinates && showMap ? (
            <Paper sx={{ p: 2, height: '100%', minHeight: 400 }}>
              <Typography variant="h6" gutterBottom>
                Location on Map
              </Typography>
              <Box sx={{ height: 'calc(100% - 40px)', minHeight: 350 }}>
                <InteractiveMap
                  stations={[station]}
                  center={{ latitude: station.LATITUDE, longitude: station.LONGITUDE }}
                  zoom={12}
                  height="100%"
                  showClustering={false}
                  enableCoordinatePicker={false}
                />
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box>
                <PlaceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {hasCoordinates ? 'Map Hidden' : 'No Coordinates Available'}
                </Typography>
                {hasCoordinates && (
                  <Button variant="contained" onClick={() => setShowMap(true)} sx={{ mt: 2 }}>
                    Show Map
                  </Button>
                )}
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Additional Information */}
        {isObsolete && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="warning">
              <AlertTitle>Obsolete Duty Station</AlertTitle>
              This duty station has been marked as obsolete and is no longer active. Correction requests are disabled for obsolete stations.
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Correction Dialog */}
      <Dialog
        open={correctionDialogOpen}
        onClose={handleCloseCorrectionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Request Coordinate Correction
        </DialogTitle>
        <DialogContent>
          {/* Station Information Header */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h6" gutterBottom>
              {station.NAME}
            </Typography>
            <Typography variant="body2">
              {station.COUNTRY || 'N/A'} • Code: {station.DS}
            </Typography>
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You can either <strong>click on the map</strong> to select new coordinates, or <strong>enter them manually</strong> below.
          </Typography>

          {/* Manual Coordinate Entry */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Manual Coordinate Entry
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Latitude"
                  placeholder="-90 to 90"
                  value={manualLatitude}
                  onChange={(e) => handleManualLatitudeChange(e.target.value)}
                  error={!!coordinateError && coordinateError.includes('latitude')}
                  helperText="Range: -90 to 90"
                  InputProps={{
                    endAdornment: <Typography variant="caption">°</Typography>
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Longitude"
                  placeholder="-180 to 180"
                  value={manualLongitude}
                  onChange={(e) => handleManualLongitudeChange(e.target.value)}
                  error={!!coordinateError && coordinateError.includes('longitude')}
                  helperText="Range: -180 to 180"
                  InputProps={{
                    endAdornment: <Typography variant="caption">°</Typography>
                  }}
                />
              </Grid>
            </Grid>
            {coordinateError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {coordinateError}
              </Alert>
            )}
          </Paper>

          {/* Current vs New Coordinates Comparison */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Coordinate Comparison
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Current Coordinates</Typography>
                <Typography variant="body2" fontFamily="monospace">
                  Lat: {station.LATITUDE.toFixed(6)}°
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  Lng: {station.LONGITUDE.toFixed(6)}°
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">New Coordinates</Typography>
                {selectedCoordinates ? (
                  <>
                    <Typography variant="body2" fontFamily="monospace" color="primary" fontWeight="bold">
                      Lat: {selectedCoordinates.latitude.toFixed(6)}°
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace" color="primary" fontWeight="bold">
                      Lng: {selectedCoordinates.longitude.toFixed(6)}°
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Enter manually above or click on map below
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Interactive Map for Coordinate Selection */}
          <Box sx={{ height: 400, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <InteractiveMap
              stations={
                selectedCoordinates
                  ? [
                      {
                        ...station,
                        LATITUDE: selectedCoordinates.latitude,
                        LONGITUDE: selectedCoordinates.longitude,
                      },
                    ]
                  : [station]
              }
              center={
                selectedCoordinates
                  ? { latitude: selectedCoordinates.latitude, longitude: selectedCoordinates.longitude }
                  : { latitude: station.LATITUDE, longitude: station.LONGITUDE }
              }
              zoom={12}
              height="100%"
              showClustering={false}
              enableCoordinatePicker={true}
              onLocationPicked={handleLocationPicked}
            />
          </Box>

          {/* Justification */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Justification (Required)"
            placeholder="Please explain why these coordinates need to be corrected..."
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            helperText="Provide a clear reason for this coordinate correction request"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCorrectionDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitCorrection}
            disabled={!justification.trim() || !selectedCoordinates || !!coordinateError}
          >
            Add to Basket
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default StationDetailPage;

