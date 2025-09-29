import { IconButton } from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';

interface ThemeToggleProps {
  color?: 'inherit' | 'default' | 'primary' | 'secondary';
  sx?: object;
}

function ThemeToggle({ color = 'inherit', sx }: ThemeToggleProps) {
  const { colorMode, toggleColorMode } = useThemeMode();

  return (
    <IconButton
      color={color}
      onClick={toggleColorMode}
      aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
      sx={{
        '&:hover': {
          backgroundColor: color === 'inherit' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.04)',
        },
        ...sx,
      }}
    >
      {colorMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}

export default ThemeToggle;
