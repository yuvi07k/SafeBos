import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const NeighborhoodSummaryPage = () => {
  const { neighborhood } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNeighborhoodData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getNeighborhoodSummary(neighborhood);
        setData(response);
      } catch (err) {
        console.error('Error fetching neighborhood data:', err);
        setError('Failed to load neighborhood data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNeighborhoodData();
  }, [neighborhood]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          No data available for this neighborhood.
        </Alert>
      </Container>
    );
  }

  const ageData = [
    { name: '0-9', value: data.demographics.age_distribution.age_0_9 },
    { name: '10-19', value: data.demographics.age_distribution.age_10_19 },
    { name: '20-34', value: data.demographics.age_distribution.age_20_34 },
    { name: '35-54', value: data.demographics.age_distribution.age_35_54 },
    { name: '55-64', value: data.demographics.age_distribution.age_55_64 },
    { name: '65+', value: data.demographics.age_distribution.age_65_plus }
  ];

  const educationData = [
    { name: 'Less than HS', value: data.demographics.education.less_than_high_school },
    { name: 'HS or GED', value: data.demographics.education.high_school_or_ged },
    { name: 'Some College', value: data.demographics.education.some_college },
    { name: 'Bachelor+', value: data.demographics.education.bachelor_plus }
  ];

  const raceData = [
    { name: 'White', value: data.demographics.race_ethnicity.white },
    { name: 'Black', value: data.demographics.race_ethnicity.black },
    { name: 'Hispanic', value: data.demographics.race_ethnicity.hispanic },
    { name: 'Asian', value: data.demographics.race_ethnicity.asian },
    { name: 'Other', value: data.demographics.race_ethnicity.other }
  ];

  const propertyTypeData = [
    { name: 'Residential', value: data.property_stats.property_types.residential },
    { name: 'Commercial', value: data.property_stats.property_types.commercial },
    { name: 'Industrial', value: data.property_stats.property_types.industrial }
  ];

  const priceData = [
    { name: 'Average Property Value', value: data.property_stats.avg_property_value },
    { name: 'Total Properties', value: data.property_stats.total_properties }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {neighborhood} Neighborhood Summary
      </Typography>

      <Grid container spacing={3}>
        {/* Property Statistics Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Property Statistics
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => {
                        if (value > 1000000) {
                          return `$${(value/1000000).toFixed(1)}M`;
                        } else if (value > 1000) {
                          return `$${(value/1000).toFixed(1)}K`;
                        }
                        return value.toLocaleString();
                      }}
                    />
                    <Tooltip 
                      formatter={(value) => {
                        if (value > 1000000) {
                          return `$${(value/1000000).toFixed(1)}M`;
                        } else if (value > 1000) {
                          return `$${(value/1000).toFixed(1)}K`;
                        }
                        return value.toLocaleString();
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill="#1976d2" 
                      name="Value"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Demographics Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Demographics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Population</Typography>
                  <Typography variant="body1">{data.demographics.population?.toLocaleString() || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Median Family Income</Typography>
                  <Typography variant="body1">${data.demographics.median_family_income?.toLocaleString() || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Per Capita Income</Typography>
                  <Typography variant="body1">${data.demographics.per_capita_income?.toLocaleString() || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Age Distribution</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Percentage" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Education and Race Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Education & Race Distribution
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Education Level</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={educationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {educationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Race/Ethnicity</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={raceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {raceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Property Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Property Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Average Property Value</Typography>
                  <Typography variant="body1">
                    ${data.property_stats.avg_property_value?.toLocaleString() || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Total Properties</Typography>
                  <Typography variant="body1">{data.property_stats.total_properties?.toLocaleString() || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Crime Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Crime Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Total Crimes</Typography>
                  <Typography variant="body1">{data.crime_stats.total_crimes?.toLocaleString() || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Crime Rate</Typography>
                  <Typography variant="body1">{data.crime_stats.crime_rate?.toFixed(2) || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Amenities Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Schools</Typography>
                  <Typography variant="body1">{data.amenities.schools?.toLocaleString() || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">MBTA Stops</Typography>
                  <Typography variant="body1">{data.amenities.mbta_stops?.toLocaleString() || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Restaurants</Typography>
                  <Typography variant="body1">{data.amenities.restaurants?.toLocaleString() || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default NeighborhoodSummaryPage; 