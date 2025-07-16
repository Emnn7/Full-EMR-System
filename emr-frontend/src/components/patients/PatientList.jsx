import React from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { format } from 'date-fns';

const PatientList = ({ patients }) => {
  return (
    <Paper>
      <List>
        {patients.map((patient) => (
         <ListItem
  key={patient._id}
  button
  component={Link}
  to={`/doctors/patients/${patient._id}`}
>
            <ListItemAvatar>
              <Avatar>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${patient.firstName} ${patient.lastName}`}
              secondary={
                <>
                  <Typography component="span" variant="body2" display="block">
                    Phone: {patient.phone}
                  </Typography>
                  <Typography component="span" variant="body2" display="block">
                    DOB: {format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default PatientList;