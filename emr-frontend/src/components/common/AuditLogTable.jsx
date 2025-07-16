import React from 'react';
import {
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Typography
} from '@mui/material';

const AuditLogTable = ({ logs = [], loading, error }) => {
  // Safely handle empty states
  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!logs?.length) return <Typography>No audit logs found</Typography>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log._id || log.id}>
              <TableCell>{log._id || log.id}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>
                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
              </TableCell>
              <TableCell>
                {log.user?.firstName 
                  ? `${log.user.firstName} ${log.user.lastName}` 
                  : 'System'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AuditLogTable;