// src/components/FilterPanel.js
import React, { useState } from 'react';
import '../styles/FilterPanel.css';

const FilterPanel = ({ neighborhoods, onFilterChange }) => {
  const [minPopulation, setMinPopulation] = useState('');
  const [minIncome, setMinIncome] = useState('');

  const handleApplyFilters = () => {
    let filtered = [...neighborhoods];
    if (minPopulation) {
      filtered = filtered.filter(nb => (nb.population || 0) >= parseInt(minPopulation, 10));
    }
    if (minIncome) {
      filtered = filtered.filter(nb => (nb.median_family_income || 0) >= parseFloat(minIncome));
    }
    onFilterChange(filtered);
  };

  const handleReset = () => {
    setMinPopulation('');
    setMinIncome('');
    onFilterChange(neighborhoods); // show all
  };

  return (
    <div className="filter-panel">
      <h2>Filter Neighborhoods</h2>
      <div className="filter-group">
        <label>Min Population:</label>
        <input
          type="number"
          value={minPopulation}
          onChange={(e) => setMinPopulation(e.target.value)}
          placeholder="e.g. 20000"
        />
      </div>
      <div className="filter-group">
        <label>Min Median Income:</label>
        <input
          type="number"
          value={minIncome}
          onChange={(e) => setMinIncome(e.target.value)}
          placeholder="e.g. 60000"
        />
      </div>
      <div className="filter-actions">
        <button onClick={handleApplyFilters}>Apply</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default FilterPanel;


