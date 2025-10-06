// Coordinate picker component for selecting locations on map
import { useState, useCallback, useEffect } from 'react';
import { useMapEvents, Marker, Popup } from 'react-leaflet';
import { Box, Typography, Button, TextField, Stack } from '@mui/material';
import { MyLocation as MyLocationIcon } from '@mui/icons-material';
import L from 'leaflet';
import type { MapCoordinates } from '../../types/dutyStation';
import { reverseGeocode } from '../../services/geocodingService';
import { useGeolocation } from '../../hooks/useGeolocation';

// Custom icon for picked location
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const pickedIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: 'picked-location-marker'
});

interface CoordinatePickerProps {
  onLocationPicked?: (coordinates: MapCoordinates, address?: string) => void;
  initialCoordinates?: MapCoordinates;
}

export const CoordinatePicker = ({
  onLocationPicked,
  initialCoordinates
}: CoordinatePickerProps) => {
  const [pickedLocation, setPickedLocation] = useState<MapCoordinates | null>(
    initialCoordinates || null
  );
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { getCurrentPosition, coordinates: geoCoordinates } = useGeolocation();

  const map = useMapEvents({
    click: async (e) => {
      const coords: MapCoordinates = {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      };

      setPickedLocation(coords);
      setLoading(true);

      // Try to get address for the coordinates
      const result = await reverseGeocode(coords);
      if (result) {
        setAddress(result.displayName);
      }

      setLoading(false);

      if (onLocationPicked) {
        onLocationPicked(coords, result?.displayName);
      }
    }
  });

  const handleUseMyLocation = useCallback(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Watch for geolocation changes and update map when available
  useEffect(() => {
    if (geoCoordinates) {
      setPickedLocation(geoCoordinates);
      map.flyTo([geoCoordinates.latitude, geoCoordinates.longitude], 13);
      
      if (onLocationPicked) {
        onLocationPicked(geoCoordinates);
      }
    }
  }, [geoCoordinates, map, onLocationPicked]);

  const handleManualInput = (lat: number, lng: number) => {
    const coords: MapCoordinates = { latitude: lat, longitude: lng };
    setPickedLocation(coords);
    map.flyTo([lat, lng], 13);

    if (onLocationPicked) {
      onLocationPicked(coords);
    }
  };

  return (
    <>
      {pickedLocation && (
        <Marker
          position={[pickedLocation.latitude, pickedLocation.longitude]}
          icon={pickedIcon}
        >
          <Popup>
            <Box sx={{ minWidth: 250, maxWidth: 350 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Selected Location
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Coordinates:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {pickedLocation.latitude.toFixed(6)},{' '}
                    {pickedLocation.longitude.toFixed(6)}
                  </Typography>
                </Box>

                {address && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Address:
                    </Typography>
                    <Typography variant="body2">
                      {loading ? 'Loading...' : address}
                    </Typography>
                  </Box>
                )}

                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Latitude"
                    size="small"
                    type="number"
                    value={pickedLocation.latitude}
                    onChange={(e) =>
                      handleManualInput(
                        parseFloat(e.target.value),
                        pickedLocation.longitude
                      )
                    }
                    inputProps={{ step: 0.000001 }}
                  />
                  <TextField
                    label="Longitude"
                    size="small"
                    type="number"
                    value={pickedLocation.longitude}
                    onChange={(e) =>
                      handleManualInput(
                        pickedLocation.latitude,
                        parseFloat(e.target.value)
                      )
                    }
                    inputProps={{ step: 0.000001 }}
                  />
                </Stack>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<MyLocationIcon />}
                  onClick={handleUseMyLocation}
                  fullWidth
                >
                  Use My Location
                </Button>
              </Stack>
            </Box>
          </Popup>
        </Marker>
      )}
    </>
  );
};


