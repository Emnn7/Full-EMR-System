import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { generateLabReportPDF } from '../../redux/slices/labReportSlice';
import { useDispatch } from 'react-redux';

const PDFViewerDialog = ({ open, onClose, reportId }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (open && reportId) {
      setLoading(true);
      dispatch(generateLabReportPDF(reportId))
        .then((action) => {
          setPdfUrl(action.payload.url);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPdfUrl(null);
    }
  }, [open, reportId, dispatch]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Lab Report PDF
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : pdfUrl ? (
          <iframe 
            src={pdfUrl} 
            width="100%" 
            height="600px" 
            title="Lab Report PDF"
            style={{ border: 'none' }}
          />
        ) : (
          <Box sx={{ p: 2 }}>Failed to load PDF</Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {pdfUrl && (
          <Button 
            variant="contained" 
            component="a" 
            href={pdfUrl} 
            download={`lab-report-${reportId}.pdf`}
          >
            Download
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export { PDFViewerDialog };