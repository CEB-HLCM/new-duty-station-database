// Requests List Page - Shows current basket of pending requests and submission history
import { Container, Typography, Box, Grid, Alert, Chip, Snackbar } from '@mui/material';
import { WarningAmber as WarningIcon } from '@mui/icons-material';
import { RequestBasket } from '../components/basket/RequestBasket';
import { RequestHistory } from '../components/basket/RequestHistory';
import { SubmissionConfirmation } from '../components/email/SubmissionConfirmation';
import { useBasket } from '../hooks/useBasket';
import { useData } from '../context/DataContext';
import { useState, useEffect, useCallback } from 'react';
import { loadHistory } from '../services/basketService';
import type { SubmissionResult } from '../schemas/dutyStationSchema';
import type { RequestHistoryEntry } from '../types/request';

/**
 * Requests List Page Component
 * Displays the current basket of pending requests and submission history
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
  const [history, setHistory] = useState<RequestHistoryEntry[]>([]);

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

  const { getDutyStationByCode, isDataLoaded } = useData();

  // Load history and cross-check with duty stations data
  const refreshHistory = useCallback(() => {
    const loadedHistory = loadHistory();

    // Cross-check: if dutyStationCode exists in GitHub data, mark as 'processed'
    const enriched = loadedHistory.map(entry => {
      if (entry.status !== 'submitted') return entry;
      if (!entry.dutyStationCode) return entry;

      const exists = isDataLoaded && getDutyStationByCode(entry.dutyStationCode);
      if (exists) {
        return { ...entry, status: 'processed' as const };
      }
      return entry;
    });

    setHistory(enriched);
  }, [isDataLoaded, getDutyStationByCode]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // Refresh history after submission
  const handleBasketSubmit = async () => {
    try {
      const result = await submitBasket();
      setSubmissionResult(result);
      setShowConfirmation(true);
      // Reload history after items move from basket to history
      setTimeout(refreshHistory, 100);
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
    refreshHistory();
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
            If a request shows as "Processed" in the history below, it means the duty station code has been successfully added to the CEB Secretariat Duty Station database.
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

        {/* Request History */}
        <Box sx={{ mt: 4 }}>
          <RequestHistory history={history} />
        </Box>

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
