import { Container, Typography, Box } from '@mui/material';

function DutyStationRequestPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add Duty Station
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Duty station request form will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
}

export default DutyStationRequestPage;
