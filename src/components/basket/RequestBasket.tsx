// Request Basket Component with Drag-and-Drop
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Paper,
  Grid,
  Collapse,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Send as SendIcon,
  Clear as ClearIcon,
  FileDownload as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BasketItem } from '../../schemas/dutyStationSchema';
import { RequestType } from '../../schemas/dutyStationSchema';
import { useAppData } from '../../hooks/useAppData';
import { getRegionFromCountryCode } from '../../utils/codeGenerator';

interface RequestBasketProps {
  basket: BasketItem[];
  onRemove: (itemId: string) => void;
  onReorder: (itemId: string, newPriority: number) => void;
  onSubmit: () => void;
  onClear: () => void;
  isSubmitting: boolean;
  emptyMessage?: string;
}

/**
 * Sortable Basket Item Component
 */
const SortableBasketItem: React.FC<{
  item: BasketItem;
  onRemove: (id: string) => void;
}> = ({ item, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const { countries } = useAppData();
  const [expanded, setExpanded] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case RequestType.ADD:
        return 'Add New';
      case RequestType.UPDATE:
        return 'Update';
      case RequestType.REMOVE:
        return 'Remove';
      case RequestType.COORDINATE_UPDATE:
        return 'Coordinates';
      default:
        return type;
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case RequestType.ADD:
        return 'success';
      case RequestType.UPDATE:
        return 'primary';
      case RequestType.REMOVE:
        return 'error';
      case RequestType.COORDINATE_UPDATE:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRequestDetails = () => {
    const { request } = item;
    
    switch (request.requestType) {
      case RequestType.ADD:
        const code = request.proposedCode || 'Pending...';
        const region = request.countryCode 
          ? getRegionFromCountryCode(request.countryCode, countries)
          : undefined;
        return {
          code,
          name: request.name || 'N/A',
          country: request.country || 'N/A',
          region: region || 'N/A',
          coordinates: request.coordinates 
            ? `${request.coordinates.latitude.toFixed(6)}, ${request.coordinates.longitude.toFixed(6)}`
            : 'N/A',
        };
      case RequestType.UPDATE:
        return {
          code: request.dutyStationCode || 'N/A',
          name: request.currentData?.name || 'N/A',
          country: request.currentData?.country || request.countryCode || 'N/A',
          region: request.countryCode 
            ? getRegionFromCountryCode(request.countryCode, countries)
            : 'N/A',
          coordinates: 'N/A',
        };
      case RequestType.REMOVE:
        return {
          code: request.dutyStationCode || 'N/A',
          name: request.currentData?.name || 'N/A',
          country: request.currentData?.country || 'N/A',
          region: 'N/A',
          coordinates: 'N/A',
        };
      case RequestType.COORDINATE_UPDATE:
        return {
          code: request.dutyStationCode || 'N/A',
          name: request.currentData?.name || request.stationName || 'N/A',
          country: request.currentData?.country || request.countryCode || 'N/A',
          region: request.countryCode 
            ? getRegionFromCountryCode(request.countryCode, countries)
            : 'N/A',
          coordinates: request.proposedCoordinates
            ? `${request.proposedCoordinates.latitude.toFixed(6)}, ${request.proposedCoordinates.longitude.toFixed(6)}`
            : 'N/A',
        };
      default:
        return {
          code: 'N/A',
          name: 'Unknown request',
          country: 'N/A',
          region: 'N/A',
          coordinates: 'N/A',
        };
    }
  };

  const details = getRequestDetails();

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
        {/* Drag Handle */}
        <IconButton
          size="small"
          {...attributes}
          {...listeners}
          sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
        >
          <DragIcon />
        </IconButton>

        {/* Priority Number */}
        <Chip
          label={item.priority}
          size="small"
          sx={{ minWidth: 40 }}
        />

        {/* Request Type */}
        <Chip
          label={getRequestTypeLabel(item.request.requestType)}
          color={getRequestTypeColor(item.request.requestType) as any}
          size="small"
        />

        {/* Code - MOST IMPORTANT */}
        <Chip
          label={`Code: ${details.code}`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
        />

        {/* Request Name */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight="medium" noWrap>
            {details.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {details.country} • {item.request.organization}
          </Typography>
        </Box>

        {/* Expand/Collapse Button */}
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>

        {/* Delete Button */}
        <IconButton
          size="small"
          onClick={() => onRemove(item.id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      {/* Expanded Details */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2, pl: 8, pr: 2, pb: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Duty Station Code</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                {details.code}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Name</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {details.name}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Country</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {details.country}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Region</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {details.region}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">GPS Coordinates</Typography>
              <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace' }}>
                {details.coordinates}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </ListItem>
  );
};

/**
 * Request Basket Component
 */
export const RequestBasket: React.FC<RequestBasketProps> = ({
  basket,
  onRemove,
  onReorder,
  onSubmit,
  onClear,
  isSubmitting,
  emptyMessage = 'Your basket is empty. Create a request using the form above to get started.',
}) => {
  const [confirmDialog, setConfirmDialog] = useState<'submit' | 'clear' | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = basket.findIndex(item => item.id === active.id);
      const newIndex = basket.findIndex(item => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(basket, oldIndex, newIndex);
        // Update priorities based on new order
        reordered.forEach((item, index) => {
          if (item.priority !== index + 1) {
            onReorder(item.id, index + 1);
          }
        });
      }
    }
  };

  const handleSubmit = () => {
    setConfirmDialog(null);
    onSubmit();
  };

  const handleClear = () => {
    setConfirmDialog(null);
    onClear();
  };

  const exportBasket = () => {
    const json = JSON.stringify(basket, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duty-station-requests-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Request Basket ({basket.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportBasket}
              disabled={basket.length === 0}
            >
              Export
            </Button>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => setConfirmDialog('clear')}
              disabled={basket.length === 0}
              color="error"
            >
              Clear
            </Button>
          </Box>
        </Box>

        {/* Empty State */}
        {basket.length === 0 && (
          <Alert severity="info">
            {emptyMessage}
          </Alert>
        )}

        {/* Basket Items */}
        {basket.length > 0 && (
          <>
            <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                💡 Drag items to reorder priority
              </Typography>
            </Paper>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={basket.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {basket.map(item => (
                    <SortableBasketItem
                      key={item.id}
                      item={item}
                      onRemove={onRemove}
                    />
                  ))}
                </List>
              </SortableContext>
            </DndContext>

            <Divider sx={{ my: 2 }} />

            {/* Submit Button */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<SendIcon />}
              onClick={() => setConfirmDialog('submit')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : `Submit ${basket.length} Request${basket.length !== 1 ? 's' : ''}`}
            </Button>
          </>
        )}

        {/* Confirmation Dialogs */}
        <Dialog open={confirmDialog === 'submit'} onClose={() => setConfirmDialog(null)}>
          <DialogTitle>Confirm Submission</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to submit <strong>{basket.length}</strong> request{basket.length !== 1 ? 's' : ''}?
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              A confirmation email will be sent to the addresses provided in each request.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Confirm Submission
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={confirmDialog === 'clear'} onClose={() => setConfirmDialog(null)}>
          <DialogTitle>Clear Basket</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to clear all <strong>{basket.length}</strong> request{basket.length !== 1 ? 's' : ''} from the basket?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button onClick={handleClear} variant="contained" color="error">
              Clear Basket
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

