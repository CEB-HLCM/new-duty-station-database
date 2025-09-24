import { Container, Typography, Box } from '@mui/material';

function MapsPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Maps
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Interactive mapping functionality will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
}

export default MapsPage;
