import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

const AffordabilityPage = () => {
  const [affordabilityData, setAffordabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userIncome, setUserIncome] = useState('');
  const [userAffordability, setUserAffordability] = useState(null);

  useEffect(() => {
    const fetchAffordabilityData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAffordability();
        setAffordabilityData(data);
      } catch (err) {
        setError(err.message || 'Error loading affordability data. Please try again later.');
        console.error('Error fetching affordability data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAffordabilityData();
  }, []);

  const calculatePersonalAffordability = () => {
    if (!userIncome || !affordabilityData) return;
    
    const income = parseFloat(userIncome);
    if (isNaN(income) || income <= 0) {
      setError('Please enter a valid income amount');
      return;
    }

    // Calculate what the user can afford based on typical mortgage rules
    // Using a conservative 28% of gross income for housing expenses
    const monthlyHousingBudget = (income / 12) * 0.28;
    
    // Assuming 4% interest rate, 30-year mortgage, and 20% down payment
    const annualInterestRate = 0.04;
    const monthlyInterestRate = annualInterestRate / 12;
    const loanTermMonths = 30 * 12;
    
    // Calculate maximum loan amount
    const maxLoanAmount = monthlyHousingBudget * 
      ((1 - Math.pow(1 + monthlyInterestRate, -loanTermMonths)) / monthlyInterestRate);
    
    // Add 20% down payment to get total home value
    const maxHomeValue = maxLoanAmount / 0.8;

    // Find neighborhoods within budget
    const affordableNeighborhoods = affordabilityData.neighborhoods
      .filter(n => n.median_price <= maxHomeValue)
      .sort((a, b) => b.median_price - a.median_price);

    setUserAffordability({
      monthlyHousingBudget,
      maxHomeValue,
      affordableNeighborhoods
    });
  };

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

  if (!affordabilityData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No affordability data available at this time.
      </Alert>
    );
  }

  const priceToIncomeRatioData = affordabilityData.neighborhoods?.map(neighborhood => ({
    name: neighborhood.name,
    ratio: neighborhood.price_to_income_ratio,
  })) || [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Housing Affordability Analysis
      </Typography>

      {/* Personal Affordability Calculator */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Personal Affordability Calculator
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Annual Income"
                type="number"
                value={userIncome}
                onChange={(e) => setUserIncome(e.target.value)}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
                helperText="Enter your annual gross income"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                color="primary"
                onClick={calculatePersonalAffordability}
                disabled={!userIncome}
              >
                Calculate Affordability
              </Button>
            </Grid>
          </Grid>

          {userAffordability && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Affordability Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Monthly Housing Budget</Typography>
                  <Typography variant="h6">
                    ${userAffordability.monthlyHousingBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Maximum Home Value</Typography>
                  <Typography variant="h6">
                    ${userAffordability.maxHomeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Affordable Neighborhoods</Typography>
                  <Typography variant="h6">
                    {userAffordability.affordableNeighborhoods.length}
                  </Typography>
                </Grid>
              </Grid>

              {userAffordability.affordableNeighborhoods.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Affordable Neighborhoods
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Neighborhood</TableCell>
                          <TableCell align="right">Median Price</TableCell>
                          <TableCell align="right">Median Income</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {userAffordability.affordableNeighborhoods.map((neighborhood) => (
                          <TableRow key={neighborhood.name}>
                            <TableCell>{neighborhood.name}</TableCell>
                            <TableCell align="right">
                              ${neighborhood.median_price?.toLocaleString() || 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                              ${neighborhood.median_income?.toLocaleString() || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* City-wide Analysis */}
      <Typography variant="h5" gutterBottom>
        City-wide Affordability Analysis
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Metrics
              </Typography>
              <Typography>
                City-wide Median Price: ${affordabilityData.city_median_price?.toLocaleString() || 'N/A'}
              </Typography>
              <Typography>
                City-wide Median Income: ${affordabilityData.city_median_income?.toLocaleString() || 'N/A'}
              </Typography>
              <Typography>
                Median Price-to-Income Ratio: {affordabilityData.median_price_to_income_ratio?.toFixed(2) || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {priceToIncomeRatioData.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Price-to-Income Ratio by Neighborhood
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceToIncomeRatioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ratio"
                    stroke="#1976d2"
                    name="Price-to-Income Ratio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {affordabilityData.neighborhoods?.length > 0 && (
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Neighborhood</TableCell>
                    <TableCell align="right">Median Price</TableCell>
                    <TableCell align="right">Median Income</TableCell>
                    <TableCell align="right">Price-to-Income Ratio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {affordabilityData.neighborhoods.map((neighborhood) => (
                    <TableRow key={neighborhood.name}>
                      <TableCell component="th" scope="row">
                        {neighborhood.name}
                      </TableCell>
                      <TableCell align="right">
                        ${neighborhood.median_price?.toLocaleString() || 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        ${neighborhood.median_income?.toLocaleString() || 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        {neighborhood.price_to_income_ratio?.toFixed(2) || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AffordabilityPage; 