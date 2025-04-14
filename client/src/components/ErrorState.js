import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

function ErrorState({
  error,
  onRetry,
  title = 'Something went wrong',
  message = 'We encountered an error while loading the data. Please try again.',
  retryText = 'Try Again',
  ...props
}) {
  return (
    <Container maxWidth="sm" {...props}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <ErrorIcon
          color="error"
          sx={{ fontSize: 64, mb: 2, opacity: 0.8 }}
        />
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          sx={{ mb: 3 }}
        >
          {message}
        </Typography>
        {error && (
          <Typography
            variant="body2"
            color="error"
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'error.light',
              borderRadius: 1,
              mb: 3,
              overflow: 'auto',
              maxWidth: '100%',
            }}
          >
            {error.message || error.toString()}
          </Typography>
        )}
        {onRetry && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            {retryText}
          </Button>
        )}
      </Paper>
    </Container>
  );
}

ErrorState.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Error),
  ]),
  onRetry: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  retryText: PropTypes.string,
};

export default ErrorState; 