import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel
} from '@mui/material';

const availableTests = [
  'Complete Blood Count (CBC)',
  'Blood Glucose',
  'Urinalysis',
  'Lipid Profile',
  'Liver Function Test',
  'Kidney Function Test',
  'Electrolytes Panel',
  'COVID-19 Test',
  'Malaria Test',
  'HIV Test',
  'Pregnancy Test'
];

const LabOrderForm = ({ initialValues, onSubmit }) => {
  const validationSchema = Yup.object().shape({
    patientId: Yup.string().required('Patient is required'),
    tests: Yup.array()
      .min(1, 'At least one test must be selected')
      .required('Tests are required'),
    notes: Yup.string(),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      patientId: '',
      tests: [],
      notes: '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleTestToggle = (test) => {
    const currentIndex = formik.values.tests.indexOf(test);
    const newTests = [...formik.values.tests];

    if (currentIndex === -1) {
      newTests.push(test);
    } else {
      newTests.splice(currentIndex, 1);
    }

    formik.setFieldValue('tests', newTests);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Lab Order
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Patient</InputLabel>
              <Select
                name="patientId"
                value={formik.values.patientId}
                onChange={formik.handleChange}
                label="Patient"
                error={formik.touched.patientId && Boolean(formik.errors.patientId)}
              >
                <MenuItem value="patient1">John Doe</MenuItem>
                <MenuItem value="patient2">Jane Smith</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Select Tests
            </Typography>
            <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
              <FormGroup>
                {availableTests.map((test) => (
                  <FormControlLabel
                    key={test}
                    control={
                      <Checkbox
                        checked={formik.values.tests.includes(test)}
                        onChange={() => handleTestToggle(test)}
                        name={test}
                      />
                    }
                    label={test}
                  />
                ))}
              </FormGroup>
            </Paper>
            {formik.touched.tests && formik.errors.tests && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {formik.errors.tests}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Create Lab Order
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default LabOrderForm;