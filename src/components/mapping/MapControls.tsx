// Map controls component for layer switching and filtering
import { Box, Paper, ToggleButtonGroup, ToggleButton, FormControlLabel, Switch, Stack, Typography } from '@mui/material';
import { Layers as LayersIcon, Satellite as SatelliteIcon, Terrain as TerrainIcon, Map as MapIcon } from '@mui/icons-material';

export type TileLayer = 'osm' | 'satellite' | 'terrain';

interface MapControlsProps {
  selectedLayer: TileLayer;
  onLayerChange: (layer: TileLayer) => void;
  showObsolete: boolean;
  onShowObsoleteChange: (show: boolean) => void;
  showClustering: boolean;
  onShowClusteringChange: (show: boolean) => void;
  stationCount?: number;
  visibleCount?: number;
}

export const MapControls = ({
  selectedLayer,
  onLayerChange,
  showObsolete,
  onShowObsoleteChange,
  showClustering,
  onShowClusteringChange,
  stationCount,
  visibleCount
}: MapControlsProps) => {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000,
        p: 2,
        minWidth: 280,
        bgcolor: 'background.paper'
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LayersIcon fontSize="small" />
            Map Layers
          </Typography>
          <ToggleButtonGroup
            value={selectedLayer}
            exclusive
            onChange={(_, value) => value && onLayerChange(value)}
            size="small"
            fullWidth
            sx={{ mt: 1 }}
          >
            <ToggleButton value="osm" aria-label="OpenStreetMap">
              <MapIcon fontSize="small" sx={{ mr: 0.5 }} />
              Street
            </ToggleButton>
            <ToggleButton value="satellite" aria-label="Satellite">
              <SatelliteIcon fontSize="small" sx={{ mr: 0.5 }} />
              Satellite
            </ToggleButton>
            <ToggleButton value="terrain" aria-label="Terrain">
              <TerrainIcon fontSize="small" sx={{ mr: 0.5 }} />
              Terrain
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Display Options
          </Typography>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={showObsolete}
                  onChange={(e) => onShowObsoleteChange(e.target.checked)}
                  size="small"
                />
              }
              label="Show obsolete stations"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showClustering}
                  onChange={(e) => onShowClusteringChange(e.target.checked)}
                  size="small"
                />
              }
              label="Enable clustering"
            />
          </Stack>
        </Box>

        {(stationCount !== undefined || visibleCount !== undefined) && (
          <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Showing {visibleCount?.toLocaleString() ?? 0} of{' '}
              {stationCount?.toLocaleString() ?? 0} stations
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};


