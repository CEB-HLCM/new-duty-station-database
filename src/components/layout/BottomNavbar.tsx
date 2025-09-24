import {
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Groups as GroupsIcon,
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
  { label: 'Add', icon: <PersonAddIcon />, path: '/duty-station-request', title: 'Add New Duty Station' },
  { label: 'Stations', icon: <GroupsIcon />, path: '/duty-stations', title: 'Duty Stations List' },
  { label: 'Requests', icon: <ListIcon />, path: '/requests-list', title: 'Requests' },
  { label: 'Help', icon: <HelpIcon />, path: '/help', title: 'Help' },
];

function BottomNavbar({ requestCount }: BottomNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
        zIndex: (theme) => theme.zIndex.appBar
      }} 
      elevation={8}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        showLabels={false} // Hide labels to match CEB design
      >
        {navigationItems.map((item, index) => (
          <BottomNavigationAction
            key={item.path}
            title={item.title}
            icon={
              item.label === 'Requests' && requestCount > 0 ? (
                <Badge badgeContent={requestCount} color="secondary">
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
