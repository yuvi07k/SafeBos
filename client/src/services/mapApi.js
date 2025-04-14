import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

export const fetchCrimeData = async () => {
  try {
    const response = await api.get('/crime-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching crime data:', error);
    return [];
  }
};

export const fetchSchools = async () => {
  try {
    const response = await api.get('/schools');
    return response.data;
  } catch (error) {
    console.error('Error fetching schools data:', error);
    return [];
  }
};

export const fetchTransitStops = async () => {
  try {
    const response = await api.get('/transit-stops');
    return response.data;
  } catch (error) {
    console.error('Error fetching transit data:', error);
    return [];
  }
};

export const fetchNeighborhoodBoundaries = async () => {
  try {
    console.log('Fetching neighborhood boundaries...');
    const response = await api.get('/neighborhood-boundaries');
    console.log('Neighborhood boundaries response:', response.data);
    if (!response.data || !response.data.features) {
      console.error('Invalid neighborhood boundaries data:', response.data);
      return null;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching neighborhood data:', error);
    return null;
  }
}; 