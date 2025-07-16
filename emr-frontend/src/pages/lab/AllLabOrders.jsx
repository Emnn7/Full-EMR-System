import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  InputAdornment,
  Button
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { fetchLabOrders } from '../../redux/slices/labOrderSlice';
import LabOrdersList from '../../components/labs/LabOrderList';

const AllLabOrders = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { labOrders, loading } = useSelector((state) => state.labOrder);
  const [searchTerm, setSearchTerm] = useState('');

  // Get status from query params
  const query = new URLSearchParams(location.search);
  const status = query.get('status') || 'pending';

  useEffect(() => {
    dispatch(fetchLabOrders({ status: 'paid' }));
  }, [dispatch, status]);

  const filteredOrders = labOrders.filter(order => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.patient?.firstName?.toLowerCase().includes(searchLower)) ||
      (order.patient?.lastName?.toLowerCase().includes(searchLower)) ||
      (order.patient?.phone?.includes(searchTerm)) ||
      (order._id?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {status === 'pending' ? 'Pending' : 'All'} Lab Orders
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button 
          variant="contained" 
          onClick={() => navigate('/lab/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <LabOrdersList 
          labOrders={filteredOrders} 
          showPatient={true} 
          showActions={true}
        />
      </Paper>
    </Box>
  );
};

export default AllLabOrders;