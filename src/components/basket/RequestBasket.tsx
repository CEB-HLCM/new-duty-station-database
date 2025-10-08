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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Send as SendIcon,
  Clear as ClearIcon,
  FileDownload as DownloadIcon,
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

interface RequestBasketProps {
  basket: BasketItem[];
  onRemove: (itemId: string) => void;
  onReorder: (itemId: string, newPriority: number) => void;
  onSubmit: () => void;
  onClear: () => void;
  isSubmitting: boolean;
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
        return `${request.name} (${request.country})`;
      case RequestType.UPDATE:
        return `${request.dutyStationCode} - ${request.countryCode}`;
      case RequestType.REMOVE:
        return `${request.dutyStationCode} - ${request.currentData.name}`;
      case RequestType.COORDINATE_UPDATE:
        return `${request.dutyStationCode} - ${request.stationName}`;
      default:
        return 'Unknown request';
    }
  };

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

        {/* Request Details */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" noWrap>
            {getRequestDetails()}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {item.request.organization} • {new Date(item.addedAt).toLocaleDateString()}
          </Typography>
        </Box>

        {/* Delete Button */}
        <IconButton
          size="small"
          onClick={() => onRemove(item.id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
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
            Your basket is empty. Create a request using the form above to get started.
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

