import type { ReactNode } from 'react';
import { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNavbar from './BottomNavbar';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestCount] = useState(0);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        onMenuClick={handleSidebarToggle}
        requestCount={requestCount}
      />
      
      <Sidebar 
        open={sidebarOpen}
        onClose={handleSidebarClose}
      />
      
      {/* Main content area with proper spacing */}
      <Box 
        component="main" 
        sx={{
          flexGrow: 1,
          pt: '64px', // AppBar height
          pb: '56px', // BottomNavigation height
          minHeight: 'calc(100vh - 64px - 56px)',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box sx={{ 
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
          width: '100%'
        }}>
          {children}
        </Box>
      </Box>
      
      <BottomNavbar requestCount={requestCount} />
    </Box>
  );
}

export default Layout;
