import React, { useState, useEffect } from 'react';
import EnhancedMap from './EnhancedMap';
import { fetchCrimeData, fetchSchools, fetchTransitStops, fetchNeighborhoodBoundaries } from '../services/mapApi';

const MapContainer = () => {
  const [properties, setProperties] = useState([]);
  const [crimeData, setCrimeData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);
  const [transitData, setTransitData] = useState([]);
  const [neighborhoodData, setNeighborhoodData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [crime, schools, transit, neighborhoods] = await Promise.all([
          fetchCrimeData(),
          fetchSchools(),
          fetchTransitStops(),
          fetchNeighborhoodBoundaries()
        ]);

        // Transform data to only include essential location data
        setCrimeData(crime.map(item => ({
          latitude: item.latitude,
          longitude: item.longitude
        })));

        setSchoolData(schools.map(item => ({
          latitude: item.latitude,
          longitude: item.longitude
        })));

        setTransitData(transit.map(item => ({
          latitude: item.latitude,
          longitude: item.longitude
        })));

        setNeighborhoodData(neighborhoods);
        setError(null);
      } catch (err) {
        console.error('Error fetching map data:', err);
        setError('Failed to load map data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading map data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <EnhancedMap
        properties={properties}
        crimeData={crimeData}
        schoolData={schoolData}
        transitData={transitData}
        neighborhoodData={neighborhoodData}
        onMarkerClick={(property) => {
          console.log('Property clicked:', property);
        }}
      />
    </div>
  );
};

export default MapContainer; 