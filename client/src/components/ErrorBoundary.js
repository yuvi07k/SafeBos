import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorState from './ErrorState';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    // Log error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps, prevState) {
    // Reset error state if children change
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.navigate('/');
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected error occurred';
      const errorCode = this.state.error?.code || 'UNKNOWN_ERROR';

      return (
        <ErrorState
          error={this.state.error}
          title="Oops! Something went wrong"
          message={`${errorMessage} (${errorCode})`}
          onRetry={this.handleRetry}
          retryText="Reload Page"
          sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
        />
      );
    }

    return this.props.children;
  }
}

// Wrapper component to use hooks
export default function ErrorBoundaryWrapper(props) {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
} 