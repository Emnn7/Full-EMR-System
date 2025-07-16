import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, Divider } from '@mui/material';
import { format } from 'date-fns';

const statusColors = {
  pending: 'warning',
  paid: 'success',
  'partially-paid': 'info',
  cancelled: 'error'
};

const BillingList = ({ bills }) => {
  return (
    <Paper>
      <List>
        {bills.map((bill) => (
          <React.Fragment key={bill._id}>
            <ListItem>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Typography>
                      Bill #{bill._id.slice(-6).toUpperCase()}
                    </Typography>
                    <Chip 
                      label={bill.status} 
                      color={statusColors[bill.status] || 'default'} 
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" display="block">
                      Patient: {bill.patient.firstName} {bill.patient.lastName}
                    </Typography>
                    <Typography component="span" variant="body2" display="block">
                      Date: {format(new Date(bill.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography component="span" variant="body2" display="block">
                      Total: ${bill.total.toFixed(2)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default BillingList;