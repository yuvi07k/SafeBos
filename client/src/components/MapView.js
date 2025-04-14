import React, { useState } from 'react';
import EnhancedMap from './EnhancedMap';
import { fetchCrimeData, fetchSchools, fetchTransitStops, fetchNeighborhoodBoundaries } from '../services/mapApi';

const MapView = () => {
  const [mapType, setMapType] = useState('transit');
  const [crimeData, setCrimeData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);
  const [transitData, setTransitData] = useState([]);
  const [neighborhoodData, setNeighborhoodData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [crime, schools, transit, neighborhoods] = await Promise.all([
          fetchCrimeData(),
          fetchSchools(),
          fetchTransitStops(),
          fetchNeighborhoodBoundaries()
        ]);

        setCrimeData(crime);
        setSchoolData(schools);
        setTransitData(transit);
        setNeighborhoodData(neighborhoods);
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading maps...</div>;
  }

  return (
    <div className="map-view">
      <div className="map-controls">
        <select 
          value={mapType} 
          onChange={(e) => setMapType(e.target.value)}
          className="map-selector"
        >
          <option value="transit">MBTA Transit Stops</option>
          <option value="schools">Schools</option>
          <option value="crime">Crime Heatmap</option>
          <option value="properties">Properties</option>
        </select>
      </div>

      <div className="map-container">
        <EnhancedMap
          mapType={mapType}
          crimeData={crimeData}
          schoolData={schoolData}
          transitData={transitData}
          neighborhoodData={neighborhoodData}
        />
      </div>

      <style jsx>{`
        .map-view {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .map-controls {
          padding: 1rem;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
        }

        .map-selector {
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .map-container {
          flex: 1;
          min-height: 500px;
        }
      `}</style>
    </div>
  );
};

export default MapView; 