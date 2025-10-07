import {
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Box,
  Toolbar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';

const navigationCards = [
  {
    title: 'Search',
    description: 'Search for duty stations by name, country, or location',
    image: '/assets/search_768.png',
    path: '/search',
  },
  {
    title: 'Add Duty Station',
    description: 'Submit a request to add a new duty station',
    image: '/assets/add_768.png',
    path: '/duty-station-request',
  },
  {
    title: 'Duty Stations',
    description: 'Browse all duty stations with filtering and pagination',
    image: '/assets/duty_stations_768.png',
    path: '/duty-stations',
  },
  {
    title: 'Requests',
    description: 'View and manage your duty station requests',
    image: '/assets/requests_768.png',
    path: '/requests-list',
  },
];

function HomePage() {

  // EXACT replication of CEB Donor Codes HomePage structure
  return (
    <Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ marginBottom: '48px' }}>
          UN Duty Station Codes
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {navigationCards.map((card) => (
            <Grid
              key={card.title}
              size={{ xs: 12, sm: 6, md: 3 }}
            >
              <Card sx={{ maxWidth: 240 }}>
                <CardActionArea component={Link} to={card.path}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={card.image}
                    alt={card.title}
                    sx={{ objectFit: 'contain' }}
                  />
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default HomePage;
