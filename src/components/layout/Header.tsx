import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingBasket as BasketIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';

interface HeaderProps {
  onMenuClick: () => void;
  requestCount: number;
}

function Header({ onMenuClick, requestCount }: HeaderProps) {
  // TODO: Connect to theme context for dark mode toggle
  const isDarkMode = false;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          UN Duty Station Database Manager
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" aria-label="toggle theme">
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          
          <IconButton color="inherit" aria-label="request basket">
            <Badge badgeContent={requestCount} color="secondary">
              <BasketIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
