import { Container, Typography, Box } from '@mui/material';

function RequestsListPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Requests List
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Request management and history will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
}

export default RequestsListPage;
