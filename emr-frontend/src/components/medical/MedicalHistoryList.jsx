import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

const MedicalHistoryList = ({ medicalHistory }) => {
  // Directly use the array or empty array if falsy
  const records = Array.isArray(medicalHistory) ? medicalHistory : [];
  
  if (!records.length) {
    return <Typography>No medical history recorded</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Medical History</Typography>
      <List>
        {records.map((record, index) => (
          <React.Fragment key={record._id || index}>
            <ListItem>
              <ListItemText
                primary={record.diagnosis || 'No diagnosis'}
                secondary={
                  `Date: ${new Date(record.createdAt).toLocaleDateString()} | ` +
                  `Symptoms: ${record.symptoms || 'N/A'} | ` +
                  `Notes: ${record.notes || 'N/A'}`
                }
              />
            </ListItem>
            {index < records.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default MedicalHistoryList;
