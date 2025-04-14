import React from 'react';
import {
  Box,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import PropTypes from 'prop-types';

function PropertyFilters({
  filters,
  onFilterChange,
  onApplyFilters,
  neighborhoods = [],
  propertyTypes = [],
  ...props
}) {
  const handleSliderChange = (name) => (_, value) => {
    onFilterChange({ [name]: value });
  };

  const handleSelectChange = (name) => (event) => {
    onFilterChange({ [name]: event.target.value });
  };

  const handleCheckboxChange = (name) => (event) => {
    onFilterChange({ [name]: event.target.checked });
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        ...props.sx,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Price Range */}
        <Box>
          <Typography gutterBottom>Price Range</Typography>
          <Slider
            value={[filters.minPrice, filters.maxPrice]}
            onChange={handleSliderChange('priceRange')}
            valueLabelDisplay="auto"
            min={0}
            max={2000000}
            step={10000}
            valueLabelFormat={(value) => `$${value.toLocaleString()}`}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">
              ${filters.minPrice.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              ${filters.maxPrice.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Neighborhood */}
        <FormControl fullWidth>
          <InputLabel>Neighborhood</InputLabel>
          <Select
            value={filters.neighborhood}
            onChange={handleSelectChange('neighborhood')}
            label="Neighborhood"
          >
            <MenuItem value="">All Neighborhoods</MenuItem>
            {neighborhoods.map((neighborhood) => (
              <MenuItem key={neighborhood.value} value={neighborhood.value}>
                {neighborhood.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Property Type */}
        <FormControl fullWidth>
          <InputLabel>Property Type</InputLabel>
          <Select
            value={filters.propertyType}
            onChange={handleSelectChange('propertyType')}
            label="Property Type"
          >
            <MenuItem value="">All Types</MenuItem>
            {propertyTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Bedrooms */}
        <FormControl fullWidth>
          <InputLabel>Bedrooms</InputLabel>
          <Select
            value={filters.bedrooms}
            onChange={handleSelectChange('bedrooms')}
            label="Bedrooms"
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value={1}>1+</MenuItem>
            <MenuItem value={2}>2+</MenuItem>
            <MenuItem value={3}>3+</MenuItem>
            <MenuItem value={4}>4+</MenuItem>
            <MenuItem value={5}>5+</MenuItem>
          </Select>
        </FormControl>

        {/* Bathrooms */}
        <FormControl fullWidth>
          <InputLabel>Bathrooms</InputLabel>
          <Select
            value={filters.bathrooms}
            onChange={handleSelectChange('bathrooms')}
            label="Bathrooms"
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value={1}>1+</MenuItem>
            <MenuItem value={2}>2+</MenuItem>
            <MenuItem value={3}>3+</MenuItem>
            <MenuItem value={4}>4+</MenuItem>
          </Select>
        </FormControl>

        {/* Square Footage */}
        <Box>
          <Typography gutterBottom>Square Footage</Typography>
          <Slider
            value={[filters.minArea, filters.maxArea]}
            onChange={handleSliderChange('areaRange')}
            valueLabelDisplay="auto"
            min={0}
            max={5000}
            step={100}
            valueLabelFormat={(value) => `${value} sqft`}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">{filters.minArea} sqft</Typography>
            <Typography variant="body2">{filters.maxArea} sqft</Typography>
          </Box>
        </Box>

        {/* Features */}
        <Box>
          <Typography gutterBottom>Features</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.hasParking}
                onChange={handleCheckboxChange('hasParking')}
              />
            }
            label="Parking"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.hasPool}
                onChange={handleCheckboxChange('hasPool')}
              />
            }
            label="Pool"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.hasGarden}
                onChange={handleCheckboxChange('hasGarden')}
              />
            }
            label="Garden"
          />
        </Box>

        {/* Apply Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={onApplyFilters}
          fullWidth
        >
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
}

PropertyFilters.propTypes = {
  filters: PropTypes.shape({
    minPrice: PropTypes.number.isRequired,
    maxPrice: PropTypes.number.isRequired,
    neighborhood: PropTypes.string,
    propertyType: PropTypes.string,
    bedrooms: PropTypes.string,
    bathrooms: PropTypes.string,
    minArea: PropTypes.number.isRequired,
    maxArea: PropTypes.number.isRequired,
    hasParking: PropTypes.bool,
    hasPool: PropTypes.bool,
    hasGarden: PropTypes.bool,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onApplyFilters: PropTypes.func.isRequired,
  neighborhoods: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  propertyTypes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

export default PropertyFilters; 