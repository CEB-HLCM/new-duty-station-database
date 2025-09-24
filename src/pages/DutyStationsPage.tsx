import { Container, Typography, Box } from '@mui/material';

function DutyStationsPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Duty Stations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Duty stations table with filtering and pagination will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
}

export default DutyStationsPage;
