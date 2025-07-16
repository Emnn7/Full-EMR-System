import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Assignment } from '@mui/icons-material';
import MedicalReportsTable from '../common/MedicalReportTable';
import { useDispatch } from 'react-redux';
import { fetchAllMedicalReports } from '../../redux/slices/medicalReportSlice';

const MedicalReportList = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchAllMedicalReports());
  }, [dispatch]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <Assignment sx={{ mr: 1 }} /> Medical Reports
        </Typography>
      </Box>
      
      <MedicalReportsTable 
        emptyMessage="No medical reports found. Generate one to get started."
      />
    </Box>
  );
};

export default MedicalReportList;