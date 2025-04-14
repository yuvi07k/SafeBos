import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import PropTypes from 'prop-types';

// Set your Mapbox access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const EnhancedMap = ({ mapType, crimeData, schoolData, transitData, neighborhoodData }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Check if all required data is loaded
  useEffect(() => {
    const hasData = neighborhoodData && neighborhoodData.features;
    setDataLoaded(hasData);
  }, [neighborhoodData]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) {
      console.error('Map container not found');
      return;
    }

    try {
      console.log('Initializing map with token:', process.env.REACT_APP_MAPBOX_TOKEN);
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-71.0589, 42.3601], // Boston coordinates
        zoom: 12
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
        setLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map');
        setLoading(false);
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Function to add layers
  const addLayers = () => {
    if (!map.current || !mapLoaded || !dataLoaded) {
      console.log('Map or data not ready:', { 
        map: !!map.current, 
        loaded: mapLoaded, 
        data: dataLoaded 
      });
      return;
    }

    try {
      // Remove existing layers and sources
      const existingLayers = map.current.getStyle().layers.map(layer => layer.id);
      const existingSources = Object.keys(map.current.getStyle().sources);

      existingLayers.forEach(layerId => {
        if (map.current.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
      });

      existingSources.forEach(sourceId => {
        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }
      });

      // Add neighborhood boundaries
      if (neighborhoodData && neighborhoodData.features) {
        console.log('Adding neighborhood data:', neighborhoodData);
        map.current.addSource('neighborhoods', {
          type: 'geojson',
          data: neighborhoodData
        });

        // Add the fill layer
        map.current.addLayer({
          id: 'neighborhoods-fill',
          type: 'fill',
          source: 'neighborhoods',
          paint: {
            'fill-color': '#088',
            'fill-opacity': 0.1,
            'fill-outline-color': '#000'
          }
        });

        // Add the outline layer
        map.current.addLayer({
          id: 'neighborhoods-outline',
          type: 'line',
          source: 'neighborhoods',
          paint: {
            'line-color': '#000',
            'line-width': 2
          }
        });

        // Add the labels layer
        map.current.addLayer({
          id: 'neighborhoods-labels',
          type: 'symbol',
          source: 'neighborhoods',
          layout: {
            'text-field': ['get', 'neighborhood'],
            'text-size': 12,
            'text-anchor': 'center',
            'text-allow-overlap': false,
            'text-font': ['Open Sans Regular']
          },
          paint: {
            'text-color': '#000',
            'text-halo-color': '#fff',
            'text-halo-width': 2
          }
        });

        // Add hover effect
        map.current.on('mousemove', 'neighborhoods-fill', (e) => {
          if (e.features.length > 0) {
            map.current.getCanvas().style.cursor = 'pointer';
            const neighborhood = e.features[0].properties.neighborhood;
            console.log('Hovering over:', neighborhood);
          }
        });

        map.current.on('mouseleave', 'neighborhoods-fill', () => {
          map.current.getCanvas().style.cursor = '';
        });

        // Add click effect
        map.current.on('click', 'neighborhoods-fill', (e) => {
          if (e.features.length > 0) {
            const neighborhood = e.features[0].properties.neighborhood;
            const schoolCount = e.features[0].properties.school_count || 0;
            const transitStops = e.features[0].properties.transit_stops || 0;
            const crimeRate = e.features[0].properties.crime_rate || 0;

            // Create popup
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="padding: 10px;">
                  <h3 style="margin: 0 0 10px 0;">${neighborhood}</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                      <strong>Schools:</strong> ${schoolCount}
                    </div>
                    <div>
                      <strong>Transit Stops:</strong> ${transitStops}
                    </div>
                    <div>
                      <strong>Crime Rate:</strong> ${crimeRate.toFixed(2)}
                    </div>
                  </div>
                </div>
              `)
              .addTo(map.current);
          }
        });
      }

      // Add crime heatmap
      if (mapType === 'crime' && crimeData && crimeData.length > 0) {
        console.log('Adding crime data');
        map.current.addSource('crime', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: crimeData.map(crime => ({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [crime.longitude, crime.latitude]
              }
            }))
          }
        });

        map.current.addLayer({
          id: 'crime-heat',
          type: 'heatmap',
          source: 'crime',
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': 1,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.2, 'royalblue',
              0.4, 'cyan',
              0.6, 'lime',
              0.8, 'yellow',
              1, 'red'
            ],
            'heatmap-radius': 20,
            'heatmap-opacity': 0.8
          }
        });
      }

      // Add schools
      if (mapType === 'schools' && schoolData && schoolData.length > 0) {
        console.log('Adding school data');
        map.current.addSource('schools', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: schoolData.map(school => ({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [school.longitude, school.latitude]
              }
            }))
          }
        });

        map.current.addLayer({
          id: 'schools',
          type: 'circle',
          source: 'schools',
          paint: {
            'circle-radius': 8,
            'circle-color': '#ff0000',
            'circle-opacity': 0.8
          }
        });
      }

      // Add transit stops
      if (mapType === 'transit' && transitData && transitData.length > 0) {
        console.log('Adding transit data');
        map.current.addSource('transit', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: transitData.map(stop => ({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [stop.longitude, stop.latitude]
              }
            }))
          }
        });

        map.current.addLayer({
          id: 'transit',
          type: 'circle',
          source: 'transit',
          paint: {
            'circle-radius': 6,
            'circle-color': '#0000ff',
            'circle-opacity': 0.8
          }
        });
      }
    } catch (err) {
      console.error('Error adding layers:', err);
      setError('Failed to add map layers');
    }
  };

  // Update layers when data or map state changes
  useEffect(() => {
    if (mapLoaded && dataLoaded) {
      addLayers();
    }
  }, [mapLoaded, dataLoaded, mapType, crimeData, schoolData, transitData, neighborhoodData]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1
        }}>
          Loading map...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1
        }}>
          {error}
        </div>
      )}
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

EnhancedMap.propTypes = {
  mapType: PropTypes.oneOf(['transit', 'schools', 'crime', 'properties']),
  crimeData: PropTypes.arrayOf(PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired
  })),
  schoolData: PropTypes.arrayOf(PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired
  })),
  transitData: PropTypes.arrayOf(PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired
  })),
  neighborhoodData: PropTypes.shape({
    type: PropTypes.string.isRequired,
    features: PropTypes.array.isRequired
  })
};

export default EnhancedMap; 