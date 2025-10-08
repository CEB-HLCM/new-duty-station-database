// Requests List Page - Shows submission history
import { Container, Typography, Box } from '@mui/material';
import { RequestHistory } from '../components/basket/RequestHistory';

/**
 * Requests List Page Component
 * Displays history of all submitted requests
 */
export const RequestsListPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Submission History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View all your previously submitted duty station requests
          </Typography>
        </Box>

        {/* Request History */}
        <RequestHistory />
      </Box>
    </Container>
  );
};
