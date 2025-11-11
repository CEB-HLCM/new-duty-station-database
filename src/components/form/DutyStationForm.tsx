import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Typography,
  Grid,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  Tooltip,
  Autocomplete,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import type { DutyStationRequest } from '../../schemas/dutyStationSchema';
import {
  RequestType,
  addDutyStationSchema,
  updateDutyStationSchema,
  removeDutyStationSchema,
  coordinateUpdateSchema,
} from '../../schemas/dutyStationSchema';
import { useFormPersistence } from '../../hooks/useFormPersistence';
import { FormMapPicker } from './FormMapPicker';
import { EnhancedCitySearch } from './EnhancedCitySearch';
import { CountrySelector } from './CountrySelector';
import { getUserPreferences, saveUserPreferences } from '../../services/userPreferencesService';
import { useAppData } from '../../hooks/useAppData';
import { searchDutyStations } from '../../services/searchService';
import type { SearchFilters } from '../../types/dutyStation';
import type { DutyStation } from '../../types/dutyStation';
import type { RequestType as RequestTypeValue } from '../../types/request';
import type { Country } from '../../types/dutyStation';
import type { CitySearchResult } from '../../services/locationService';

interface DutyStationFormProps {
  onSubmit: (request: DutyStationRequest) => void;
  onCancel?: () => void;
  initialData?: Partial<DutyStationRequest>;
  existingStation?: DutyStation;
}

/**
 * Duty Station Request Form Component
 * Supports all request types: add, update, remove, coordinate_update
 */
export const DutyStationForm: React.FC<DutyStationFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  existingStation,
}) => {
  const [requestType, setRequestType] = useState<RequestTypeValue>(
    (initialData?.requestType as RequestTypeValue) || RequestType.ADD
  );
  const [showMap, setShowMap] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [cityValidated, setCityValidated] = useState(false);
  // Track original auto-populated coordinates
  const [originalCoordinates, setOriginalCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [coordinatesManuallyChanged, setCoordinatesManuallyChanged] = useState(false);
  // For UPDATE/REMOVE/COORDINATE_UPDATE: selected station
  const [selectedStation, setSelectedStation] = useState<DutyStation | null>(existingStation || null);
  const [stationSearchQuery, setStationSearchQuery] = useState('');
  
  // Get duty stations data for search
  const { dutyStations, loading: stationsLoading } = useAppData();
  
  // Search stations when query changes (for UPDATE/REMOVE/COORDINATE_UPDATE)
  const stationSearchResults = useMemo(() => {
    if (!stationSearchQuery || stationSearchQuery.length < 2) return [];
    
    const filters: SearchFilters = {
      query: stationSearchQuery,
      searchType: 'partial',
      fields: ['NAME', 'DS', 'COMMONNAME'],
      countryFilter: '',
      showObsolete: true,
    };
    
    return searchDutyStations(dutyStations, filters)
      .slice(0, 10)
      .map(result => result.item);
  }, [stationSearchQuery, dutyStations]);
  
  // Handle station selection for UPDATE/REMOVE/COORDINATE_UPDATE
  const handleStationSelect = (station: DutyStation | null) => {
    setSelectedStation(station);
    
    if (station) {
      // Populate form fields based on request type
      if (requestType === RequestType.UPDATE) {
        form.setValue('dutyStationCode' as any, station.DS);
        form.setValue('countryCode' as any, station.CTY);
        form.setValue('stationName' as any, station.NAME);
        form.setValue('currentData' as any, {
          name: station.NAME,
          country: station.COUNTRY || '',
          commonName: station.COMMONNAME || '',
          coordinates: {
            latitude: station.LATITUDE,
            longitude: station.LONGITUDE,
          },
        });
        // Set current coordinates for map display
        form.setValue('currentCoordinates' as any, {
          latitude: station.LATITUDE,
          longitude: station.LONGITUDE,
        });
      } else if (requestType === RequestType.REMOVE) {
        form.setValue('dutyStationCode' as any, station.DS);
        form.setValue('countryCode' as any, station.CTY);
        form.setValue('currentData' as any, {
          name: station.NAME,
          country: station.COUNTRY || '',
          commonName: station.COMMONNAME || '',
        });
      } else if (requestType === RequestType.COORDINATE_UPDATE) {
        form.setValue('dutyStationCode' as any, station.DS);
        form.setValue('countryCode' as any, station.CTY);
        form.setValue('stationName' as any, station.NAME);
        form.setValue('currentCoordinates' as any, {
          latitude: station.LATITUDE,
          longitude: station.LONGITUDE,
        });
        // Initialize proposed coordinates with current ones
        form.setValue('proposedCoordinates' as any, {
          latitude: station.LATITUDE,
          longitude: station.LONGITUDE,
        });
        setShowMap(true);
      }
    } else {
      // Clear form fields when station is deselected
      if (requestType === RequestType.UPDATE) {
        form.setValue('dutyStationCode' as any, '');
        form.setValue('countryCode' as any, '');
        form.setValue('currentData' as any, undefined);
      } else if (requestType === RequestType.REMOVE) {
        form.setValue('dutyStationCode' as any, '');
        form.setValue('countryCode' as any, '');
        form.setValue('currentData' as any, undefined);
      } else if (requestType === RequestType.COORDINATE_UPDATE) {
        form.setValue('dutyStationCode' as any, '');
        form.setValue('countryCode' as any, '');
        form.setValue('currentCoordinates' as any, { latitude: 0, longitude: 0 });
        form.setValue('proposedCoordinates' as any, { latitude: 0, longitude: 0 });
      }
    }
  };

  // Determine validation schema based on request type
  const getSchema = () => {
    switch (requestType) {
      case RequestType.UPDATE:
        return updateDutyStationSchema;
      case RequestType.REMOVE:
        return removeDutyStationSchema;
      case RequestType.COORDINATE_UPDATE:
        return coordinateUpdateSchema;
      default:
        return addDutyStationSchema;
    }
  };

  const form = useForm<Partial<DutyStationRequest>>({
    resolver: zodResolver(getSchema()) as any,
    defaultValues: (() => {
      const userPrefs = getUserPreferences();
      return (initialData || {
        requestType,
        submittedBy: userPrefs?.email || '',
        organization: userPrefs?.organization || '',
        justification: '',
        // Add request fields with proper defaults
        name: '',
        country: '',
        countryCode: '',
        commonName: '',
        // proposedCode is optional and will be auto-generated by the system
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
        // Update request fields
        dutyStationCode: existingStation?.DS || '',
        stationName: existingStation?.NAME || '',
        currentCoordinates: existingStation ? {
          latitude: existingStation.LATITUDE,
          longitude: existingStation.LONGITUDE,
        } : { latitude: 0, longitude: 0 },
        currentData: existingStation ? {
          name: existingStation.NAME,
          country: existingStation.COUNTRY || '',
          commonName: existingStation.COMMONNAME || '',
          coordinates: {
            latitude: existingStation.LATITUDE,
            longitude: existingStation.LONGITUDE,
          },
        } : undefined,
        proposedChanges: {
          name: '',
          commonName: '',
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
        },
        // Coordinate update fields
        proposedCoordinates: {
          latitude: 0,
          longitude: 0,
        },
      }) as Partial<DutyStationRequest>;
    })(),
  });

  // Form persistence
  const { clearPersistedData } = useFormPersistence(form, {
    formType: requestType,
    enabled: true,
  });

  // Update requestType in form when it changes (ensures it's always in form state)
  useEffect(() => {
    form.setValue('requestType' as any, requestType);
  }, [requestType, form]);

  // Load user preferences on mount
  useEffect(() => {
    const userPrefs = getUserPreferences();
    if (userPrefs && !initialData) {
      form.setValue('submittedBy', userPrefs.email);
      form.setValue('organization', userPrefs.organization);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestTypeChange = (newType: RequestTypeValue) => {
    setRequestType(newType);
    // Reset form with new request type
    form.reset({
      requestType: newType,
      submittedBy: form.getValues('submittedBy') || getUserPreferences()?.email || '',
      organization: form.getValues('organization') || getUserPreferences()?.organization || '',
      justification: '',
      // Clear all type-specific fields
      name: '',
      country: '',
      countryCode: '',
      commonName: '',
      coordinates: { latitude: 0, longitude: 0 },
      dutyStationCode: '',
      stationName: '',
      currentCoordinates: { latitude: 0, longitude: 0 },
      currentData: undefined,
      proposedChanges: { name: '', commonName: '', coordinates: { latitude: 0, longitude: 0 } },
      proposedCoordinates: { latitude: 0, longitude: 0 },
    } as Partial<DutyStationRequest>);
    clearPersistedData();
    setSelectedCountry(null);
    setSelectedRegion(null);
    setCityValidated(false);
    setShowMap(false);
    // Reset coordinate tracking when request type changes
    setOriginalCoordinates(null);
    setCoordinatesManuallyChanged(false);
    // Reset station selection when request type changes
    setSelectedStation(null);
    setStationSearchQuery('');
  };

  const handleCountrySelect = (country: Country | null) => {
    setSelectedCountry(country);
    if (country) {
      // Auto-populate country code and name
      form.setValue('country', country.NAME);
      form.setValue('countryCode', country.CTYCD);
    } else {
      form.setValue('country', '');
      form.setValue('countryCode', '');
    }
    // Clear city when country changes
    form.setValue('name', '');
    setCityValidated(false);
    setShowMap(false); // Hide map when country changes
    // Reset coordinate tracking when country changes
    setOriginalCoordinates(null);
    setCoordinatesManuallyChanged(false);
  };

  const handleCitySelect = (city: CitySearchResult) => {
    // Auto-populate all city-related fields
    form.setValue('name', city.name);
    form.setValue('coordinates.latitude', city.coordinates.latitude);
    form.setValue('coordinates.longitude', city.coordinates.longitude);
    
    // Store original auto-populated coordinates
    setOriginalCoordinates({
      latitude: city.coordinates.latitude,
      longitude: city.coordinates.longitude,
    });
    setCoordinatesManuallyChanged(false);
    
    // If country wasn't selected, auto-select it based on city result
    if (!selectedCountry && city.countryCode) {
      form.setValue('countryCode', city.countryCode);
      // Note: We can't auto-select the country object without searching,
      // but the code is populated
    }
    
    setCityValidated(true);
    
    // Auto-show map for immediate visual verification
    setShowMap(true);
  };

  const handleFormSubmit = form.handleSubmit(
    (data) => {
      // Success: validation passed
      console.log('Form validation passed, submitting request:', data);
      // Ensure requestType is set correctly
      const requestData = {
        ...data,
        requestType: requestType,
      } as DutyStationRequest;
      onSubmit(requestData);
      form.reset();
      clearPersistedData();
      setSelectedCountry(null);
      setSelectedRegion(null);
      setCityValidated(false);
      setShowMap(false);
      // Reset station selection
      setSelectedStation(null);
      setStationSearchQuery('');
    },
    (errors) => {
      // Error: validation failed
      console.error('Form validation failed:', errors);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  );

  const handleCoordinateSelect = (latitude: number, longitude: number) => {
    if (requestType === RequestType.ADD) {
      form.setValue('coordinates.latitude' as any, latitude);
      form.setValue('coordinates.longitude' as any, longitude);
      
      // Check if coordinates differ from original auto-populated values
      if (originalCoordinates) {
        const latDiff = Math.abs(latitude - originalCoordinates.latitude);
        const lngDiff = Math.abs(longitude - originalCoordinates.longitude);
        // Consider changed if difference is more than 0.0001 degrees (~11 meters)
        if (latDiff > 0.0001 || lngDiff > 0.0001) {
          setCoordinatesManuallyChanged(true);
        }
      }
    } else if (requestType === RequestType.COORDINATE_UPDATE) {
      form.setValue('proposedCoordinates.latitude' as any, latitude);
      form.setValue('proposedCoordinates.longitude' as any, longitude);
    } else if (requestType === RequestType.UPDATE) {
      form.setValue('proposedChanges.coordinates.latitude' as any, latitude);
      form.setValue('proposedChanges.coordinates.longitude' as any, longitude);
    }
    setShowMap(false);
  };

  // Reset coordinates to original auto-populated values
  const handleResetCoordinates = () => {
    if (originalCoordinates && requestType === RequestType.ADD) {
      form.setValue('coordinates.latitude' as any, originalCoordinates.latitude);
      form.setValue('coordinates.longitude' as any, originalCoordinates.longitude);
      setCoordinatesManuallyChanged(false);
    }
  };

  // Watch for email and organization changes to save to preferences
  const watchedEmail = form.watch('submittedBy');
  const watchedOrganization = form.watch('organization');
  
  useEffect(() => {
    if (watchedEmail && watchedOrganization) {
      saveUserPreferences(watchedEmail, watchedOrganization);
    }
  }, [watchedEmail, watchedOrganization]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Submit Duty Station Request
        </Typography>

        <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 3 }}>
          {/* Validation Errors Alert */}
          {Object.keys(form.formState.errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Please fix the following errors:</strong>
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>
                    <Typography variant="caption">
                      <strong>{field}:</strong> {error?.message?.toString() || 'Invalid value'}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Request Type Selection */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="requestType"
                control={form.control}
                defaultValue={requestType}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Request Type</InputLabel>
                    <Select
                      {...field}
                      value={field.value || requestType}
                      label="Request Type"
                      onChange={(e) => {
                        const newType = e.target.value as RequestTypeValue;
                        field.onChange(newType);
                        handleRequestTypeChange(newType);
                      }}
                    >
                      <MenuItem value={RequestType.ADD}>Add New Duty Station</MenuItem>
                      <MenuItem value={RequestType.UPDATE}>Update Existing Duty Station</MenuItem>
                      <MenuItem value={RequestType.REMOVE}>Remove/Obsolete Duty Station</MenuItem>
                      <MenuItem value={RequestType.COORDINATE_UPDATE}>Update Coordinates Only</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* Submitter Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="submittedBy"
                control={form.control}
                defaultValue=""
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    label="Your Email"
                    type="email"
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message || 'Saved for future requests'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="organization"
                control={form.control}
                defaultValue=""
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    label="Organization"
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message || 'Saved for future requests'}
                  />
                )}
              />
            </Grid>

            {/* Request Type Specific Fields */}
            {requestType === RequestType.ADD && (
              <>
                {/* Step 1: Select Country with Region Filter */}
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📍 <strong>Step 1:</strong> Select Country
                    </Typography>
                    <Typography variant="caption">
                      Filter by region first to find your country faster, then select the country.
                      The country code will be auto-populated.
                    </Typography>
                  </Alert>
                  <CountrySelector
                    onCountrySelect={handleCountrySelect}
                    selectedRegion={selectedRegion || undefined}
                    onRegionChange={setSelectedRegion}
                    label="Country *"
                    required={true}
                    error={!!(form.formState.errors as any).country}
                    helperText={(form.formState.errors as any).country?.message}
                  />
                </Grid>

                {/* Step 2: Search for Real City */}
                {selectedCountry && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        🏙️ <strong>Step 2:</strong> Search for City/Town
                      </Typography>
                      <Typography variant="caption">
                        Type the real name of the city or town. We'll validate it and get accurate coordinates.
                      </Typography>
                    </Alert>
                    <EnhancedCitySearch
                      onCitySelect={handleCitySelect}
                      countryFilter={selectedCountry.ISO3 || selectedCountry.CTYCD}
                      countryName={selectedCountry.NAME}
                      label="City/Town Name *"
                      required={true}
                      error={!!(form.formState.errors as any).name}
                      helperText={(form.formState.errors as any).name?.message}
                    />
                  </Grid>
                )}

                {/* Hidden country code field (auto-populated) */}
                <input type="hidden" {...form.register('countryCode')} />
                <input type="hidden" {...form.register('country')} />
                <input type="hidden" {...form.register('name')} />

                {/* Common Name (Optional) */}
                {cityValidated && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="commonName"
                      control={form.control}
                      defaultValue=""
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          value={field.value || ''}
                          label="Common Name (Optional)"
                          fullWidth
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || 'Alternative name for the duty station'}
                        />
                      )}
                    />
                  </Grid>
                )}

                {/* Step 3: Review Coordinates */}
                {cityValidated && (
                  <Grid size={{ xs: 12 }}>
                    <Alert 
                      severity={coordinatesManuallyChanged ? "warning" : "success"} 
                      sx={{ mb: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            {coordinatesManuallyChanged ? '⚠️' : '✓'} <strong>Step 3:</strong> Location {coordinatesManuallyChanged ? 'Manually Adjusted' : 'Verified'}
                          </Typography>
                          <Typography variant="caption">
                            {coordinatesManuallyChanged ? (
                              <>
                                Coordinates have been manually adjusted from the original auto-populated values.
                                Click the reset button to restore original coordinates.
                              </>
                            ) : (
                              <>
                                Coordinates set from <strong>{form.watch('name')}</strong>. Review the map below to verify accuracy. Click the map to adjust if needed.
                              </>
                            )}
                          </Typography>
                        </Box>
                        {coordinatesManuallyChanged && originalCoordinates && (
                          <Tooltip title="Reset to original auto-populated coordinates">
                            <IconButton
                              size="small"
                              onClick={handleResetCoordinates}
                              color="warning"
                              sx={{ ml: 1 }}
                            >
                              <RefreshIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Alert>
                    
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name="coordinates.latitude"
                          control={form.control}
                          defaultValue={0}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              value={field.value ?? 0}
                              label="Latitude"
                              type="number"
                              fullWidth
                              required
                              disabled
                              inputProps={{ step: 0.000001, min: -90, max: 90 }}
                              error={!!fieldState.error}
                              helperText={
                                fieldState.error?.message || 
                                (coordinatesManuallyChanged 
                                  ? '⚠️ Manually adjusted' 
                                  : '✓ Auto-populated from city search')
                              }
                              InputProps={{
                                endAdornment: coordinatesManuallyChanged ? (
                                  <Chip 
                                    label="Modified" 
                                    size="small" 
                                    color="warning" 
                                    sx={{ mr: 1 }}
                                  />
                                ) : undefined,
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name="coordinates.longitude"
                          control={form.control}
                          defaultValue={0}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              value={field.value ?? 0}
                              label="Longitude"
                              type="number"
                              fullWidth
                              required
                              disabled
                              inputProps={{ step: 0.000001, min: -180, max: 180 }}
                              error={!!fieldState.error}
                              helperText={
                                fieldState.error?.message || 
                                (coordinatesManuallyChanged 
                                  ? '⚠️ Manually adjusted' 
                                  : '✓ Auto-populated from city search')
                              }
                              InputProps={{
                                endAdornment: coordinatesManuallyChanged ? (
                                  <Chip 
                                    label="Modified" 
                                    size="small" 
                                    color="warning" 
                                    sx={{ mr: 1 }}
                                  />
                                ) : undefined,
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowMap(!showMap)}
                      >
                        {showMap ? '🔼 Hide Map' : '🔽 Show Map'}
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        {showMap ? 'Click map to adjust location if needed' : 'Map auto-shows for verification'}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </>
            )}

            {requestType === RequestType.UPDATE && (
              <>
                {/* Step 1: Select Duty Station to Update */}
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📍 <strong>Step 1:</strong> Select Duty Station to Update
                    </Typography>
                    <Typography variant="caption">
                      Search for the duty station you want to update by name, code, or common name.
                    </Typography>
                  </Alert>
                  <Autocomplete
                    options={stationSearchResults}
                    getOptionLabel={(option) => 
                      `${option.NAME} - ${option.COUNTRY || option.CTY} (${option.DS})`
                    }
                    value={selectedStation}
                    onChange={(_, value) => handleStationSelect(value)}
                    inputValue={stationSearchQuery}
                    onInputChange={(_, value) => setStationSearchQuery(value)}
                    loading={stationsLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Duty Station *"
                        placeholder="Type station name, code, or common name..."
                        required
                        error={!!(form.formState.errors as any).dutyStationCode}
                        helperText={
                          (form.formState.errors as any).dutyStationCode?.message ||
                          (selectedStation ? `Selected: ${selectedStation.NAME} (${selectedStation.DS})` : 'Search and select a duty station')
                        }
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <>
                              {stationsLoading ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={`${option.DS}-${option.CTY}`}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {option.NAME}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Code: {option.DS} • Country: {option.COUNTRY || option.CTY}
                            {option.COMMONNAME && ` • Common: ${option.COMMONNAME}`}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    noOptionsText={
                      stationSearchQuery.length < 2 
                        ? 'Type at least 2 characters to search'
                        : 'No duty stations found'
                    }
                  />
                </Grid>

                {/* Hidden fields for form registration */}
                <input type="hidden" {...form.register('dutyStationCode' as any)} />
                <input type="hidden" {...form.register('countryCode' as any)} />
                <input type="hidden" {...form.register('stationName' as any)} />
                <input type="hidden" {...form.register('currentData' as any)} />
                <input type="hidden" {...form.register('currentCoordinates' as any)} />

                {/* Step 2: Update Fields (shown after station selection) */}
                {selectedStation && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          ✓ <strong>Step 2:</strong> Update Information
                        </Typography>
                        <Typography variant="caption">
                          Current station: <strong>{selectedStation.NAME}</strong> ({selectedStation.DS}, {selectedStation.COUNTRY})
                        </Typography>
                      </Alert>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name={"proposedChanges.name" as any}
                        control={form.control}
                        defaultValue=""
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value || ''}
                            label="New Name (Optional)"
                            fullWidth
                            placeholder={selectedStation.NAME}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message || 'Leave blank to keep current'}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name={"proposedChanges.commonName" as any}
                        control={form.control}
                        defaultValue=""
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value || ''}
                            label="New Common Name (Optional)"
                            fullWidth
                            placeholder={selectedStation.COMMONNAME || 'None'}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message || 'Leave blank to keep current'}
                          />
                        )}
                      />
                    </Grid>

                    {/* Optional: Update Coordinates */}
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setShowMap(!showMap)}
                        >
                          {showMap ? '🔼 Hide Map' : '🔽 Update Coordinates on Map'}
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                          {showMap ? 'Click map to update coordinates if needed' : 'Optional: Update GPS coordinates'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Map for coordinate update */}
                    {showMap && selectedStation && (
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ height: 400, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', mt: 2 }}>
                          <FormMapPicker
                            onLocationSelect={(lat, lng) => {
                              form.setValue('proposedChanges.coordinates.latitude' as any, lat);
                              form.setValue('proposedChanges.coordinates.longitude' as any, lng);
                              setShowMap(false);
                            }}
                            initialCenter={{
                              latitude: selectedStation.LATITUDE,
                              longitude: selectedStation.LONGITUDE,
                            }}
                          />
                        </Box>
                      </Grid>
                    )}
                  </>
                )}
              </>
            )}

            {requestType === RequestType.REMOVE && (
              <>
                {/* Step 1: Select Duty Station to Remove */}
                <Grid size={{ xs: 12 }}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      ⚠️ <strong>Step 1:</strong> Select Duty Station to Remove/Obsolete
                    </Typography>
                    <Typography variant="caption">
                      Search for the duty station you want to mark as obsolete.
                    </Typography>
                  </Alert>
                  <Autocomplete
                    options={stationSearchResults}
                    getOptionLabel={(option) => 
                      `${option.NAME} - ${option.COUNTRY || option.CTY} (${option.DS})`
                    }
                    value={selectedStation}
                    onChange={(_, value) => handleStationSelect(value)}
                    inputValue={stationSearchQuery}
                    onInputChange={(_, value) => setStationSearchQuery(value)}
                    loading={stationsLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Duty Station *"
                        placeholder="Type station name, code, or common name..."
                        required
                        error={!!(form.formState.errors as any).dutyStationCode}
                        helperText={
                          (form.formState.errors as any).dutyStationCode?.message ||
                          (selectedStation ? `Selected: ${selectedStation.NAME} (${selectedStation.DS})` : 'Search and select a duty station')
                        }
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <>
                              {stationsLoading ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={`${option.DS}-${option.CTY}`}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {option.NAME}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Code: {option.DS} • Country: {option.COUNTRY || option.CTY}
                            {option.COMMONNAME && ` • Common: ${option.COMMONNAME}`}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    noOptionsText={
                      stationSearchQuery.length < 2 
                        ? 'Type at least 2 characters to search'
                        : 'No duty stations found'
                    }
                  />
                </Grid>

                {/* Hidden fields */}
                <input type="hidden" {...form.register('dutyStationCode' as any)} />
                <input type="hidden" {...form.register('countryCode' as any)} />
                <input type="hidden" {...form.register('currentData' as any)} />

                {/* Confirmation when station selected */}
                {selectedStation && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="warning">
                      Requesting to mark as obsolete: <strong>{selectedStation.NAME}</strong> ({selectedStation.DS}, {selectedStation.COUNTRY})
                    </Alert>
                  </Grid>
                )}
              </>
            )}

            {requestType === RequestType.COORDINATE_UPDATE && (
              <>
                {/* Step 1: Select Duty Station */}
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📍 <strong>Step 1:</strong> Select Duty Station
                    </Typography>
                    <Typography variant="caption">
                      Search for the duty station whose coordinates you want to update.
                    </Typography>
                  </Alert>
                  <Autocomplete
                    options={stationSearchResults}
                    getOptionLabel={(option) => 
                      `${option.NAME} - ${option.COUNTRY || option.CTY} (${option.DS})`
                    }
                    value={selectedStation}
                    onChange={(_, value) => handleStationSelect(value)}
                    inputValue={stationSearchQuery}
                    onInputChange={(_, value) => setStationSearchQuery(value)}
                    loading={stationsLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Duty Station *"
                        placeholder="Type station name, code, or common name..."
                        required
                        error={!!(form.formState.errors as any).dutyStationCode}
                        helperText={
                          (form.formState.errors as any).dutyStationCode?.message ||
                          (selectedStation ? `Selected: ${selectedStation.NAME} (${selectedStation.DS})` : 'Search and select a duty station')
                        }
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <>
                              {stationsLoading ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={`${option.DS}-${option.CTY}`}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {option.NAME}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Code: {option.DS} • Country: {option.COUNTRY || option.CTY}
                            {option.COMMONNAME && ` • Common: ${option.COMMONNAME}`}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    noOptionsText={
                      stationSearchQuery.length < 2 
                        ? 'Type at least 2 characters to search'
                        : 'No duty stations found'
                    }
                  />
                </Grid>

                {/* Hidden fields */}
                <input type="hidden" {...form.register('dutyStationCode' as any)} />
                <input type="hidden" {...form.register('countryCode' as any)} />
                <input type="hidden" {...form.register('stationName' as any)} />
                <input type="hidden" {...form.register('currentCoordinates' as any)} />
                <input type="hidden" {...form.register('proposedCoordinates' as any)} />

                {/* Step 2: Update Coordinates (shown after station selection) */}
                {selectedStation && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Current coordinates for <strong>{selectedStation.NAME}</strong>: {selectedStation.LATITUDE.toFixed(6)}, {selectedStation.LONGITUDE.toFixed(6)}
                      </Alert>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Proposed New Coordinates
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Controller
                            name={"proposedCoordinates.latitude" as any}
                            control={form.control}
                            defaultValue={selectedStation.LATITUDE}
                            render={({ field, fieldState }) => (
                              <TextField
                                {...field}
                                value={field.value ?? selectedStation.LATITUDE}
                                label="New Latitude"
                                type="number"
                                fullWidth
                                required
                                inputProps={{ step: 0.000001, min: -90, max: 90 }}
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Controller
                            name={"proposedCoordinates.longitude" as any}
                            control={form.control}
                            defaultValue={selectedStation.LONGITUDE}
                            render={({ field, fieldState }) => (
                              <TextField
                                {...field}
                                value={field.value ?? selectedStation.LONGITUDE}
                                label="New Longitude"
                                type="number"
                                fullWidth
                                required
                                inputProps={{ step: 0.000001, min: -180, max: 180 }}
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setShowMap(!showMap)}
                        >
                          {showMap ? '🔼 Hide Map' : '🔽 Pick New Coordinates on Map'}
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                          {showMap ? 'Click map to select new coordinates' : 'Use map to visually select new coordinates'}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
              </>
            )}

            {/* Coordinate Picker Map - Only for ADD and COORDINATE_UPDATE (when not already shown) */}
            {showMap && requestType === RequestType.ADD && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ height: 400, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                  <FormMapPicker
                    onLocationSelect={handleCoordinateSelect}
                    initialCenter={
                      form.watch('coordinates.latitude') !== 0 && form.watch('coordinates.longitude') !== 0
                        ? {
                            latitude: form.watch('coordinates.latitude'),
                            longitude: form.watch('coordinates.longitude'),
                          }
                        : { latitude: 20, longitude: 0 }
                    }
                  />
                </Box>
              </Grid>
            )}

            {/* Map for COORDINATE_UPDATE (shown separately) */}
            {showMap && requestType === RequestType.COORDINATE_UPDATE && selectedStation && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ height: 400, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', mt: 2 }}>
                  <FormMapPicker
                    onLocationSelect={(lat, lng) => {
                      form.setValue('proposedCoordinates.latitude' as any, lat);
                      form.setValue('proposedCoordinates.longitude' as any, lng);
                      setShowMap(false);
                    }}
                    initialCenter={{
                      latitude: selectedStation.LATITUDE,
                      longitude: selectedStation.LONGITUDE,
                    }}
                  />
                </Box>
              </Grid>
            )}

            {/* Justification */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="justification"
                control={form.control}
                defaultValue=""
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    label="Justification"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    error={!!fieldState.error}
                    helperText={
                      fieldState.error?.message ||
                      'Please provide a detailed justification for this request (minimum 10 characters)'
                    }
                  />
                )}
              />
            </Grid>

            {/* Form Actions */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {onCancel && (
                  <Button variant="outlined" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="contained" color="primary">
                  Add to Basket
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

