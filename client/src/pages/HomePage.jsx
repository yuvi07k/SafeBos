import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import NeighborhoodsOverview from '../components/NeighborhoodsOverview';
import MapContainer from '../components/MapContainer';

const HomePage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Boston Real Estate Explorer
      </Typography>

      {/* Interactive Map Section */}
      <Paper elevation={3} sx={{ mb: 3, height: '60vh', overflow: 'hidden' }}>
        <MapContainer />
      </Paper>

      <Grid container spacing={3}>
        {/* Neighborhood Explorer Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Neighborhood Explorer
              </Typography>
              <Typography paragraph>
                Explore detailed information about Boston neighborhoods, including demographics,
                property values, and amenities.
              </Typography>
              <Button
                component={Link}
                to="/neighborhoods"
                variant="contained"
                color="primary"
              >
                Explore Neighborhoods
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Affordability Calculator Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Affordability Calculator
              </Typography>
              <Typography paragraph>
                Calculate how much house you can afford based on your income, expenses,
                and other financial factors.
              </Typography>
              <Button
                component={Link}
                to="/affordability"
                variant="contained"
                color="primary"
              >
                Calculate Affordability
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Neighborhoods at a Glance Section */}
        <Grid item xs={12}>
          <NeighborhoodsOverview />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage; 