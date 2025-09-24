import { ReactNode, useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNavbar from './BottomNavbar';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestCount] = useState(0); // TODO: Connect to basket context

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        onMenuClick={handleSidebarToggle}
        requestCount={requestCount}
      />
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar 
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant={isMobile ? 'temporary' : 'persistent'}
        />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: 8, // Account for fixed AppBar
            pb: 8, // Account for bottom navigation
            px: 3,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: !isMobile && sidebarOpen ? 0 : `-${240}px`,
            ...(isMobile && {
              marginLeft: 0,
            }),
          }}
        >
          {children}
        </Box>
      </Box>
      
      <BottomNavbar requestCount={requestCount} />
    </Box>
  );
}

export default Layout;
