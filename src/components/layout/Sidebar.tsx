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
  Code as CodeIcon,
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
  { text: 'Code', icon: <CodeIcon />, path: '/code' },
];

function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: '#fafafa',
          borderRight: '1px solid #e0e0e0',
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
        backgroundColor: '#008fd5',
        color: 'white'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Navigation
        </Typography>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: 'white',
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
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={onClose}
                selected={isSelected}
                sx={{ 
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: '#e3f2fd',
                    borderLeft: '4px solid #008fd5',
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#008fd5',
                    },
                    '& .MuiListItemText-primary': {
                      color: '#008fd5',
                      fontWeight: 600,
                    }
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
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
