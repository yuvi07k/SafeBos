import React from 'react';
import { Skeleton, Box, Grid } from '@mui/material';
import PropTypes from 'prop-types';

function LoadingSkeleton({ variant = 'property', count = 1, ...props }) {
  const renderPropertySkeleton = () => (
    <Box sx={{ p: 2 }}>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={200}
        sx={{ borderRadius: 2, mb: 2 }}
      />
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Skeleton variant="text" width="20%" height={24} />
        <Skeleton variant="text" width="20%" height={24} />
        <Skeleton variant="text" width="20%" height={24} />
      </Box>
    </Box>
  );

  const renderSearchSkeleton = () => (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="100%" height={56} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={40} />
    </Box>
  );

  const renderMapSkeleton = () => (
    <Skeleton
      variant="rectangular"
      width="100%"
      height={400}
      sx={{ borderRadius: 2 }}
    />
  );

  const renderFiltersSkeleton = () => (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="100%" height={56} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="100%" height={56} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="100%" height={56} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="100%" height={56} />
    </Box>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'property':
        return renderPropertySkeleton();
      case 'search':
        return renderSearchSkeleton();
      case 'map':
        return renderMapSkeleton();
      case 'filters':
        return renderFiltersSkeleton();
      default:
        return renderPropertySkeleton();
    }
  };

  return (
    <Grid container spacing={2} {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          {renderSkeleton()}
        </Grid>
      ))}
    </Grid>
  );
}

LoadingSkeleton.propTypes = {
  variant: PropTypes.oneOf(['property', 'search', 'map', 'filters']),
  count: PropTypes.number,
};

export default LoadingSkeleton; 