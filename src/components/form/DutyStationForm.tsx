// Duty Station Request Form Component
import { useState } from 'react';
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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: initialData || {
      requestType,
      submittedBy: '',
      organization: '',
      justification: '',
      // Add request fields with proper defaults
      name: '',
      country: '',
      countryCode: '',
      commonName: '',
      proposedCode: '',
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
    },
  });

  // Form persistence
  const { clearPersistedData } = useFormPersistence(form, {
    formType: requestType,
    enabled: true,
  });

  const handleRequestTypeChange = (newType: RequestTypeValue) => {
    setRequestType(newType);
    form.reset();
    clearPersistedData();
    setSelectedCountry(null);
    setSelectedRegion(null);
    setCityValidated(false);
    setShowMap(false); // Hide map when request type changes
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
  };

  const handleCitySelect = (city: CitySearchResult) => {
    // Auto-populate all city-related fields
    form.setValue('name', city.name);
    form.setValue('coordinates.latitude', city.coordinates.latitude);
    form.setValue('coordinates.longitude', city.coordinates.longitude);
    
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

  const handleFormSubmit = form.handleSubmit((data) => {
    onSubmit(data as DutyStationRequest);
    form.reset();
    clearPersistedData();
  });

  const handleCoordinateSelect = (latitude: number, longitude: number) => {
    if (requestType === RequestType.ADD) {
      form.setValue('coordinates.latitude', latitude);
      form.setValue('coordinates.longitude', longitude);
    } else if (requestType === RequestType.COORDINATE_UPDATE) {
      form.setValue('proposedCoordinates.latitude', latitude);
      form.setValue('proposedCoordinates.longitude', longitude);
    } else if (requestType === RequestType.UPDATE) {
      form.setValue('proposedChanges.coordinates.latitude', latitude);
      form.setValue('proposedChanges.coordinates.longitude', longitude);
    }
    setShowMap(false);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Submit Duty Station Request
        </Typography>

        <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 3 }}>
          {/* Request Type Selection */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Request Type</InputLabel>
                <Select
                  value={requestType}
                  label="Request Type"
                  onChange={(e) => handleRequestTypeChange(e.target.value as RequestTypeValue)}
                >
                  <MenuItem value={RequestType.ADD}>Add New Duty Station</MenuItem>
                  <MenuItem value={RequestType.UPDATE}>Update Existing Duty Station</MenuItem>
                  <MenuItem value={RequestType.REMOVE}>Remove/Obsolete Duty Station</MenuItem>
                  <MenuItem value={RequestType.COORDINATE_UPDATE}>Update Coordinates Only</MenuItem>
                </Select>
              </FormControl>
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
                    helperText={fieldState.error?.message}
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
                    helperText={fieldState.error?.message}
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
                    error={!!form.formState.errors.country}
                    helperText={form.formState.errors.country?.message}
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
                      error={!!form.formState.errors.name}
                      helperText={form.formState.errors.name?.message}
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
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        ✓ <strong>Step 3:</strong> Location Verified
                      </Typography>
                      <Typography variant="caption">
                        Coordinates set from <strong>{form.watch('name')}</strong>. Review the map below to verify accuracy. Click the map to adjust if needed.
                      </Typography>
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
                              helperText={fieldState.error?.message || '✓ Auto-populated from city search'}
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
                              helperText={fieldState.error?.message || '✓ Auto-populated from city search'}
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

            {requestType === RequestType.UPDATE && existingStation && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info">
                    Updating: <strong>{existingStation.NAME}</strong> ({existingStation.DS}, {existingStation.COUNTRY})
                  </Alert>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="proposedChanges.name"
                    control={form.control}
                    defaultValue=""
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value || ''}
                        label="New Name (Optional)"
                        fullWidth
                        placeholder={existingStation.NAME}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || 'Leave blank to keep current'}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="proposedChanges.commonName"
                    control={form.control}
                    defaultValue=""
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value || ''}
                        label="New Common Name (Optional)"
                        fullWidth
                        placeholder={existingStation.COMMONNAME || 'None'}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || 'Leave blank to keep current'}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            {requestType === RequestType.REMOVE && existingStation && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="warning">
                  Requesting to mark as obsolete: <strong>{existingStation.NAME}</strong> ({existingStation.DS}, {existingStation.COUNTRY})
                </Alert>
              </Grid>
            )}

            {requestType === RequestType.COORDINATE_UPDATE && existingStation && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info">
                    Current coordinates for <strong>{existingStation.NAME}</strong>: {existingStation.LATITUDE.toFixed(6)}, {existingStation.LONGITUDE.toFixed(6)}
                  </Alert>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Proposed New Coordinates
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="proposedCoordinates.latitude"
                        control={form.control}
                        defaultValue={0}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value ?? 0}
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
                        name="proposedCoordinates.longitude"
                        control={form.control}
                        defaultValue={0}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value ?? 0}
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
                  <Button
                    variant="outlined"
                    onClick={() => setShowMap(!showMap)}
                    sx={{ mt: 1 }}
                  >
                    {showMap ? 'Hide Map' : 'Pick New Coordinates on Map'}
                  </Button>
                </Grid>
              </>
            )}

            {/* Coordinate Picker Map */}
            {showMap && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ height: 400, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                  <FormMapPicker
                    onLocationSelect={handleCoordinateSelect}
                    initialCenter={
                      existingStation
                        ? {
                            latitude: existingStation.LATITUDE,
                            longitude: existingStation.LONGITUDE,
                          }
                        : // Use current form coordinates if city was selected
                          form.watch('coordinates.latitude') !== 0 && form.watch('coordinates.longitude') !== 0
                          ? {
                              latitude: form.watch('coordinates.latitude'),
                              longitude: form.watch('coordinates.longitude'),
                            }
                          : { latitude: 20, longitude: 0 } // Default only if no coordinates yet
                    }
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

