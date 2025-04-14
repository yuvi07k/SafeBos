// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import 'leaflet/dist/leaflet.css';
import theme from './theme';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingProvider from './contexts/LoadingContext';

// Import pages
import HomePage from './pages/HomePage';
import NeighborhoodPage from './pages/NeighborhoodPage';
import SearchPage from './pages/SearchPage';
import AffordabilityPage from './pages/AffordabilityPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              autoHideDuration={3000}
            >
              <LoadingProvider>
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/neighborhoods" element={<NeighborhoodPage />} />
                    <Route path="/neighborhood/:name" element={<NeighborhoodPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/affordability" element={<AffordabilityPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Layout>
              </LoadingProvider>
            </SnackbarProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;



