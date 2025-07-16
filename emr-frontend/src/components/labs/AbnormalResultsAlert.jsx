import React from 'react';
import { Alert, AlertTitle, Collapse, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const AbnormalResultsAlert = ({ results, onClose }) => {
  if (!results || results.length === 0) return null;

  return (
    <Collapse in={results.length > 0}>
      <Alert 
        severity="error"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        <AlertTitle>Abnormal Results Require Attention</AlertTitle>
        {results.map((result, index) => (
          <div key={index}>
            <strong>{result.testName}</strong> for {result.patientName}: {result.result} ({result.abnormalFlag})
          </div>
        ))}
      </Alert>
    </Collapse>
  );
};

export default AbnormalResultsAlert;