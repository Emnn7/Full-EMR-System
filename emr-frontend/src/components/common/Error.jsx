import React from 'react';
import { Alert, AlertTitle, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Error = ({ message, retryFn }) => {
  const navigate = useNavigate();

  return (
    <Alert
      severity="error"
      action={
        <Button
          color="inherit"
          size="small"
          onClick={retryFn ? retryFn : () => navigate(0)}
        >
          {retryFn ? 'Retry' : 'Refresh'}
        </Button>
      }
    >
      <AlertTitle>Error</AlertTitle>
      {message || 'Something went wrong. Please try again.'}
    </Alert>
  );
};

export default Error;