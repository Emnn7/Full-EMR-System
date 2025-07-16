import React, { useState, useRef, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ url, height = '500px' }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(null);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.clientWidth);
    }
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  return (
    <Box ref={containerRef} sx={{ height, overflow: 'auto' }}>
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      )}
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<CircularProgress />}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page 
            key={`page_${index + 1}`} 
            pageNumber={index + 1} 
            width={width ? Math.min(width, 800) : 800}
          />
        ))}
      </Document>
    </Box>
  );
};

export default PDFViewer;