import { Container, Typography, Box } from '@mui/material';

function HelpPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Help
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Help documentation and user guide will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
}

export default HelpPage;
