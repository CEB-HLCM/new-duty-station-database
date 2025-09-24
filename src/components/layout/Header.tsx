import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Box,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  List as ListIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  requestCount: number;
}

function Header({ onMenuClick, requestCount }: HeaderProps) {
  const isDarkMode = false;

  return (
    <AppBar 
      position="fixed" 
      elevation={4}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#008fd5', // CEB primary blue
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ 
            mr: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Link 
            to="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <img 
              alt="UN Logo" 
              src="/assets/logo.svg" 
              style={{ 
                height: '3em'
              }} 
            />
          </Link>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            color="inherit" 
            aria-label="toggle dark mode"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          
          <Link 
            to="/requests-list"
            title={`You have ${requestCount} pending request(s).`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <IconButton 
              color="inherit" 
              aria-label="show requests"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Badge 
                badgeContent={requestCount} 
                color="secondary"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#ff4444',
                    color: 'white'
                  }
                }}
              >
                <ListIcon />
              </Badge>
            </IconButton>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
