import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { PlayCircleOutline } from '@mui/icons-material';

function HelpPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          How To Use
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Watch the tutorial video below to learn how to use the Duty Station Database application
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          backgroundColor: 'background.paper'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 3,
            gap: 1
          }}
        >
          <PlayCircleOutline color="primary" />
          <Typography variant="h6" component="h2">
            Tutorial Video
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <video 
            src="/videos/how_to_use.mp4" 
            controls
            style={{ 
              width: '100%',
              maxWidth: '800px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            aria-label="Tutorial video on how to use the duty station database"
          >
            Your browser does not support the video tag.
          </video>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body1" color="text.secondary">
          In case of any technical questions or problems, please reach out to the CEB Secretariat directly.
        </Typography>
      </Box>
    </Container>
  );
}

export default HelpPage;
