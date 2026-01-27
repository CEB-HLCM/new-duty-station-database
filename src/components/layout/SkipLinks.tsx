// Skip links for keyboard navigation accessibility
import { Box, Link } from '@mui/material';

/**
 * Skip Links Component
 * Provides keyboard-accessible skip links for screen reader users
 * and keyboard navigation to jump to main content areas
 */
export const SkipLinks: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: -100,
        left: 0,
        zIndex: 9999,
        '& a': {
          position: 'absolute',
          left: '-9999px',
          padding: '8px 16px',
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          textDecoration: 'none',
          borderRadius: 1,
          '&:focus': {
            position: 'static',
            left: 'auto',
          },
        },
      }}
    >
      <Link href="#main-content" sx={{ mr: 1 }}>
        Skip to main content
      </Link>
      <Link href="#navigation" sx={{ mr: 1 }}>
        Skip to navigation
      </Link>
      <Link href="#search" sx={{ mr: 1 }}>
        Skip to search
      </Link>
    </Box>
  );
};




