import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useLoading } from '../contexts/LoadingContext';
import apiService from '../services/api';

export function useApiQuery(key, apiCall, options = {}) {
  const { enqueueSnackbar } = useSnackbar();
  const { withLoading } = useLoading();

  return useQuery(
    key,
    async () => {
      try {
        return await withLoading(apiCall());
      } catch (error) {
        enqueueSnackbar(error.message || 'An error occurred', {
          variant: 'error',
        });
        throw error;
      }
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      ...options,
    }
  );
}

export function useApiMutation(mutationFn, options = {}) {
  const { enqueueSnackbar } = useSnackbar();
  const { withLoading } = useLoading();
  const queryClient = useQueryClient();

  return useMutation(
    async (data) => {
      try {
        return await withLoading(mutationFn(data));
      } catch (error) {
        enqueueSnackbar(error.message || 'An error occurred', {
          variant: 'error',
        });
        throw error;
      }
    },
    {
      onSuccess: (data, variables, context) => {
        enqueueSnackbar('Operation successful', {
          variant: 'success',
        });
        if (options.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        if (options.onError) {
          options.onError(error, variables, context);
        }
      },
      onSettled: () => {
        if (options.invalidateQueries) {
          queryClient.invalidateQueries(options.invalidateQueries);
        }
      },
      ...options,
    }
  );
}

export function useApiState(initialState = {}) {
  const [state, setState] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }, [errors]);

  const setFieldValue = useCallback((name, value) => {
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
    setErrors({});
  }, [initialState]);

  return {
    state,
    setState,
    errors,
    setErrors,
    handleChange,
    setFieldValue,
    resetState,
  };
} 