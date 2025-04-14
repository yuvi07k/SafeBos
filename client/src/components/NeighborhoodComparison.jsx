import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const NeighborhoodComparison = ({ neighborhoods, selectedNeighborhoods, onNeighborhoodChange }) => {
  // Format data for charts
  const propertyValueData = selectedNeighborhoods.filter(Boolean).map(nb => ({
    name: nb.name,
    value: nb.property_stats.median_property_value
  }));

  const incomeData = selectedNeighborhoods.filter(Boolean).map(nb => ({
    name: nb.name,
    value: nb.demographics.median_family_income
  }));

  const crimeRateData = selectedNeighborhoods.filter(Boolean).map(nb => ({
    name: nb.name,
    value: nb.crime_stats.crime_rate
  }));

  const amenitiesData = selectedNeighborhoods.filter(Boolean).map(nb => ({
    name: nb.name,
    schools: nb.amenities.schools,
    mbta_stops: nb.amenities.mbta_stops,
    restaurants: nb.amenities.restaurants
  }));

  const demographicData = selectedNeighborhoods.filter(Boolean).map(nb => ({
    name: nb.name,
    population: nb.demographics.population,
    median_income: nb.demographics.median_family_income,
    per_capita_income: nb.demographics.per_capita_income
  }));

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Neighborhood Comparison
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2].map((index) => (
          <Grid item xs={12} sm={6} key={index}>
            <FormControl fullWidth>
              <InputLabel>Neighborhood {index}</InputLabel>
              <Select
                value={selectedNeighborhoods[index - 1]?.name || ''}
                onChange={(e) => onNeighborhoodChange(index - 1, e.target.value)}
                label={`Neighborhood ${index}`}
              >
                {neighborhoods.map((nb) => (
                  <MenuItem key={nb} value={nb}>
                    {nb}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Property Values Comparison */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Median Property Values
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={propertyValueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value) => `$${(value/1000000).toFixed(1)}M`}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#1976d2" name="Property Value" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Income Comparison */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Median Family Income
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `$${(value/1000).toFixed(1)}K`}
                  />
                  <Tooltip
                    formatter={(value) => `$${(value/1000).toFixed(1)}K`}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#4caf50" name="Income" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Crime Rate Comparison */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Crime Rate (per 1000 residents)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={crimeRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#f44336" name="Crime Rate" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Amenities Comparison */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={amenitiesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="schools" fill="#ff9800" name="Schools" />
                  <Bar dataKey="mbta_stops" fill="#2196f3" name="MBTA Stops" />
                  <Bar dataKey="restaurants" fill="#9c27b0" name="Restaurants" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Demographics Comparison */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Demographics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demographicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="population" fill="#ff5722" name="Population" />
                  <Bar dataKey="median_income" fill="#009688" name="Median Income" />
                  <Bar dataKey="per_capita_income" fill="#673ab7" name="Per Capita Income" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NeighborhoodComparison; 