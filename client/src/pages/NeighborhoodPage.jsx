import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
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

// Fix for Leaflet CSS integrity issue
const leafletCSS = document.createElement('link');
leafletCSS.rel = 'stylesheet';
leafletCSS.href = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css';
leafletCSS.integrity = 'sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI=';
leafletCSS.crossOrigin = '';
document.head.appendChild(leafletCSS);

const NeighborhoodPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(name || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [comparisonNeighborhood, setComparisonNeighborhood] = useState('');
  const [comparisonData, setComparisonData] = useState(null);

  // Search filters
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [neighborhoodsData, maxPriceData] = await Promise.all([
          api.getNeighborhoods(),
          api.getMaxPrice()
        ]);
        setNeighborhoods(neighborhoodsData);
        setMaxPrice(maxPriceData.max_price);
        setPriceRange([0, maxPriceData.max_price]);
      } catch (err) {
        setError('Failed to load initial data');
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await api.searchNeighborhoods({
        neighborhood: selectedNeighborhood || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        bedrooms: bedrooms || undefined,
        bathrooms: bathrooms || undefined
      });
      setSearchResults(results);
    } catch (err) {
      setError('Error searching properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNeighborhoodClick = async (neighborhood) => {
    try {
      setLoading(true);
      const details = await api.getNeighborhoodSummary(neighborhood);
      setSelectedProperty(details);
      setPropertyDialogOpen(true);
    } catch (err) {
      setError('Error fetching neighborhood details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComparisonChange = async (event) => {
    const newNeighborhood = event.target.value;
    setComparisonNeighborhood(newNeighborhood);
    
    if (newNeighborhood && selectedProperty) {
      try {
        const comparisonDetails = await api.getNeighborhoodSummary(newNeighborhood);
        setComparisonData(comparisonDetails);
      } catch (err) {
        setError('Error fetching comparison neighborhood details. Please try again.');
      }
    }
  };

  const handleCloseDialog = () => {
    setPropertyDialogOpen(false);
    setSelectedProperty(null);
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value) => {
    if (!value) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  const comparisonChartData = comparisonData && selectedProperty ? [
    {
      name: 'Property Value',
      [selectedProperty.neighborhood]: selectedProperty.property_stats.median_property_value,
      [comparisonData.neighborhood]: comparisonData.property_stats.median_property_value,
    },
    {
      name: 'Family Income',
      [selectedProperty.neighborhood]: selectedProperty.demographics.median_family_income,
      [comparisonData.neighborhood]: comparisonData.demographics.median_family_income,
    },
    {
      name: 'Crime Rate',
      [selectedProperty.neighborhood]: selectedProperty.crime_stats.crime_rate,
      [comparisonData.neighborhood]: comparisonData.crime_stats.crime_rate,
    }
  ] : [];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Neighborhood</InputLabel>
              <Select
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                label="Neighborhood"
              >
                <MenuItem value="">All Neighborhoods</MenuItem>
                {neighborhoods.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Price Range</Typography>
            <Slider
              value={priceRange}
              onChange={(_, newValue) => setPriceRange(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={maxPrice}
              step={10000}
              valueLabelFormat={(value) => formatCurrency(value)}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Bedrooms</InputLabel>
              <Select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                label="Bedrooms"
              >
                <MenuItem value={0}>Any</MenuItem>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Bathrooms</InputLabel>
              <Select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                label="Bathrooms"
              >
                <MenuItem value={0}>Any</MenuItem>
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading}
              fullWidth
            >
              Search Properties
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {searchResults.length > 0 ? (
        <Grid container spacing={3}>
          {searchResults.map((neighborhood) => (
            <Grid item xs={12} sm={6} md={4} key={neighborhood.neighborhood}>
              <Card 
                onClick={() => handleNeighborhoodClick(neighborhood.neighborhood)}
                sx={{ 
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {neighborhood.neighborhood}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Median Price: {formatCurrency(neighborhood.median_price)}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Properties: {formatNumber(neighborhood.property_count)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Click to view more details about this neighborhood
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        !loading && !error && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No neighborhoods found matching your criteria.</Typography>
          </Paper>
        )
      )}

      <Dialog
        open={propertyDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedProperty ? (
          <>
            <DialogTitle>
              {selectedProperty.neighborhood}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                {/* Property Statistics */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Property Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Median Property Value
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedProperty.property_stats.median_property_value)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Total Properties</Typography>
                      <Typography variant="body1">{selectedProperty.property_stats.total_properties?.toLocaleString() || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Demographics */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Demographics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Population
                      </Typography>
                      <Typography variant="body1">
                        {formatNumber(selectedProperty.demographics.population)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Median Family Income
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedProperty.demographics.median_family_income)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Per Capita Income
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedProperty.demographics.per_capita_income)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Crime Statistics */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Crime Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Crime Rate
                      </Typography>
                      <Typography variant="body1">
                        {selectedProperty.crime_stats.crime_rate?.toFixed(2) || 'N/A'} per 1000 people
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Total Crimes
                      </Typography>
                      <Typography variant="body1">
                        {formatNumber(selectedProperty.crime_stats.total_crimes)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Amenities */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Amenities
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Schools
                      </Typography>
                      <Typography variant="body1">
                        {formatNumber(selectedProperty.amenities.schools)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        MBTA Stops
                      </Typography>
                      <Typography variant="body1">
                        {formatNumber(selectedProperty.amenities.mbta_stops)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Restaurants
                      </Typography>
                      <Typography variant="body1">
                        {formatNumber(selectedProperty.amenities.restaurants)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Comparison Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 4 }} />
                  <Typography variant="h6" gutterBottom>
                    Compare with Another Neighborhood
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Neighborhood to Compare</InputLabel>
                    <Select
                      value={comparisonNeighborhood}
                      onChange={handleComparisonChange}
                      label="Select Neighborhood to Compare"
                    >
                      {neighborhoods.map((nb) => (
                        nb !== selectedProperty.neighborhood && (
                          <MenuItem key={nb} value={nb}>
                            {nb}
                          </MenuItem>
                        )
                      ))}
                    </Select>
                  </FormControl>

                  {comparisonData && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Comparison Chart
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={comparisonChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey={selectedProperty.neighborhood} fill="#1976d2" />
                                <Bar dataKey={comparisonData.neighborhood} fill="#4caf50" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Detailed Comparison Table */}
                      <Grid item xs={12}>
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Metric</TableCell>
                                <TableCell align="right">{selectedProperty.neighborhood}</TableCell>
                                <TableCell align="right">{comparisonData.neighborhood}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>Median Property Value</TableCell>
                                <TableCell align="right">{formatCurrency(selectedProperty.property_stats.median_property_value)}</TableCell>
                                <TableCell align="right">{formatCurrency(comparisonData.property_stats.median_property_value)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Median Family Income</TableCell>
                                <TableCell align="right">{formatCurrency(selectedProperty.demographics.median_family_income)}</TableCell>
                                <TableCell align="right">{formatCurrency(comparisonData.demographics.median_family_income)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Crime Rate</TableCell>
                                <TableCell align="right">{selectedProperty.crime_stats.crime_rate?.toFixed(2)} per 1000</TableCell>
                                <TableCell align="right">{comparisonData.crime_stats.crime_rate?.toFixed(2)} per 1000</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Population</TableCell>
                                <TableCell align="right">{formatNumber(selectedProperty.demographics.population)}</TableCell>
                                <TableCell align="right">{formatNumber(comparisonData.demographics.population)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default NeighborhoodPage; 