import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

function NeighborhoodSummary({ data, loading }) {
  if (loading) {
    return <CircularProgress />;
  }

  const { demographics } = data;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Neighborhood Overview
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {/* Demographics */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Demographics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              Population: {demographics.population.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Median Family Income: ${demographics.median_family_income.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Per Capita Income: ${demographics.per_capita_income.toLocaleString()}
            </Typography>
          </Box>
        </Grid>

        {/* Property Statistics */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Property Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              Median Property Value: ${data.property_stats.median_property_value.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Total Properties: {data.property_stats.total_properties.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Median Living Area: {data.property_stats.median_living_area.toLocaleString()} sq ft
            </Typography>
            <Typography variant="body2">
              Median Year Built: {data.property_stats.median_year_built}
            </Typography>
          </Box>
        </Grid>

        {/* Crime Statistics */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Crime Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              Total Crimes: {data.crime_stats.total_crimes.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Crime Rate: {data.crime_stats.crime_rate.toFixed(2)} per 1000 residents
            </Typography>
          </Box>
        </Grid>

        {/* Amenities */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Amenities
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              Schools: {data.amenities.schools.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              MBTA Stops: {data.amenities.mbta_stops.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Restaurants: {data.amenities.restaurants.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

NeighborhoodSummary.propTypes = {
  data: PropTypes.shape({
    demographics: PropTypes.shape({
      population: PropTypes.number.isRequired,
      median_family_income: PropTypes.number.isRequired,
      per_capita_income: PropTypes.number.isRequired,
    }).isRequired,
    property_stats: PropTypes.shape({
      median_property_value: PropTypes.number.isRequired,
      total_properties: PropTypes.number.isRequired,
      median_living_area: PropTypes.number.isRequired,
      median_year_built: PropTypes.number.isRequired,
    }).isRequired,
    crime_stats: PropTypes.shape({
      total_crimes: PropTypes.number.isRequired,
      crime_rate: PropTypes.number.isRequired,
    }).isRequired,
    amenities: PropTypes.shape({
      schools: PropTypes.number.isRequired,
      mbta_stops: PropTypes.number.isRequired,
      restaurants: PropTypes.number.isRequired,
    }).isRequired,
  }),
  loading: PropTypes.bool.isRequired,
};

export default NeighborhoodSummary; 