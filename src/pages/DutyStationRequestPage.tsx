// Duty Station Request Page
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { DutyStationForm } from '../components/form/DutyStationForm';
import { RequestBasket } from '../components/basket/RequestBasket';
import { RequestHistory } from '../components/basket/RequestHistory';
import { useBasket } from '../hooks/useBasket';
import type { DutyStationRequest } from '../schemas/dutyStationSchema';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`request-tabpanel-${index}`}
      aria-labelledby={`request-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * Duty Station Request Page Component
 */
export const DutyStationRequestPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const {
    basket,
    stats,
    addToBasket,
    removeFromBasket,
    reorderBasket,
    clearBasket,
    submitBasket,
    isSubmitting,
  } = useBasket();

  const handleFormSubmit = (request: DutyStationRequest) => {
    try {
      addToBasket(request);
      setSnackbar({
        open: true,
        message: 'Request added to basket successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to add request to basket',
        severity: 'error',
      });
    }
  };

  const handleBasketSubmit = async () => {
    try {
      const result = await submitBasket();
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: `Successfully submitted ${basket.length} request(s)! Confirmation: ${result.confirmationId}`,
          severity: 'success',
        });
        // Switch to history tab to show submitted requests
        setCurrentTab(2);
      } else {
        setSnackbar({
          open: true,
          message: `Submission failed: ${result.errors?.join(', ')}`,
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Submission failed',
        severity: 'error',
      });
    }
  };

  const handleBasketClear = () => {
    clearBasket();
    setSnackbar({
      open: true,
      message: 'Basket cleared successfully',
      severity: 'info',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Duty Station Requests
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Submit requests to add, update, remove duty stations or update coordinates
          </Typography>

          {/* Statistics Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            <Chip
              label={`${stats.totalItems} Total`}
              color="default"
              size="small"
            />
            <Chip
              label={`${stats.addRequests} Add`}
              color="success"
              size="small"
            />
            <Chip
              label={`${stats.updateRequests} Update`}
              color="primary"
              size="small"
            />
            <Chip
              label={`${stats.removeRequests} Remove`}
              color="error"
              size="small"
            />
            <Chip
              label={`${stats.coordinateUpdateRequests} Coordinates`}
              color="warning"
              size="small"
            />
          </Box>
        </Box>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Note:</strong> Requests are queued in your basket and can be submitted in bulk.
          Use drag-and-drop to prioritize requests before submission.
        </Alert>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            aria-label="request tabs"
            variant="fullWidth"
          >
            <Tab
              icon={<AddIcon />}
              label="Create Request"
              id="request-tab-0"
              aria-controls="request-tabpanel-0"
            />
            <Tab
              icon={<ListIcon />}
              label={`Basket (${basket.length})`}
              id="request-tab-1"
              aria-controls="request-tabpanel-1"
            />
            <Tab
              icon={<HistoryIcon />}
              label="History"
              id="request-tab-2"
              aria-controls="request-tabpanel-2"
            />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <DutyStationForm
                onSubmit={handleFormSubmit}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <RequestBasket
                basket={basket}
                onRemove={removeFromBasket}
                onReorder={reorderBasket}
                onSubmit={handleBasketSubmit}
                onClear={handleBasketClear}
                isSubmitting={isSubmitting}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <RequestHistory />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};
