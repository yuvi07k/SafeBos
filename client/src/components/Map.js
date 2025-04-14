// src/components/Map.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getBostonNeighborhoodsGeoJSON } from '../services/api';

// Fix default icon issues in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const BostonMap = ({ neighborhoods }) => {
  const [bostonGeoJSON, setBostonGeoJSON] = useState(null);
  
  // Center the map on Boston
  const bostonCenter = [42.3601, -71.0589];

  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const data = await getBostonNeighborhoodsGeoJSON();
        setBostonGeoJSON(data);
      } catch (error) {
        console.error('Failed to load Boston GeoJSON:', error);
      }
    };
    fetchGeoJSON();
  }, []);

  // Filter GeoJSON features to only include those in the neighborhoods list.
  const filteredGeoJSON = React.useMemo(() => {
    if (!bostonGeoJSON || !neighborhoods || neighborhoods.length === 0) return bostonGeoJSON;
    
    // Create a set of allowed neighborhood names (in lowercase for consistency)
    const allowedNeighborhoods = new Set(
      neighborhoods.map(nb => nb.neighbourhood.trim().toLowerCase())
    );
    
    // Filter features based on the neighborhood property
    return {
      ...bostonGeoJSON,
      features: bostonGeoJSON.features.filter(feature => {
        if (feature.properties && feature.properties.neighbourhood) {
          const featureName = feature.properties.neighbourhood.trim().toLowerCase();
          return allowedNeighborhoods.has(featureName);
        }
        return false;
      })
    };
  }, [bostonGeoJSON, neighborhoods]);

  // Base style for polygons
  const polygonStyle = {
    fillColor: '#a2d9ff',
    color: '#005eff',
    weight: 2,
    fillOpacity: 0.2,
  };

  // Hover style for polygons
  const highlightStyle = {
    fillColor: '#66b2ff',
    color: '#005eff',
    weight: 3,
    fillOpacity: 0.4,
  };

  // Attach hover events to each feature
  const onEachFeature = (feature, layer) => {
    layer.on('mouseover', () => {
      layer.setStyle(highlightStyle);
      layer.bringToFront();
    });
    layer.on('mouseout', () => {
      layer.setStyle(polygonStyle);
    });
    layer.on('click', () => {
      console.log(`Clicked on: ${feature.properties.neighbourhood}`);
      // Optional: open a detail modal or update a sidebar
    });
  };

  const geoJSONOptions = {
    style: polygonStyle,
    onEachFeature,
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={bostonCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
        {/* Custom tile layer for a Zillow-like look */}
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
          url="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=otYP2IRStNhtEXZrMoaf	"
        />
        {filteredGeoJSON && <GeoJSON data={filteredGeoJSON} {...geoJSONOptions} />}
      </MapContainer>
    </div>
  );
};

export default BostonMap;






