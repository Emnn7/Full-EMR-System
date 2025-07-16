import React from 'react';
import { Box, Typography, Paper, Chip, Divider } from '@mui/material';
import { format } from 'date-fns';

const flagColors = {
  normal: 'success',
  high: 'warning',
  low: 'warning',
  critical: 'error'
};

const LabReportCard = ({ report }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1">
          {report.testName} ({report.testCode})
        </Typography>
        <Chip label={report.abnormalFlag} color={flagColors[report.abnormalFlag] || 'default'} />
      </Box>

      <Typography variant="body2" gutterBottom>
        Patient: {report.patient.firstName} {report.patient.lastName}
      </Typography>

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Typography>
          <strong>Result:</strong> {report.result} {report.unit}
        </Typography>
        {report.normalRange && (
          <Typography>
            <strong>Normal Range:</strong> {report.normalRange}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between">
        <Typography variant="body2">
          Performed by: {report.performedBy.firstName} {report.performedBy.lastName}
        </Typography>
        <Typography variant="body2">
          {format(new Date(report.createdAt), 'MMM dd, yyyy')}
        </Typography>
      </Box>

      {report.notes && (
        <Box mt={2}>
          <Typography variant="body2">
            <strong>Notes:</strong> {report.notes}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default LabReportCard;