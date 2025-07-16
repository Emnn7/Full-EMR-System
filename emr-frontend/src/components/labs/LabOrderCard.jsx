import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, Button, Chip, List, ListItem, ListItemText } from '@mui/material';
import { format } from 'date-fns';

const statusColors = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'error'
};

const testStatusColors = {
  ordered: 'default',
  'in-progress': 'info',
  completed: 'success',
  cancelled: 'error'
};

const LabOrderCard = ({ order, showPatient = false, showActions = false }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1">
          Lab Order #{order?._id?.slice(-6).toUpperCase()}
        </Typography>
        <Chip label={order?.status} color={statusColors[order?.status] || 'default'} />
      </Box>

      {showPatient && (
        <Typography variant="body2" gutterBottom>
          Patient: {order?.patient?.firstName} {order?.patient?.lastName}
        </Typography>
      )}

      <Typography variant="body2" gutterBottom>
        Ordered by: Dr. {order?.doctor?.lastName} on {format(new Date(order?.createdAt), 'MMM dd, yyyy')}
      </Typography>

      {order?.notes && (
        <Typography variant="body2" gutterBottom>
          Notes: {order.notes}
        </Typography>
      )}

      <Typography variant="subtitle2" mt={2}>
        Tests:
      </Typography>
      <List dense>
        {order?.tests?.length ? (
          order.tests.map((test, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Typography>
                      {test.name} ({test.code})
                    </Typography>
                    <Chip label={test.status} size="small" color={testStatusColors[test.status] || 'default'} />
                  </Box>
                }
                secondary={test.description}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">No tests listed.</Typography>
        )}
      </List>

      {showActions && order?.status === 'pending' && (
        <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
          {order?.tests?.some(t => t.status === 'ordered') && (
            <Button 
              variant="contained" 
              size="small"
              component={Link}
              to={`/lab/orders/${order._id}/0`}
            >
              Enter Results
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default LabOrderCard;
