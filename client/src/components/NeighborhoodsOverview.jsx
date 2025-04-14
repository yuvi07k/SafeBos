import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Alert,
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
} from 'recharts';
import api from '../services/api';

const NeighborhoodsOverview = () => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getNeighborhoods();
        if (response && Array.isArray(response)) {
          // Filter out any undefined or empty neighborhood names
          const validNeighborhoods = response.filter(name => name && typeof name === 'string' && name.trim() !== '');
          
          const neighborhoodData = await Promise.all(
            validNeighborhoods.map(async (name) => {
              try {
                const summary = await api.getNeighborhoodSummary(name);
                return summary;
              } catch (err) {
                console.error(`Error fetching summary for neighborhood ${name}:`, err);
                return null;
              }
            })
          );
          
          // Filter out any null results
          const validData = neighborhoodData.filter(data => data !== null);
          setNeighborhoods(validData);
        } else {
          setError('Invalid response format from server');
        }
      } catch (err) {
        setError('Error loading neighborhood data');
        console.error('Error fetching neighborhoods:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNeighborhoods();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedNeighborhoods = [...neighborhoods].sort((a, b) => {
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc'
        ? a.neighborhood.localeCompare(b.neighborhood)
        : b.neighborhood.localeCompare(a.neighborhood);
    }
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (neighborhoods.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No neighborhood data available.
      </Alert>
    );
  }

  const propertyValueData = neighborhoods.map(nb => ({
    name: nb.neighborhood,
    value: nb.property_stats?.median_property_value || 0
  }));

  const incomeData = neighborhoods.map(nb => ({
    name: nb.neighborhood,
    value: nb.demographics?.median_family_income || 0
  }));

  const crimeRateData = neighborhoods.map(nb => ({
    name: nb.neighborhood,
    value: nb.crime_stats?.crime_rate || 0
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Neighborhoods at a Glance
      </Typography>

      <Grid container spacing={3}>
        {/* Property Value Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Median Property Values
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={propertyValueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Property Value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Income Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Median Family Income
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Income" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Crime Rate Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Crime Rates
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={crimeRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Crime Rate" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Neighborhood Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'name'}
                      direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Neighborhood
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortConfig.key === 'crime_stats.crime_rate'}
                      direction={sortConfig.key === 'crime_stats.crime_rate' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('crime_stats.crime_rate')}
                    >
                      Crime Rate
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortConfig.key === 'demographics.median_family_income'}
                      direction={sortConfig.key === 'demographics.median_family_income' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('demographics.median_family_income')}
                    >
                      Median Family Income
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortConfig.key === 'property_stats.median_property_value'}
                      direction={sortConfig.key === 'property_stats.median_property_value' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('property_stats.median_property_value')}
                    >
                      Median Property Value
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedNeighborhoods.map((neighborhood) => (
                  <TableRow key={neighborhood.neighborhood}>
                    <TableCell component="th" scope="row">
                      {neighborhood.neighborhood}
                    </TableCell>
                    <TableCell align="right">
                      {neighborhood.crime_stats?.crime_rate?.toLocaleString() || 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      ${neighborhood.demographics?.median_family_income?.toLocaleString() || 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      ${neighborhood.property_stats?.median_property_value?.toLocaleString() || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NeighborhoodsOverview; 