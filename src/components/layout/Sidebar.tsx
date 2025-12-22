import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  List as ListIcon,
  Map as MapIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Search', icon: <SearchIcon />, path: '/search' },
  { text: 'Add Duty Station', icon: <AddIcon />, path: '/duty-station-request' },
  { text: 'Duty Stations', icon: <BusinessIcon />, path: '/duty-stations' },
  { text: 'Requests', icon: <ListIcon />, path: '/requests-list' },
  { text: 'Maps', icon: <MapIcon />, path: '/maps' },
  { text: 'Help', icon: <HelpIcon />, path: '/help' },
];

function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const theme = useTheme();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      role="navigation"
      aria-label="Main navigation"
      id="navigation"
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        minHeight: 64,
        px: 2,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
      }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Navigation
        </Typography>
        <IconButton 
          onClick={onClose}
          aria-label="Close navigation menu"
          sx={{ 
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* Menu Items */}
      <List sx={{ pt: 1 }} role="menu">
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding role="none">
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={onClose}
                role="menuitem"
                aria-current={isSelected ? 'page' : undefined}
                selected={isSelected}
                sx={{ 
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                    '& .MuiListItemText-primary': {
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    }
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isSelected ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

export default Sidebar;
