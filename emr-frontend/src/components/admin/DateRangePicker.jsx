import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const DateRangePicker = ({ value, onChange, label }) => {
  const [startDate, endDate] = value || [null, null];

  const handleStartDateChange = (date) => {
    onChange([date, endDate]);
  };

  const handleEndDateChange = (date) => {
    onChange([startDate, date]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={handleStartDateChange}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
        <Typography>to</Typography>
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={handleEndDateChange}
          renderInput={(params) => <TextField {...params} fullWidth />}
          minDate={startDate}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;