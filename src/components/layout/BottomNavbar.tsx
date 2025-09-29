import {
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  List as ListIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavbarProps {
  requestCount: number;
}

const navigationItems = [
  { label: 'Home', icon: <HomeIcon />, path: '/', title: 'Home' },
  { label: 'Search', icon: <SearchIcon />, path: '/search', title: 'Search Duty Stations' },
  { label: 'Add', icon: <AddIcon />, path: '/duty-station-request', title: 'Add New Duty Station' },
  { label: 'Stations', icon: <BusinessIcon />, path: '/duty-stations', title: 'Duty Stations List' },
  { label: 'Requests', icon: <ListIcon />, path: '/requests-list', title: 'Requests' },
  { label: 'Help', icon: <HelpIcon />, path: '/help', title: 'Help' },
];

function BottomNavbar({ requestCount }: BottomNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const getCurrentValue = () => {
    const currentIndex = navigationItems.findIndex(item => item.path === location.pathname);
    return currentIndex >= 0 ? currentIndex : 0;
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    navigate(navigationItems[newValue].path);
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }} 
      elevation={8}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        showLabels={false}
        sx={{
          height: 56,
          backgroundColor: theme.palette.background.paper,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 12px 8px',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 600
              }
            },
            '&:not(.Mui-selected)': {
              color: theme.palette.text.secondary
            }
          }
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            title={item.title}
            icon={
              item.label === 'Requests' && requestCount > 0 ? (
                <Badge 
                  badgeContent={requestCount} 
                  color="secondary"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#ff4444',
                      color: 'white',
                      fontSize: '0.7rem',
                      minWidth: '16px',
                      height: '16px'
                    }
                  }}
                >
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )
            }
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNavbar;
