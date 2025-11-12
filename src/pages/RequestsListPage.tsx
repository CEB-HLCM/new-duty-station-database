// Requests List Page - Shows current basket of pending requests
import { Container, Typography, Box, Grid, Alert, Chip, Snackbar } from '@mui/material';
import { WarningAmber as WarningIcon } from '@mui/icons-material';
import { RequestBasket } from '../components/basket/RequestBasket';
import { SubmissionConfirmation } from '../components/email/SubmissionConfirmation';
import { useBasket } from '../hooks/useBasket';
import { useState } from 'react';
import type { SubmissionResult } from '../schemas/dutyStationSchema';

/**
 * Requests List Page Component
 * Displays the current basket of pending requests that need to be sent to CEB dev team
 */
export const RequestsListPage: React.FC = () => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    basket,
    stats,
    removeFromBasket,
    reorderBasket,
    clearBasket,
    submitBasket,
    isSubmitting,
    isEmailConfigured,
  } = useBasket();

  const handleBasketSubmit = async () => {
    try {
      const requestCount = basket.length;
      const result = await submitBasket();
      
      // Show submission confirmation dialog
      setSubmissionResult(result);
      setShowConfirmation(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Submission failed',
        severity: 'error',
      });
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    
    // Clear result after a delay
    setTimeout(() => setSubmissionResult(null), 300);
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
            Requests List
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your pending duty station requests. These requests will be sent to the CEB dev team for processing.
          </Typography>

          {/* Statistics Chips */}
          {basket.length > 0 && (
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
          )}
        </Box>

        {/* Info Alerts */}
        {!isEmailConfigured && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            <strong>Email Not Configured:</strong> EmailJS is not configured. Requests will be simulated
            and saved to history, but no actual email will be sent. Configure EmailJS environment variables
            to enable real email submissions.
          </Alert>
        )}
        
        {basket.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Note:</strong> These are your pending requests that will be sent to the CEB dev team.
            Use drag-and-drop to prioritize requests before submission.
          </Alert>
        )}

        {/* Request Basket */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <RequestBasket
              basket={basket}
              onRemove={removeFromBasket}
              onReorder={reorderBasket}
              onSubmit={handleBasketSubmit}
              onClear={handleBasketClear}
              isSubmitting={isSubmitting}
              emptyMessage="Your requests basket is empty. Go to the 'Add Duty Station' page to create new requests."
            />
          </Grid>
        </Grid>

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

        {/* Submission Confirmation Dialog */}
        <SubmissionConfirmation
          open={showConfirmation}
          onClose={handleConfirmationClose}
          result={submissionResult}
          requestCount={submissionResult ? basket.length : 0}
        />
      </Box>
    </Container>
  );
};
