import {
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';

// Import images (we'll need to add these to the public folder)
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
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          UN Duty Station Database Manager
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {navigationCards.map((card) => (
          <Grid
            key={card.title}
            item
            xs={12} sm={6} md={3}
          >
            <Card>
              <CardActionArea onClick={() => handleCardClick(card.path)}>
                <CardMedia
                  component="img"
                  height="140"
                  image={card.image}
                  alt={card.title}
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
  );
}

export default HomePage;
