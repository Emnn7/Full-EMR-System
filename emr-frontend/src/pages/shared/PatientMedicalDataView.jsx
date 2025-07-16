import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Download, Print } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { fetchPatientById } from '../../redux/slices/patientSlice';
import { fetchPatientAppointments } from '../../redux/slices/appointmentSlice';
import { fetchPatientPrescriptions } from '../../redux/slices/prescriptionSlice';
import { fetchPatientLabReports } from '../../redux/slices/labReportSlice';

const PatientMedicalDataView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [generating, setGenerating] = useState(false);
  const { currentPatient, loading: patientLoading } = useSelector((state) => state.patient);
  const { appointments, loading: appointmentsLoading } = useSelector((state) => state.appointment);
  const { prescriptions, loading: prescriptionsLoading } = useSelector((state) => state.prescription);
  const { labReports, loading: labReportsLoading } = useSelector((state) => state.labReport);

  useEffect(() => {
    if (id) {
      dispatch(fetchPatientById(id));
      dispatch(fetchPatientAppointments(id));
      dispatch(fetchPatientPrescriptions(id));
      dispatch(fetchPatientLabReports(id));
    }
  }, [dispatch, id]);

  const getPatientName = () => {
    if (!currentPatient) return 'Patient';
    if (currentPatient.fullName) return currentPatient.fullName;
    if (currentPatient.firstName && currentPatient.lastName) {
      return `${currentPatient.firstName} ${currentPatient.lastName}`;
    }
    return 'Patient';
  };

  const getPatientBirthDate = () => {
    if (!currentPatient?.dateOfBirth) return 'N/A';
    return new Date(currentPatient.dateOfBirth).toLocaleDateString();
  };

  const generatePDF = () => {
    if (!currentPatient) return;
    
    setGenerating(true);
    
    const doc = new jsPDF();
    const patientName = getPatientName();
    
    // Add clinic header
    doc.setFontSize(18);
    doc.text('City Medical Clinic', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('123 Medical Drive, City, State 12345', 105, 22, { align: 'center' });
    doc.text('Phone: (123) 456-7890 | Email: contact@clinic.com', 105, 29, { align: 'center' });
    
    // Add patient information
    doc.setFontSize(16);
    doc.text('Medical Report', 105, 45, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Patient: ${patientName}`, 15, 55);
    doc.text(`Date of Birth: ${getPatientBirthDate()}`, 15, 62);
    doc.text(`Gender: ${currentPatient.gender || 'N/A'}`, 15, 69);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 15, 76);
    
    // Add medical history
    doc.setFontSize(14);
    doc.text('Medical History', 15, 90);
    doc.setFontSize(10);
    const medicalHistory = currentPatient.medicalHistory || {};
    const historyText = [
      `Symptoms: ${medicalHistory.symptomAssessment || 'N/A'}`,
      `Clinical Notes: ${medicalHistory.clinicalInterview || 'N/A'}`,
      `Past History: ${medicalHistory.pastMedicalHistory || 'N/A'}`,
      `Family History: ${medicalHistory.familyHistory || 'N/A'}`,
      `Allergies: ${medicalHistory.allergies || 'None'}`,
      `Current Medications: ${medicalHistory.currentMedications || 'None'}`,
    ];
    doc.text(historyText, 15, 100);
    
    // Add vital signs
    doc.setFontSize(14);
    doc.text('Vital Signs', 15, 130);
    if (currentPatient.vitalSigns?.length > 0) {
      const latestVitals = currentPatient.vitalSigns[0];
      const vitalsData = [
        ['Temperature', `${latestVitals.temperature || 'N/A'} °C`],
        ['Blood Pressure', latestVitals.bloodPressure || 'N/A'],
        ['Heart Rate', `${latestVitals.heartRate || 'N/A'} bpm`],
        ['Respiratory Rate', `${latestVitals.respiratoryRate || 'N/A'} breaths/min`],
        ['Oxygen Saturation', `${latestVitals.oxygenSaturation || 'N/A'}%`],
        ['Height/Weight', `${latestVitals.height || 'N/A'} cm / ${latestVitals.weight || 'N/A'} kg`],
        ['BMI', latestVitals.bmi || 'N/A'],
      ];
      doc.autoTable({
        startY: 140,
        head: [['Parameter', 'Value']],
        body: vitalsData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      });
    } else {
      doc.text('No vital signs recorded', 15, 140);
    }
    
    // Add lab results
    doc.setFontSize(14);
    doc.text('Lab Results', 15, doc.autoTable.previous.finalY + 15);
    if (labReports.length > 0) {
      const labData = labReports.map(report => [
        report.testName || 'N/A',
        report.result || 'N/A',
        report.unit || 'N/A',
        report.normalRange || 'N/A',
        report.dateTested ? new Date(report.dateTested).toLocaleDateString() : 'N/A',
      ]);
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 20,
        head: [['Test', 'Result', 'Unit', 'Normal Range', 'Date']],
        body: labData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      });
    } else {
      doc.text('No lab results available', 15, doc.autoTable.previous.finalY + 20);
    }
    
    // Add prescriptions
    doc.setFontSize(14);
    doc.text('Prescriptions', 15, doc.autoTable.previous.finalY + 15);
    if (prescriptions.length > 0) {
      const prescData = prescriptions.map(presc => [
        presc.medicationName || 'N/A',
        presc.dosage || 'N/A',
        presc.frequency || 'N/A',
        presc.duration || 'N/A',
        presc.datePrescribed ? new Date(presc.datePrescribed).toLocaleDateString() : 'N/A',
      ]);
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 20,
        head: [['Medication', 'Dosage', 'Frequency', 'Duration', 'Date Prescribed']],
        body: prescData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      });
    } else {
      doc.text('No prescriptions available', 15, doc.autoTable.previous.finalY + 20);
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.text('Generated by EMR System', 105, doc.internal.pageSize.height - 10, { align: 'center' });
    
    setGenerating(false);
    doc.save(`medical_report_${patientName.replace(/\s+/g, '_')}.pdf`);
  };

  if (patientLoading || appointmentsLoading || prescriptionsLoading || labReportsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentPatient) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography variant="h6">Patient not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Medical Report for {getPatientName()}
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={generatePDF}
            disabled={generating || !currentPatient}
            sx={{ mr: 2 }}
          >
            {generating ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Patient Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Name:</strong> {getPatientName()}</Typography>
            <Typography><strong>Date of Birth:</strong> {getPatientBirthDate()}</Typography>
            <Typography><strong>Gender:</strong> {currentPatient.gender || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Phone:</strong> {currentPatient.phoneNumber || 'N/A'}</Typography>
            <Typography><strong>Email:</strong> {currentPatient.email || 'N/A'}</Typography>
            <Typography><strong>Address:</strong> {currentPatient.address || 'N/A'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Medical History
        </Typography>
        {currentPatient.medicalHistory ? (
          <Box>
            <Typography paragraph><strong>Symptoms:</strong> {currentPatient.medicalHistory.symptomAssessment || 'N/A'}</Typography>
            <Typography paragraph><strong>Clinical Notes:</strong> {currentPatient.medicalHistory.clinicalInterview || 'N/A'}</Typography>
            <Typography paragraph><strong>Past Medical History:</strong> {currentPatient.medicalHistory.pastMedicalHistory || 'N/A'}</Typography>
            <Typography paragraph><strong>Family History:</strong> {currentPatient.medicalHistory.familyHistory || 'N/A'}</Typography>
            <Typography paragraph><strong>Allergies:</strong> {currentPatient.medicalHistory.allergies || 'None'}</Typography>
            <Typography paragraph><strong>Current Medications:</strong> {currentPatient.medicalHistory.currentMedications || 'None'}</Typography>
          </Box>
        ) : (
          <Typography>No medical history recorded</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Vital Signs
        </Typography>
        {currentPatient.vitalSigns?.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Parameter</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Date Recorded</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPatient.vitalSigns.map((vital, index) => (
                  <TableRow key={index}>
                    <TableCell>Temperature</TableCell>
                    <TableCell>{vital.temperature || 'N/A'} °C</TableCell>
                    <TableCell>{vital.date ? new Date(vital.date).toLocaleString() : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No vital signs recorded</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Lab Results
        </Typography>
        {labReports.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Normal Range</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {labReports.map((report, index) => (
                  <TableRow key={index}>
                    <TableCell>{report.testName || 'N/A'}</TableCell>
                    <TableCell>{report.result || 'N/A'}</TableCell>
                    <TableCell>{report.unit || 'N/A'}</TableCell>
                    <TableCell>{report.normalRange || 'N/A'}</TableCell>
                    <TableCell>{report.dateTested ? new Date(report.dateTested).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No lab results available</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Prescriptions
        </Typography>
        {prescriptions.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Medication</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Date Prescribed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescriptions.map((presc, index) => (
                  <TableRow key={index}>
                    <TableCell>{presc.medicationName || 'N/A'}</TableCell>
                    <TableCell>{presc.dosage || 'N/A'}</TableCell>
                    <TableCell>{presc.frequency || 'N/A'}</TableCell>
                    <TableCell>{presc.duration || 'N/A'}</TableCell>
                    <TableCell>{presc.datePrescribed ? new Date(presc.datePrescribed).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No prescriptions available</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default PatientMedicalDataView;