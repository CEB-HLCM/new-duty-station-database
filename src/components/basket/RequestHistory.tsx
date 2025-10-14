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
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
} from '@mui/icons-material';
import { loadHistory } from '../../services/basketService';
import type { RequestHistoryEntry } from '../../types/request';
import { RequestType } from '../../schemas/dutyStationSchema';

/**
 * History Row Component with Expandable Details
 */
const HistoryRow: React.FC<{ entry: RequestHistoryEntry }> = ({ entry }) => {
  const [open, setOpen] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
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
          <Chip
            label={getRequestTypeLabel(entry.request.requestType)}
            color={getRequestTypeColor(entry.request.requestType) as any}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Chip
            label={entry.status}
            color={getStatusColor(entry.status) as any}
            size="small"
          />
        </TableCell>
        <TableCell>{entry.confirmationId || 'N/A'}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
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
export const RequestHistory: React.FC = () => {
  const [history, setHistory] = useState<RequestHistoryEntry[]>([]);

  useEffect(() => {
    const loadedHistory = loadHistory();
    setHistory(loadedHistory);

    // Listen for storage changes (other tabs/windows)
    const handleStorageChange = () => {
      const updated = loadHistory();
      setHistory(updated);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Request History
        </Typography>

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
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Confirmation ID</TableCell>
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
    </Card>
  );
};



