import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Autocomplete,
  Slider,
  Typography,
  Button,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

const validationSchema = Yup.object().shape({
  location: Yup.string().required('Location is required'),
  minPrice: Yup.number().min(0),
  maxPrice: Yup.number().min(0),
  bedrooms: Yup.number().min(0),
  bathrooms: Yup.number().min(0),
});

function SearchBar({ onSearch, neighborhoods = [], ...props }) {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const formik = useFormik({
    initialValues: {
      location: '',
      minPrice: 0,
      maxPrice: 2000000,
      bedrooms: 0,
      bathrooms: 0,
    },
    validationSchema,
    onSubmit: (values) => {
      const searchParams = new URLSearchParams();
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          searchParams.append(key, value);
        }
      });
      navigate(`/search?${searchParams.toString()}`);
      if (onSearch) {
        onSearch(values);
      }
    },
  });

  const handleLocationChange = (_, value) => {
    formik.setFieldValue('location', value?.label || '');
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        ...props.sx,
      }}
    >
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Autocomplete
            options={neighborhoods}
            getOptionLabel={(option) => option.label}
            onChange={handleLocationChange}
            renderInput={(params) => (
              <TextField
                {...params}
                name="location"
                label="Location"
                error={formik.touched.location && !!formik.errors.location}
                helperText={formik.touched.location && formik.errors.location}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            color={showFilters ? 'primary' : 'default'}
          >
            <FilterIcon />
          </IconButton>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </Box>

        <Collapse in={showFilters}>
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography gutterBottom>Price Range</Typography>
              <Slider
                value={[formik.values.minPrice, formik.values.maxPrice]}
                onChange={(_, value) => {
                  formik.setFieldValue('minPrice', value[0]);
                  formik.setFieldValue('maxPrice', value[1]);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={2000000}
                step={10000}
                valueLabelFormat={(value) => `$${value.toLocaleString()}`}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  ${formik.values.minPrice.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  ${formik.values.maxPrice.toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="bedrooms"
                label="Bedrooms"
                type="number"
                value={formik.values.bedrooms}
                onChange={formik.handleChange}
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ flex: 1 }}
              />
              <TextField
                name="bathrooms"
                label="Bathrooms"
                type="number"
                value={formik.values.bathrooms}
                onChange={formik.handleChange}
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </Collapse>
      </form>
    </Paper>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func,
  neighborhoods: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

export default SearchBar; 