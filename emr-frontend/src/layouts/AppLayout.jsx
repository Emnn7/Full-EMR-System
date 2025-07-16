import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import NotificationBell from '../components/NotificationBell';

const AppLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Clinic Management System
          </Typography>
          <NotificationBell />
          {/* Add other header components here */}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 3, flex: 1 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ py: 2, bgcolor: 'background.paper' }}>
        <Container>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Clinic Management System
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;