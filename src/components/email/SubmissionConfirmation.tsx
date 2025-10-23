// Submission confirmation dialog component
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import type { SubmissionResult } from '../../schemas/dutyStationSchema';

export interface SubmissionConfirmationProps {
  open: boolean;
  onClose: () => void;
  result: SubmissionResult | null;
  requestCount?: number;
}

/**
 * Submission Confirmation Dialog Component
 * Displays success/error information after request submission
 */
export const SubmissionConfirmation: React.FC<SubmissionConfirmationProps> = ({
  open,
  onClose,
  result,
  requestCount = 0,
}) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopyConfirmationId = () => {
    if (result.confirmationId) {
      navigator.clipboard.writeText(result.confirmationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {result.success ? (
            <>
              <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
              <Typography variant="h6" component="span">
                Submission Successful
              </Typography>
            </>
          ) : (
            <>
              <ErrorIcon color="error" sx={{ fontSize: 32 }} />
              <Typography variant="h6" component="span">
                Submission Failed
              </Typography>
            </>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {result.success ? (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your request{requestCount > 1 ? 's have' : ' has'} been successfully submitted to the UN CEB Duty Station team.
            </Alert>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(46, 125, 50, 0.04)'
                    : 'rgba(76, 175, 80, 0.08)',
              }}
            >
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Confirmation ID
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'monospace',
                    color: 'success.main',
                    letterSpacing: 1,
                  }}
                >
                  {result.confirmationId}
                </Typography>
                <Button
                  size="small"
                  startIcon={<CopyIcon />}
                  onClick={handleCopyConfirmationId}
                  variant="outlined"
                  color={copied ? 'success' : 'primary'}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <AssignmentIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Requests Submitted"
                    secondary={`${requestCount} request${requestCount > 1 ? 's' : ''}`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <ScheduleIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Submitted On"
                    secondary={result.submittedAt.toLocaleString()}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <EmailIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Notification"
                    secondary="Email sent to UN CEB Duty Station team"
                  />
                </ListItem>
              </List>
            </Paper>

            <Alert severity="info" variant="outlined">
              <Typography variant="body2">
                <strong>What happens next?</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                • The UN CEB team will review your request{requestCount > 1 ? 's' : ''}
              </Typography>
              <Typography variant="body2">
                • You will receive a response via email within 5-10 business days
              </Typography>
              <Typography variant="body2">
                • Keep your confirmation ID for reference
              </Typography>
            </Alert>
          </Box>
        ) : (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              There was a problem submitting your request{requestCount > 1 ? 's' : ''}. Please try again.
            </Alert>

            {result.errors && result.errors.length > 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'rgba(211, 47, 47, 0.04)'
                      : 'rgba(244, 67, 54, 0.08)',
                }}
              >
                <Typography variant="subtitle2" gutterBottom color="error">
                  Error Details:
                </Typography>
                <List dense>
                  {result.errors.map((error, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ErrorIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={error}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'error',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Troubleshooting:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                • Check your internet connection and try again
              </Typography>
              <Typography variant="body2">
                • Ensure all required fields are filled correctly
              </Typography>
              <Typography variant="body2">
                • If the problem persists, contact your IT support
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {result.success ? (
          <>
            <Button onClick={onClose} variant="outlined">
              View History
            </Button>
            <Button onClick={onClose} variant="contained" autoFocus>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button onClick={onClose} variant="contained" color="primary" autoFocus>
              Try Again
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

/**
 * Mini confirmation chip for inline display
 */
export interface ConfirmationChipProps {
  confirmationId: string;
  size?: 'small' | 'medium';
}

export const ConfirmationChip: React.FC<ConfirmationChipProps> = ({
  confirmationId,
  size = 'small',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(confirmationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Chip
      icon={<CheckCircleIcon />}
      label={copied ? 'Copied!' : confirmationId}
      color={copied ? 'success' : 'default'}
      size={size}
      onClick={handleCopy}
      sx={{
        fontFamily: 'monospace',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? 'rgba(46, 125, 50, 0.12)'
              : 'rgba(76, 175, 80, 0.16)',
        },
      }}
    />
  );
};

