import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  marginBottom: theme.spacing(4),
}));

const MainContent = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const Layout = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Boston Real Estate Decision Support Tool
          </Typography>
        </Toolbar>
      </StyledAppBar>
      <MainContent maxWidth="lg">
        {children}
      </MainContent>
    </Box>
  );
};

export default Layout; 