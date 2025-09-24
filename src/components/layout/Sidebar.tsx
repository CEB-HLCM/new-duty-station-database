import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  LocationCity as LocationIcon,
  Add as AddIcon,
  List as ListIcon,
  Map as MapIcon,
  Help as HelpIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'persistent' | 'temporary';
}

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Search', icon: <SearchIcon />, path: '/search' },
  { text: 'Duty Stations', icon: <LocationIcon />, path: '/duty-stations' },
  { text: 'Add Duty Station', icon: <AddIcon />, path: '/duty-station-request' },
  { text: 'Requests', icon: <ListIcon />, path: '/requests-list' },
  { text: 'Maps', icon: <MapIcon />, path: '/maps' },
  { text: 'Help', icon: <HelpIcon />, path: '/help' },
  { text: 'Code', icon: <CodeIcon />, path: '/code' },
];

function Sidebar({ open, onClose, variant }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default Sidebar;
