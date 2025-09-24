import { createTheme } from '@mui/material/styles';

// Color palette adapted from UN Duty Station Database
export const dutyStationColors = {
  primary: '#008fd5',      // UN Blue - AppBar background
  tableHeader: '#96C8DA',  // Table header background
  buttonHover: '#4cafff',  // Button hover state
  selected: '#2185d0',     // Selected/active state
  tableAlt: '#ababab',     // Table alternate row background
  tableBorder: '#777',     // Table borders
  white: '#ffffff',
  textPrimary: '#111',     // Main text color
  textSecondary: '#666',
  // Action colors matching original app
  viewAction: '#00b04f',      // Green for view actions
  editAction: '#f2711c',      // Orange for edit actions  
  deleteAction: '#db2828',    // Red for delete actions
} as const;

const themeOptions = {
  defaultColorScheme: 'light',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: dutyStationColors.primary,
          contrastText: dutyStationColors.white,
        },
        secondary: {
          main: dutyStationColors.tableHeader,
          contrastText: dutyStationColors.white,
        },
        info: {
          main: dutyStationColors.buttonHover,
        },
        background: {
          default: '#fafafa',
          paper: dutyStationColors.white,
        },
        text: {
          primary: dutyStationColors.textPrimary,
          secondary: dutyStationColors.textSecondary,
        },
        // Custom action colors matching original app
        action: {
          view: dutyStationColors.viewAction,
          viewHover: '#00a043',
          edit: dutyStationColors.editAction,
          editHover: '#e86100',
          delete: dutyStationColors.deleteAction,
          deleteHover: '#c41e3a',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#4cafff',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#64b5f6',
          contrastText: '#ffffff',
        },
        info: {
          main: '#81c784',
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.7)',
        },
        // Custom action colors for dark mode
        action: {
          view: '#4caf50',
          viewHover: '#388e3c',
          edit: '#ff9800',
          editHover: '#f57c00',
          delete: '#f44336',
          deleteHover: '#d32f2f',
        },
      },
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      '"Fira Sans"',
      '"Droid Sans"',
      '"Helvetica Neue"',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    // Table typography to match original
    body2: {
      fontFamily: '"Trebuchet MS", Arial, Helvetica, sans-serif',
    },
  },
  components: {
    // AppBar styling with dark mode support
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.applyStyles('light', {
            backgroundColor: dutyStationColors.primary,
            color: dutyStationColors.white,
          }),
          ...theme.applyStyles('dark', {
            backgroundColor: '#1976d2',
            color: '#ffffff',
          }),
        }),
      },
    },
    // Button styling with dark mode support
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          borderRadius: 4,
        },
        contained: ({ theme }) => ({
          ...theme.applyStyles('light', {
            '&:hover': {
              backgroundColor: dutyStationColors.buttonHover,
            },
          }),
          ...theme.applyStyles('dark', {
            '&:hover': {
              filter: 'brightness(1.1)',
            },
          }),
        }),
        outlined: ({ theme }) => ({
          ...theme.applyStyles('light', {
            borderColor: dutyStationColors.buttonHover,
            color: dutyStationColors.buttonHover,
            '&:hover': {
              backgroundColor: dutyStationColors.buttonHover,
              color: dutyStationColors.white,
            },
          }),
          ...theme.applyStyles('dark', {
            borderColor: '#4cafff',
            color: '#4cafff',
            '&:hover': {
              backgroundColor: '#4cafff',
              color: '#000000',
            },
          }),
        }),
      },
    },
    // Table styling with dark mode support
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiTableCell-head': {
            fontWeight: 600,
            ...theme.applyStyles('light', {
              backgroundColor: dutyStationColors.tableHeader,
              color: dutyStationColors.white,
              border: `1px solid ${dutyStationColors.tableBorder}`,
            }),
            ...theme.applyStyles('dark', {
              backgroundColor: '#2e2e2e',
              color: '#ffffff',
              border: '1px solid #555',
            }),
          },
        }),
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.applyStyles('light', {
            '& .MuiTableRow-root:nth-of-type(odd)': {
              backgroundColor: dutyStationColors.tableAlt,
            },
            '& .MuiTableCell-body': {
              border: `1px solid ${dutyStationColors.tableBorder}`,
              fontFamily: '"Trebuchet MS", Arial, Helvetica, sans-serif',
            },
          }),
          ...theme.applyStyles('dark', {
            '& .MuiTableRow-root:nth-of-type(odd)': {
              backgroundColor: '#2a2a2a',
            },
            '& .MuiTableCell-body': {
              border: '1px solid #555',
              fontFamily: '"Trebuchet MS", Arial, Helvetica, sans-serif',
            },
          }),
        }),
      },
    },
    MuiTable: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderCollapse: 'collapse' as const,
          ...theme.applyStyles('light', {
            border: `3px solid ${dutyStationColors.tableBorder}`,
          }),
          ...theme.applyStyles('dark', {
            border: '3px solid #555',
          }),
        }),
      },
    },
    // Pagination styling with dark mode support
    MuiPaginationItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '1rem',
          ...theme.applyStyles('light', {
            '&.Mui-selected': {
              backgroundColor: `${dutyStationColors.selected} !important`,
              color: `${dutyStationColors.white} !important`,
            },
          }),
          ...theme.applyStyles('dark', {
            '&.Mui-selected': {
              backgroundColor: '#4cafff !important',
              color: '#000000 !important',
            },
          }),
        }),
      },
    },
    // Drawer styling
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 240,
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);

export default theme;
