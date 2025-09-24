import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { theme } from './theme/theme';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import DutyStationsPage from './pages/DutyStationsPage';
import DutyStationRequestPage from './pages/DutyStationRequestPage';
import RequestsListPage from './pages/RequestsListPage';
import MapsPage from './pages/MapsPage';
import HelpPage from './pages/HelpPage';
import CodePage from './pages/CodePage';
import { useEffect } from 'react';

// Global styles to match CEB Donor Codes app exactly
const globalStyles = {
  '*': {
    boxSizing: 'border-box',
  },
  html: {
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    height: '100%',
  },
  body: {
    margin: 0,
    padding: 0,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '0.875rem',
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
    backgroundColor: '#fafafa',
    color: '#111',
    height: '100%',
  },
  '#root': {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  // Scrollbar styling to match CEB app
  '::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: '#c1c1c1',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#a8a8a8',
    },
  },
};

function App() {
  // Remove loading class once React has loaded
  useEffect(() => {
    document.body.classList.add('app-loaded');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <GlobalStyles styles={globalStyles} />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/duty-stations" element={<DutyStationsPage />} />
            <Route path="/duty-station-request" element={<DutyStationRequestPage />} />
            <Route path="/requests-list" element={<RequestsListPage />} />
            <Route path="/maps" element={<MapsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/code" element={<CodePage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
