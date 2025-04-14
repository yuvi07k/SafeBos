// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for retry logic
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and retry logic
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Initialize retry count if not present
    config.retryCount = config.retryCount || 0;
    
    // Check if we should retry
    if (config.retryCount < MAX_RETRIES) {
      config.retryCount += 1;
      
      // Calculate delay with exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, config.retryCount - 1);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return api(config);
    }
    
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      errorCode = `HTTP_${status}`;
      
      if (data && data.error) {
        errorMessage = data.error;
      } else if (status === 404) {
        errorMessage = 'The requested resource was not found';
      } else if (status === 401) {
        errorMessage = 'You are not authorized to access this resource';
      } else if (status === 403) {
        errorMessage = 'You do not have permission to perform this action';
      } else if (status === 500) {
        errorMessage = 'The server encountered an error';
      }
    } else if (error.request) {
      // Request was made but no response received
      errorCode = 'NETWORK_ERROR';
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else {
      // Error occurred in setting up the request
      errorCode = 'REQUEST_ERROR';
      errorMessage = error.message || 'Failed to make the request';
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.code = errorCode;
    enhancedError.originalError = error;
    
    return Promise.reject(enhancedError);
  }
);

const apiService = {
  // Neighborhood endpoints
  getNeighborhoods: async () => {
    try {
      const response = await api.get('/neighborhoods');
      return response.data;
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
      throw error;
    }
  },

  getMaxPrice: async () => {
    try {
      const response = await api.get('/max-price');
      return response.data;
    } catch (error) {
      console.error('Error fetching max price:', error);
      throw error;
    }
  },

  getNeighborhoodSummary: async (neighborhood) => {
    try {
      const response = await api.get(`/neighborhood-summary/${encodeURIComponent(neighborhood)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching neighborhood summary:', error);
      throw error;
    }
  },

  // Affordability endpoints
  getAffordability: async () => {
    try {
      const response = await api.get('/affordability');
      return response.data;
    } catch (error) {
      console.error('Error fetching affordability data:', error);
      throw error;
    }
  },

  // Search endpoint
  searchNeighborhoods: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      const response = await api.get(`/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  },

  // Get neighborhood comparison data
  getNeighborhoodComparison: async () => {
    try {
      const response = await api.get('/visualizations/neighborhood-comparison');
      return response.data;
    } catch (error) {
      console.error('Error fetching neighborhood comparison data:', error);
      throw error;
    }
  },

  // Get crime trends data
  getCrimeTrends: async () => {
    try {
      const response = await api.get('/visualizations/crime-trends');
      return response.data;
    } catch (error) {
      console.error('Error fetching crime trends data:', error);
      throw error;
    }
  },

  // Get property distribution data
  getPropertyDistribution: async () => {
    try {
      const response = await api.get('/visualizations/property-distribution');
      return response.data;
    } catch (error) {
      console.error('Error fetching property distribution data:', error);
      throw error;
    }
  }
};

export default apiService;

