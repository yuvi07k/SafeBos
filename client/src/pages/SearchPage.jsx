import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Container,
  Alert
} from '@mui/material';
import api from '../services/api';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [neighborhoodsLoading, setNeighborhoodsLoading] = useState(true);
  const [neighborhoodsError, setNeighborhoodsError] = useState(null);
  const [maxPrice, setMaxPrice] = useState(2000000); // Default to $2M

  // Available options for dropdowns
  const bedroomOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const bathroomOptions = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  const [searchParams, setSearchParams] = useState({
    neighborhood: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  });

  // Price range state
  const [priceRange, setPriceRange] = useState([0, maxPrice]);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        setNeighborhoodsLoading(true);
        const data = await api.getNeighborhoods();
        setNeighborhoods(data || []);
        setNeighborhoodsError(null);
      } catch (err) {
        console.error('Error fetching neighborhoods:', err);
        setNeighborhoodsError('Failed to load neighborhoods');
        setNeighborhoods([]);
      } finally {
        setNeighborhoodsLoading(false);
      }
    };

    fetchNeighborhoods();
  }, []);

  useEffect(() => {
    const fetchMaxPrice = async () => {
      try {
        const response = await api.getMaxPrice();
        if (response && response.max_price) {
          // Cap the max price at $2M for better usability
          const cappedMaxPrice = Math.min(response.max_price, 2000000);
          setMaxPrice(cappedMaxPrice);
          setPriceRange([0, cappedMaxPrice]);
        }
      } catch (err) {
        console.error('Error fetching max price:', err);
        // Use default value if API call fails
        setMaxPrice(2000000);
        setPriceRange([0, 2000000]);
      }
    };

    fetchMaxPrice();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await api.searchNeighborhoods(searchParams);
      if (results && results.length > 0) {
        setSearchResults(results);
      } else {
        setSearchResults([]);
        setError('No neighborhoods found matching your criteria.');
      }
    } catch (err) {
      setError('Error performing search. Please try again.');
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
    setSearchParams(prev => ({
      ...prev,
      minPrice: newValue[0],
      maxPrice: newValue[1]
    }));
  };

  const formatPrice = (value) => {
    if (!value || value === 0) return 'N/A';
    if (value >= 1000000) {
      return `$${(value/1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value/1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const generatePriceMarks = () => {
    const marks = [];
    const step = maxPrice / 5;
    
    for (let i = 0; i <= 5; i++) {
      const value = i * step;
      marks.push({
        value: value,
        label: formatPrice(value)
      });
    }
    
    return marks;
  };

  const handleNeighborhoodSelect = (event) => {
    const selectedNeighborhood = event.target.value;
    setSearchParams(prev => ({
      ...prev,
      neighborhood: selectedNeighborhood
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Neighborhood Search
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Neighborhood</InputLabel>
            <Select
              value={searchParams.neighborhood}
              onChange={handleNeighborhoodSelect}
              name="neighborhood"
              label="Neighborhood"
              disabled={neighborhoodsLoading}
            >
              {neighborhoodsLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : neighborhoods && neighborhoods.length > 0 ? (
                neighborhoods.map((neighborhood) => (
                  <MenuItem key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No neighborhoods available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography gutterBottom>Price Range</Typography>
          <Slider
            value={priceRange}
            onChange={handlePriceRangeChange}
            valueLabelDisplay="auto"
            valueLabelFormat={formatPrice}
            min={0}
            max={maxPrice}
            step={maxPrice/100} // 100 steps between 0 and max
            marks={generatePriceMarks()}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Minimum Bedrooms</InputLabel>
            <Select
              value={searchParams.bedrooms}
              onChange={handleChange}
              name="bedrooms"
              label="Minimum Bedrooms"
            >
              <MenuItem value="">Any</MenuItem>
              {bedroomOptions.map((beds) => (
                <MenuItem key={beds} value={beds}>
                  {beds}+
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Minimum Bathrooms</InputLabel>
            <Select
              value={searchParams.bathrooms}
              onChange={handleChange}
              name="bathrooms"
              label="Minimum Bathrooms"
            >
              <MenuItem value="">Any</MenuItem>
              {bathroomOptions.map((baths) => (
                <MenuItem key={baths} value={baths}>
                  {baths}+
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
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {loading ? (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : searchResults.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No results found. Try adjusting your search criteria.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {searchResults.map((result) => (
              <Grid item xs={12} md={6} key={result.neighborhood}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                    }
                  }}
                  onClick={() => navigate(`/neighborhood/${encodeURIComponent(result.neighborhood)}`)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {result.neighborhood}
                    </Typography>
                    <Typography color="textSecondary">
                      Median Price: {formatPrice(result.median_price)}
                    </Typography>
                    <Typography color="textSecondary">
                      Properties: {result.property_count?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Click to view more details about this neighborhood
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default SearchPage; 