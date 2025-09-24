import { ThemeProvider, CssBaseline } from '@mui/material';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
