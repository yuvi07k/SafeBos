import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

const LoadingContext = createContext({
  isLoading: false,
  setLoading: () => {},
  withLoading: async () => {},
  loadingMessage: '',
  setLoadingMessage: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export default function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Safety check to reset loading state on unmount
  useEffect(() => {
    return () => {
      setLoadingCount(0);
      setLoadingMessage('');
    };
  }, []);

  const setLoading = useCallback((loading, message = '') => {
    setLoadingCount((prev) => {
      // Prevent negative loading count
      const newCount = loading ? prev + 1 : Math.max(0, prev - 1);
      return newCount;
    });
    if (message) {
      setLoadingMessage(message);
    }
  }, []);

  const withLoading = useCallback(
    async (promise, message = '') => {
      setLoading(true, message);
      try {
        return await promise;
      } catch (error) {
        // Ensure loading state is cleared even if promise rejects
        setLoading(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const isLoading = loadingCount > 0;

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setLoading,
        withLoading,
        loadingMessage,
        setLoadingMessage,
      }}
    >
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
        open={isLoading}
      >
        <CircularProgress color="primary" />
        {loadingMessage && (
          <Typography variant="h6" color="inherit">
            {loadingMessage}
          </Typography>
        )}
      </Backdrop>
    </LoadingContext.Provider>
  );
} 