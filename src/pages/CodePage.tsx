import { Container, Typography, Box } from '@mui/material';

function CodePage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Code View
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Duty station code details will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
}

export default CodePage;
