// Request History Component
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Paper,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  DeleteOutline as DeleteIcon,
  Download as ExportIcon,
} from '@mui/icons-material';
import { loadHistory, clearHistory } from '../../services/basketService';
import type { RequestHistoryEntry } from '../../types/request';
import { RequestType } from '../../schemas/dutyStationSchema';

interface RequestHistoryProps {
  history?: RequestHistoryEntry[];
}

/**
 * History Row Component with Expandable Details
 */
const HistoryRow: React.FC<{ entry: RequestHistoryEntry }> = ({ entry }) => {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'processed':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'processed':
        return 'Processed';
      default:
        return status;
    }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          {new Date(entry.submittedAt).toLocaleDateString()} {new Date(entry.submittedAt).toLocaleTimeString()}
        </TableCell>
        <TableCell>
          {entry.status === 'processed' ? (
            <Chip label={entry.dutyStationCode || 'N/A'} color="success" size="small" />
          ) : (
            entry.dutyStationCode || 'N/A'
          )}
        </TableCell>
        <TableCell>
          {entry.status === 'processed' ? (
            <Chip label={entry.countryCode || 'N/A'} color="success" size="small" />
          ) : (
            entry.countryCode || 'N/A'
          )}
        </TableCell>
        <TableCell>{entry.stationName || 'N/A'}</TableCell>
        <TableCell>
          <Chip
            label={getStatusLabel(entry.status)}
            color={getStatusColor(entry.status) as any}
            size="small"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Request Details
              </Typography>
              <Table size="small" aria-label="details">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <strong>Submitted By</strong>
                    </TableCell>
                    <TableCell>{entry.request.submittedBy}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <strong>Organization</strong>
                    </TableCell>
                    <TableCell>{entry.request.organization}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <strong>Country Code</strong>
                    </TableCell>
                    <TableCell>{entry.countryCode || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <strong>Justification</strong>
                    </TableCell>
                    <TableCell>{entry.request.justification}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <strong>Request Date</strong>
                    </TableCell>
                    <TableCell>
                      {new Date(entry.request.requestDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

/**
 * Request History Component
 */
export const RequestHistory: React.FC<RequestHistoryProps> = ({ history: historyProp }) => {
  const [history, setHistory] = useState<RequestHistoryEntry[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (historyProp) {
      setHistory(historyProp);
      return;
    }

    const loadedHistory = loadHistory();
    setHistory(loadedHistory);

    // Listen for storage changes (other tabs/windows)
    const handleStorageChange = () => {
      const updated = loadHistory();
      setHistory(updated);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [historyProp]);

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  const handleExportHistory = () => {
    const headers = ['Submitted', 'Type', 'Station Code', 'Country Code', 'Station Name', 'Status', 'Submitted By', 'Organization', 'Justification', 'Request Date'];
    const rows = history.map(entry => [
      new Date(entry.submittedAt).toLocaleString(),
      entry.request.requestType,
      entry.dutyStationCode || '',
      entry.countryCode || '',
      entry.stationName || '',
      entry.status,
      entry.request.submittedBy,
      entry.request.organization,
      entry.request.justification,
      new Date(entry.request.requestDate).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `request-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            Request History
          </Typography>
          {history.length > 0 && (
            <Box>
              <IconButton
                aria-label="export history"
                color="primary"
                size="small"
                onClick={handleExportHistory}
              >
                <ExportIcon />
              </IconButton>
              <IconButton
                aria-label="clear history"
                color="error"
                size="small"
                onClick={() => setShowClearConfirm(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          Submission history is stored locally on this device. Please check your history from the same computer where the request was submitted.
        </Alert>

        {history.length === 0 && (
          <Alert severity="info">
            No submission history yet. Submit your first request to see it here.
          </Alert>
        )}

        {history.length > 0 && (
          <TableContainer component={Paper} variant="outlined">
            <Table aria-label="request history">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Submitted</TableCell>
                  <TableCell>DS Code</TableCell>
                  <TableCell>Country Code</TableCell>
                  <TableCell>Station Name</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((entry) => (
                  <HistoryRow key={entry.id} entry={entry} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {history.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Showing last {history.length} submissions (max 100)
          </Typography>
        )}
      </CardContent>

      {/* Clear History Confirmation Dialog */}
      <Dialog open={showClearConfirm} onClose={() => setShowClearConfirm(false)}>
        <DialogTitle>Clear Request History</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear your entire submission history? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearConfirm(false)}>Cancel</Button>
          <Button onClick={handleClearHistory} color="error" variant="contained">
            Clear History
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};





