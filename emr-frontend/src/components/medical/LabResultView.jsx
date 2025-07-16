import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import { Download } from '@mui/icons-material';

const LabResultView = ({ labReport, onDownload }) => {
  if (!labReport) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>No lab report selected</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Lab Test Results</Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={onDownload}
        >
          Download Report
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography><strong>Patient:</strong> {labReport.patientName}</Typography>
        <Typography><strong>Test Date:</strong> {new Date(labReport.dateTested).toLocaleString()}</Typography>
        <Typography><strong>Ordering Doctor:</strong> {labReport.doctorName}</Typography>
        <Typography><strong>Status:</strong> 
          <Chip
            label={labReport.status}
            color={labReport.status === 'Completed' ? 'success' : 'warning'}
            size="small"
            sx={{ ml: 1 }}
          />
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test Name</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>Reference Range</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Flag</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labReport.tests.map((test, index) => (
              <TableRow key={index}>
                <TableCell>{test.testName}</TableCell>
                <TableCell>
                  <Typography fontWeight={test.flag ? 'bold' : 'normal'}>
                    {test.result}
                  </Typography>
                </TableCell>
                <TableCell>{test.normalRange}</TableCell>
                <TableCell>{test.unit}</TableCell>
                <TableCell>
                  {test.flag && (
                    <Chip
                      label={test.flag}
                      color={test.flag === 'High' ? 'error' : test.flag === 'Low' ? 'warning' : 'info'}
                      size="small"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {labReport.notes && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Interpretation Notes:
          </Typography>
          <Typography>{labReport.notes}</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default LabResultView;