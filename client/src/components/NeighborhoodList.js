// src/components/NeighborhoodList.js
import React from 'react';
import '../styles/NeighborhoodList.css';

const NeighborhoodList = ({ neighborhoods }) => {
  return (
    <div className="neighborhood-list">
      <h2>Neighborhood Data</h2>
      <div className="card-container">
        {neighborhoods.map((nb) => (
          <div key={nb.id} className="card">
            <h3>{nb.neighbourhood}</h3>
            <p>Population: {nb.population?.toLocaleString() || 'N/A'}</p>
            <p>Median Income: {nb.median_family_income?.toLocaleString() || 'N/A'}</p>
            <p>Per Capita Income: {nb.per_capita_income?.toLocaleString() || 'N/A'}</p>
            <button className="view-button">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NeighborhoodList;

