import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';

const ReceiptViewer = ({ receiptData }) => {
  return (
    <Box>
      <Typography variant="h5">Payment Receipt</Typography>
      {/* Receipt details */}
      <Button 
        variant="contained" 
        startIcon={<PrintIcon />}
        onClick={() => window.print()}
      >
        Print Receipt
      </Button>
      <Button 
        variant="outlined" 
        startIcon={<DownloadIcon />}
        onClick={() => {/* PDF download logic */}}
        sx={{ ml: 2 }}
      >
        Download PDF
      </Button>
    </Box>
  );
};

export default ReceiptViewer;