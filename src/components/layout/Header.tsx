import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
  requestCount: number;
}

function Header({ onMenuClick, requestCount }: HeaderProps) {
  return (
    <AppBar 
      position="fixed" 
      elevation={4}
      component="header"
      role="banner"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#008fd5', // CEB primary blue
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important' }}>
        <IconButton
          color="inherit"
          aria-label="Open navigation menu"
          aria-expanded="false"
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
            aria-label="UN Duty Station Codes - Go to homepage"
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <img 
              alt="United Nations Logo" 
              src="/assets/logo.svg" 
              role="img"
              style={{ 
                height: '3em'
              }} 
            />
          </Link>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ThemeToggle color="inherit" />
          
          <Link 
            to="/requests-list"
            title={`You have ${requestCount} pending request${requestCount !== 1 ? 's' : ''}`}
            aria-label={`View ${requestCount} pending request${requestCount !== 1 ? 's' : ''}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <IconButton 
              color="inherit"
              aria-label={`Requests list - ${requestCount} pending`} 
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
