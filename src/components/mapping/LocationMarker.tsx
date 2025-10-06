// Individual duty station marker component
import { Marker, Popup } from 'react-leaflet';
import { Box, Typography, Chip, Stack } from '@mui/material';
import L from 'leaflet';
import type { DutyStation } from '../../types/dutyStation';

// Fix for default marker icon issue in Leaflet
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const obsoleteIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
  className: 'obsolete-marker'
});

interface LocationMarkerProps {
  station: DutyStation;
  onClick?: (station: DutyStation) => void;
}

export const LocationMarker = ({ station, onClick }: LocationMarkerProps) => {
  const isObsolete = station.OBSOLETE === '1';
  const icon = isObsolete ? obsoleteIcon : defaultIcon;

  const handleMarkerClick = () => {
    if (onClick) {
      onClick(station);
    }
  };

  return (
    <Marker
      position={[station.LATITUDE, station.LONGITUDE]}
      icon={icon}
      eventHandlers={{
        click: handleMarkerClick
      }}
    >
      <Popup>
        <Box sx={{ minWidth: 200, maxWidth: 300 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {station.NAME}
          </Typography>
          
          <Stack spacing={1}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Code:
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {station.DS}
              </Typography>
            </Box>

            {station.COUNTRY && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Country:
                </Typography>
                <Typography variant="body2">
                  {station.COUNTRY} ({station.CTY})
                </Typography>
              </Box>
            )}

            {station.COMMONNAME && station.COMMONNAME !== station.NAME && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Common Name:
                </Typography>
                <Typography variant="body2">
                  {station.COMMONNAME}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary">
                Coordinates:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {station.LATITUDE.toFixed(6)}, {station.LONGITUDE.toFixed(6)}
              </Typography>
            </Box>

            {isObsolete && (
              <Chip
                label="Obsolete"
                size="small"
                color="error"
                sx={{ width: 'fit-content' }}
              />
            )}
          </Stack>
        </Box>
      </Popup>
    </Marker>
  );
};


