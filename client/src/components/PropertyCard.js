import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
} from '@mui/material';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import PropTypes from 'prop-types';

function PropertyCard({ property, ...props }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/property/${property.pid}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
        }}
        onClick={handleClick}
        {...props}
      >
        <CardMedia
          sx={{
            height: 200,
            position: 'relative',
            backgroundColor: 'grey.100',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No Image Available
            </Typography>
          </Box>
        </CardMedia>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2">
            {property.st_num} {property.st_name || 'Property'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {property.city}, {property.zipcode}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
            ${property.total_value.toLocaleString()}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 2,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              {property.bed_rms || 0} beds
            </Typography>
            <Typography variant="body2">
              {property.full_bth || 0} baths
            </Typography>
            <Typography variant="body2">
              {property.living_area || 0} sqft
            </Typography>
          </Box>
          {property.lu_desc && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {property.lu_desc}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={handleClick}
            sx={{ ml: 'auto' }}
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
}

PropertyCard.propTypes = {
  property: PropTypes.shape({
    pid: PropTypes.string.isRequired,
    st_num: PropTypes.string,
    st_name: PropTypes.string,
    city: PropTypes.string.isRequired,
    zipcode: PropTypes.string,
    total_value: PropTypes.number.isRequired,
    bed_rms: PropTypes.number,
    full_bth: PropTypes.number,
    living_area: PropTypes.number,
    lu_desc: PropTypes.string,
  }).isRequired,
};

export default PropertyCard; 