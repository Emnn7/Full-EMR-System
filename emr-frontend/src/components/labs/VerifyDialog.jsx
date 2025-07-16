import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography
} from '@mui/material';

export const VerifyDialog = ({ open, onClose, report, onVerify }) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onVerify(report._id, notes);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Verify Lab Report</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Verify results for {report?.testName}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Patient: {report?.patient?.firstName} {report?.patient?.lastName}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Result: {report?.result} {report?.unit}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Verification Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Confirm Verification
        </Button>
      </DialogActions>
    </Dialog>
  );
};