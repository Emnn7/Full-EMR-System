import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, Tab, Box, Typography, CircularProgress } from '@mui/material';
import LabOrderList from './LabOrderList';
import LabReports from '../../pages/lab/LabReports';
import { fetchLabOrders } from '../../redux/slices/labOrderSlice';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const LabWorkflow = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const { labOrders, loading } = useSelector((state) => state.labOrder);

  useEffect(() => {
    // Fetch pending orders when component mounts
    dispatch(fetchLabOrders({ status: 'pending' }));
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter pending orders
  const pendingOrders = labOrders?.filter(order => order.status === 'pending') || [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Pending Orders" />
        <Tab label="My Reports" />
        <Tab label="Vital Signs" />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom>Pending Lab Orders</Typography>
        <LabOrderList 
          labOrders={pendingOrders} 
          showPatient={true}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>My Lab Reports</Typography>
        <LabReports />
      </TabPanel>
      
      
    </Box>
  );
};

export default LabWorkflow;