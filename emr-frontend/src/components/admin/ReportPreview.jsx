import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const ReportPreview = ({ data, type }) => {
  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (type === 'table') {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {data.columns.map((column) => (
                <TableCell key={column}>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.rows.map((row, index) => (
              <TableRow key={index}>
                {data.columns.map((column) => (
                  <TableCell key={`${index}-${column}`}>
                    {row[column] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="body1">
        {JSON.stringify(data, null, 2)}
      </Typography>
    </Paper>
  );
};

export default ReportPreview;