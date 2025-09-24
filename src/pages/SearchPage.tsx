import { Container, Typography, Box } from '@mui/material';

function SearchPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Duty Stations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search functionality will be implemented here following the original app design.
        </Typography>
      </Box>
    </Container>
  );
}

export default SearchPage;
