import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Chip, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Autocomplete,
  IconButton, Divider, CircularProgress, MenuItem, InputLabel, Select, FormControl,
  Snackbar
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as MedicalIcon,
  Science as LabIcon,
  Receipt as PrescriptionIcon,
  Add as AddIcon,
  Send as SendIcon,
  Remove as RemoveIcon,
  Add as AddIconSmall
} from '@mui/icons-material';
import DescriptionIcon from '@mui/icons-material/Description';
import {
  Description as DiagnosticsIcon,
  Image as ImageIcon,
  Upload as UploadIcon
} from '@mui/icons-material';


import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import { fetchPatientById } from '../../redux/slices/patientSlice';
import { fetchPatientAppointments } from '../../redux/slices/appointmentSlice';
import { fetchPatientPrescriptions } from '../../redux/slices/prescriptionSlice';
import { fetchPatientLabReports } from '../../redux/slices/labReportSlice';
import { fetchPatientMedicalHistory } from '../../redux/slices/medicalHistorySlice';
import { getConsultationsByPatient } from '../../redux/slices/consultationSlice';
import { fetchProcedureCodes } from '../../redux/slices/procedureCodeSlice';
import { createPatientProcedure } from '../../redux/slices/patientProcedureSlice';
import { fetchPatientDiagnostics, uploadDiagnosticReport } from '../../redux/slices/diagnosticSlice';


const DoctorPatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [procedureDialogOpen, setProcedureDialogOpen] = useState(false);
  const [diagnosticsDialogOpen, setDiagnosticsDialogOpen] = useState(false);
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [diagnosticForm, setDiagnosticForm] = useState({
    title: '',
    description: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    facility: '',
    notes: '',
    files: null
  });
  


  // Redux state selectors with default values
  const { currentPatient, loading: patientLoading } = useSelector((state) => state.patient);
  const { appointments = [], loading: appointmentsLoading } = useSelector((state) => state.appointment);
  const { prescriptions = [], loading: prescriptionsLoading } = useSelector((state) => state.prescription);
 const { reports: labReports = [], loading: labReportsLoading, error: labReportsError } = useSelector((state) => state.labReport);
  const { consultationsByPatient = {}, loading: consultationsLoading } = useSelector((state) => state.consultation);
  const { data: medicalHistory = [], loading: medicalHistoryLoading } = useSelector((state) => state.medicalHistory);
const { codes: procedureCodes = [], loading: procedureCodesLoading } = 
  useSelector((state) => state.procedureCode);
  const { 
  diagnostics = [], 
  loading: diagnosticsLoading 
} = useSelector((state) => state.diagnostic);
  
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const consultations = consultationsByPatient[patientId] || [];

  useEffect(() => {
    if (currentPatient && medicalHistory) {
      const safeMedicalHistory = Array.isArray(medicalHistory) ? medicalHistory : [];
      setIsFirstVisit(safeMedicalHistory.length === 0);
    }
  }, [currentPatient, medicalHistory]);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId));
      dispatch(fetchPatientAppointments(patientId));
      dispatch(fetchPatientPrescriptions(patientId));
      dispatch(fetchPatientLabReports(patientId));
      dispatch(fetchPatientMedicalHistory(patientId)); 
      dispatch(getConsultationsByPatient(patientId));
      dispatch(fetchProcedureCodes()); // Fetch procedure codes from admin panel
      dispatch(fetchPatientDiagnostics(patientId));
      dispatch(fetchPatientLabReports(patientId));
    }
  }, [dispatch, patientId]);
   console.log('Procedure Codes:', procedureCodes);
  if (procedureCodes.length > 0) {
    console.log('First procedure:', procedureCodes[0]);
  }
const procedureCodeState = useSelector((state) => state.procedureCode);
console.log('Procedure Code State:', procedureCodeState);
console.log('Lab reports data:', {
  labReports,
  loading: labReportsLoading,
  error: labReportsError,
  patientId
});
  // Safe filtering of procedures
const filteredProcedures = procedureCodes.filter(proc => {
  if (!proc || !proc.code || !proc.description) return false;
  const codeMatch = proc.code.toLowerCase().includes(searchTerm.toLowerCase());
  const descMatch = proc.description.toLowerCase().includes(searchTerm.toLowerCase());
  return codeMatch || descMatch;
});
  
  
const handleViewReport = (reportId) => {
  navigate(`/lab/reports/${reportId}`);
};
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddConsultation = () => {
    navigate(`/consultations/new?patientId=${patientId}`);
  };

  const handleAddPrescription = () => {
    navigate(`/prescriptions/new/${patientId}`);
  };

  const handleOrderLabTest = () => {
    navigate(`/lab-orders/new/${patientId}`);
  };

  const handleAddMedicalHistory = () => {
    navigate(`/medical-history/new/${patientId}`);
  };


  const handleAddProcedure = () => {
    setProcedureDialogOpen(true);
  };

  const handleProcedureDialogClose = () => {
    setProcedureDialogOpen(false);
    setSelectedProcedures([]);
    setNotes('');
  };

  const handleAddProcedureToSelection = (procedure) => {
    if (!selectedProcedures.some(p => p._id === procedure._id)) {
      setSelectedProcedures([...selectedProcedures, { ...procedure, quantity: 1 }]);
      setSearchTerm('');
    }
  };

  const handleRemoveProcedure = (id) => {
    setSelectedProcedures(selectedProcedures.filter(p => p._id !== id));
  };

  const handleQuantityChange = (id, change) => {
    setSelectedProcedures(selectedProcedures.map(p => 
      p._id === id ? { ...p, quantity: Math.max(1, p.quantity + change) } : p
    ));
  };

const handleSubmitProcedures = async () => {
  try {
    if (!selectedProcedures || selectedProcedures.length === 0) {
      throw new Error('No procedures selected');
    }

    // Transform data to match backend expectation
    const proceduresData = selectedProcedures.map(proc => ({
      procedure: proc._id,  // Make sure this matches the ID in your procedure catalog
      quantity: proc.quantity || 1
    }));

    console.log('Submitting procedures:', {
      patientId: currentPatient._id,
      procedures: proceduresData,
      notes
    });

    await dispatch(createPatientProcedure({
      patientId: currentPatient._id,
      procedures: proceduresData,
      notes
    })).unwrap();

    setSuccessMessage('Procedures submitted successfully!');
    setShowSuccess(true);
    handleProcedureDialogClose();
  } catch (err) {
    console.error('Procedure submission error:', {
      error: err,
      selectedProcedures,
    });
    setSuccessMessage(`Failed to submit procedures: ${err.message}`);
    setShowSuccess(true);
  }
};

  const calculateTotal = () => {
    return selectedProcedures.reduce((sum, proc) => sum + (proc.price * proc.quantity), 0);
  };

  if (patientLoading) return <CircularProgress />;
  if (!currentPatient) return <Alert severity="error">Patient not found</Alert>;

    const handleDiagnosticFormChange = (e) => {
    const { name, value } = e.target;
    setDiagnosticForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setDiagnosticForm(prev => ({
      ...prev,
      files: e.target.files
    }));
  };

  const handleAddDiagnostics = () => {
    setDiagnosticsDialogOpen(true);
  };

  const handleDiagnosticsDialogClose = () => {
    setDiagnosticsDialogOpen(false);
    setDiagnosticForm({
      title: '',
      description: '',
      type: '',
      date: new Date().toISOString().split('T')[0],
      facility: '',
      notes: '',
      files: null
    });
  };

const handleUploadDiagnostics = async () => {
  try {
    const formData = new FormData();
    // Convert patientId to string explicitly
    formData.append('patient', currentPatient._id);
    formData.append('title', diagnosticForm.title);
    formData.append('description', diagnosticForm.description);
    formData.append('type', diagnosticForm.type);
    formData.append('date', diagnosticForm.date);
    formData.append('facility', diagnosticForm.facility);
    formData.append('notes', diagnosticForm.notes);
    
    if (diagnosticForm.files) {
      for (let i = 0; i < diagnosticForm.files.length; i++) {
        formData.append('files', diagnosticForm.files[i]);
      }
    }

    const resultAction = await dispatch(uploadDiagnosticReport(formData));
    if (uploadDiagnosticReport.fulfilled.match(resultAction)) {
      setSuccessMessage('Diagnostic report uploaded successfully!');
      setShowSuccess(true);
      handleDiagnosticsDialogClose();
      dispatch(fetchPatientDiagnostics(patientId));
    } else {
      throw resultAction.error;
    }
  } catch (error) {
    console.error('Upload error:', error);
    setSuccessMessage(error.message || 'Failed to upload diagnostic report');
    setShowSuccess(true);
  }
};

const handleFilePreview = (file) => {
  const fileUrl = `${process.env.REACT_APP_API_BASE_URL}${file.url}`;
  
  // Create a new window with a blank page
  const previewWindow = window.open('', '_blank', 'width=800,height=600');
  
  // Write custom HTML to the new window
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Preview - ${file.filename || 'Diagnostic File'}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: #f5f5f5;
            font-family: Arial, sans-serif;
          }
          .preview-container {
            max-width: 90%;
            max-height: 80vh;
            margin-top: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            background: white;
            padding: 20px;
            text-align: center;
          }
          img {
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
          }
          .actions {
            margin-top: 20px;
          }
          button {
            padding: 8px 16px;
            margin: 0 10px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <h2>File Preview</h2>
        <div class="preview-container">
          ${file.type === 'pdf' ? `
            <embed src="${fileUrl}" type="application/pdf" width="100%" height="500px">
            <div class="actions">
              <a href="${fileUrl}" download>
                <button>Download PDF</button>
              </a>
            </div>
          ` : `
            <img src="${fileUrl}" alt="Preview" onerror="this.src='${window.location.origin}/fallback-image.jpg'">
            <div class="actions">
              <a href="${fileUrl}" download>
                <button>Download Image</button>
              </a>
            </div>
          `}
        </div>
      </body>
    </html>
  `);
  previewWindow.document.close();
};

  return (
    <Box>
      {/* Diagnostics Dialog */}
      <Dialog open={diagnosticsDialogOpen} onClose={handleDiagnosticsDialogClose} fullWidth maxWidth="md">
        <DialogTitle>
          Add Diagnostic Report for {currentPatient?.firstName} {currentPatient?.lastName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={diagnosticForm.title}
              onChange={handleDiagnosticFormChange}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              name="description"
              value={diagnosticForm.description}
              onChange={handleDiagnosticFormChange}
              multiline
              rows={3}
              fullWidth
            />
            
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={diagnosticForm.type}
                onChange={handleDiagnosticFormChange}
                label="Type"
              >
                <MenuItem value="X-ray">X-ray</MenuItem>
                <MenuItem value="CT">CT Scan</MenuItem>
                <MenuItem value="MRI">MRI</MenuItem>
                <MenuItem value="Ultrasound">Ultrasound</MenuItem>
                <MenuItem value="PET">PET Scan</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Date"
              name="date"
              type="date"
              value={diagnosticForm.date}
              onChange={handleDiagnosticFormChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <TextField
              label="Facility"
              name="facility"
              value={diagnosticForm.facility}
              onChange={handleDiagnosticFormChange}
              fullWidth
              required
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Report Files (Images, PDFs)
              </Typography>
              <input
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                id="diagnostic-upload"
                type="file"
                onChange={handleFileChange}
                multiple
              />
              <label htmlFor="diagnostic-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                >
                  Select Files
                </Button>
              </label>
              {diagnosticForm.files && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Selected {diagnosticForm.files.length} file(s):
                  </Typography>
                  <ul>
                    {Array.from(diagnosticForm.files).map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
            
            <TextField
              label="Notes"
              name="notes"
              value={diagnosticForm.notes}
              onChange={handleDiagnosticFormChange}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDiagnosticsDialogClose}>Cancel</Button>
          <Button
            onClick={handleUploadDiagnostics}
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!diagnosticForm.title || !diagnosticForm.type || !diagnosticForm.facility || !diagnosticForm.files}
          >
            Upload Report
          </Button>
        </DialogActions>
      </Dialog>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Doctor Actions</Typography>
          <Button 
            variant="outlined"
            onClick={() => {
           
              navigate('/doctor/dashboard');
            }}
          >
            Return to Dashboard
          </Button>
        <Grid container spacing={2}>
         <Grid item xs={12} sm={6} md={3}>
<Button
  variant="contained"
  fullWidth
  startIcon={<AddIcon />}
  onClick={handleAddMedicalHistory}
>
  Add Medical History
</Button>

</Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddConsultation}
            >
              Add Consultation
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddPrescription}
            >
              Add Prescription
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleOrderLabTest}
            >
              Order Lab Test
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddProcedure}
              disabled={procedureCodesLoading}
            >
              {procedureCodesLoading ? 'Loading Procedures...' : 'Add Procedures'}
            </Button>
          </Grid>
              <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddDiagnostics}
            >
              Add Diagnostics
            </Button>
          </Grid>
        </Grid>
        </Grid>
      </Paper>

     {/* Procedure Selection Dialog */}
<Dialog open={procedureDialogOpen} onClose={handleProcedureDialogClose} fullWidth maxWidth="md">
  <DialogTitle>
    Add Procedures for {currentPatient.firstName} {currentPatient.lastName}
  </DialogTitle>
  <DialogContent>
    {procedureCodesLoading ? (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    ) : (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}> 
          <Autocomplete
            freeSolo
            options={filteredProcedures}
            getOptionLabel={(option) => `${option.code} - ${option.description} ($${option.price})`}
            inputValue={searchTerm}
            onInputChange={(e, value) => setSearchTerm(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Procedures"
                variant="outlined"
                fullWidth
              />
            )}
            onChange={(e, value) => value && handleAddProcedureToSelection(value)}
          />
          
          <FormControl fullWidth>
            <InputLabel>Select Procedure</InputLabel>
            <Select
              value=""
              label="Select Procedure"
              onChange={(e) => {
                const selected = procedureCodes.find(p => p._id === e.target.value);
                if (selected) handleAddProcedureToSelection(selected);
              }}
            >
              {procedureCodes.map((proc) => (
                <MenuItem key={proc._id} value={proc._id}>
                  {proc.code} - {proc.description} (${proc.price})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        

        <Typography variant="h6" sx={{ mb: 1 }}>Selected Procedures</Typography>
        
        {selectedProcedures.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No procedures selected
          </Typography>
        ) : (
          <>
            {selectedProcedures.map(proc => (
              <Box 
                key={proc._id} 
                sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                <Box>
                  <Typography variant="body1">
                    {proc.code} - {proc.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${proc.price} each
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleQuantityChange(proc._id, -1)}
                    disabled={proc.quantity <= 1}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography mx={1}>{proc.quantity}</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleQuantityChange(proc._id, 1)}
                  >
                    <AddIconSmall fontSize="small" />
                  </IconButton>
                  
                  <Typography ml={2} fontWeight="bold">
                    ${(proc.price * proc.quantity).toFixed(2)}
                  </Typography>
                  
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleRemoveProcedure(proc._id)}
                    sx={{ ml: 1 }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="h6">
                Total: ${calculateTotal().toFixed(2)}
              </Typography>
              
            </Box>
          </>
        )}

        <TextField
          label="Notes (Optional)"
          multiline
          rows={3}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mt: 2 }}
        />
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleProcedureDialogClose}>Cancel</Button>
    <Button
      onClick={handleSubmitProcedures}
      variant="contained"
      startIcon={<SendIcon />}
      disabled={selectedProcedures.length === 0}
    >
      Send to Reception
    </Button>
  </DialogActions>
</Dialog>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" icon={<PersonIcon />} />
          <Tab label="Appointments" icon={<CalendarIcon />}  />
          <Tab label="Medical History" icon={<MedicalIcon />} />
          <Tab label="Lab Results" icon={<LabIcon />} />
          <Tab label="Prescriptions" icon={<PrescriptionIcon />} />
          <Tab label="Consultations" icon={<MedicalIcon />} />
          <Tab label="Diagnostics" icon={<DiagnosticsIcon />} />
        </Tabs>
      </Paper>
      
      {tabValue === 0 && (
        <PatientOverviewTab
          patient={currentPatient}
          appointments={appointments}
          loading={appointmentsLoading}
        />
      )}
      {tabValue === 1 && <AppointmentsTab appointments={appointments} loading={appointmentsLoading} patient={currentPatient} />}
      {tabValue === 2 && (
        <MedicalHistoryTab 
          medicalHistory={medicalHistory || []} 
          loading={medicalHistoryLoading} 
          isFirstVisit={isFirstVisit}
        />
      )}
     {tabValue === 3 && (
  <LabResultsTab 
    labReports={labReports}
    loading={labReportsLoading}
    error={labReportsError}
  />
)}
      {tabValue === 4 && <PrescriptionsTab prescriptions={prescriptions} loading={prescriptionsLoading} />}
      {tabValue === 5 && (
        <ConsultationsTab consultations={consultations} loading={consultationsLoading} />
      )}
       {tabValue === 6 && (
        <DiagnosticsTab diagnostics={diagnostics} loading={diagnosticsLoading}
        onFilePreview={handleFilePreview} />
      )}
      {/* Success Notification Snackbar */}
<Snackbar
  open={showSuccess}
  autoHideDuration={6000}
  onClose={() => setShowSuccess(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert 
    onClose={() => setShowSuccess(false)} 
    severity="success" 
    sx={{ width: '100%' }}
  >
    {successMessage}
  </Alert>
</Snackbar>
    </Box>
  );
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Tab Components
// Add the DiagnosticsTab component
const DiagnosticsTab = ({ diagnostics, loading, onFilePreview  }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>Diagnostic Reports</Typography>
    {loading ? (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    ) : diagnostics.length === 0 ? (
      <Typography>No diagnostic reports found</Typography>
    ) : (
      diagnostics.map((report) => (
        <Accordion key={report._id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <ImageIcon color="primary" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">{report.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {report.type} • {new Date(report.date).toLocaleDateString()} • {report.facility}
                </Typography>
              </Box>
              {report.uploadedBy && (
                <Typography variant="caption">
                  Uploaded by: {report.uploadedBy.firstName} {report.uploadedBy.lastName}
                </Typography>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph><strong>Description:</strong> {report.description || 'N/A'}</Typography>
            <Typography paragraph><strong>Notes:</strong> {report.notes || 'N/A'}</Typography>
            
            {report.files?.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Attachments:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  {report.files.map((file, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        width: 150, 
                        height: 150, 
                        border: '1px solid #ddd', 
                        borderRadius: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 2
                        }
                      }}
                      onClick={() => onFilePreview(file)}
                    >
                      {file.type === 'pdf' ? (
                        <DescriptionIcon sx={{ fontSize: 50, color: 'primary.main' }} />
                      ) : (
              <img
  src={`${process.env.REACT_APP_API_BASE_URL}${file.url.replace('/api', '')}`}
  alt="Diagnostic"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = `${process.env.PUBLIC_URL}/fallback-image.jpg`;
  }}
  style={{ 
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  }}
/>
                    )}
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </AccordionDetails>
        </Accordion>
      ))
    )}
  </Paper>
);

const PatientOverviewTab = ({ patient, appointments, loading }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Paper sx={{ p: 2 }}>
        
        <Typography variant="h6" gutterBottom>Patient Overview</Typography>
        <Typography><strong>Name:</strong> {patient?.firstName} {patient?.lastName}</Typography>
        <Typography><strong>Age:</strong> {calculateAge(patient?.dateOfBirth)}</Typography>
        <Typography><strong>Gender:</strong> {patient?.gender || 'N/A'}</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} md={6}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Recent Appointments</Typography>
        {loading ? (
          <Typography>Loading appointments...</Typography>
        ) : appointments?.length === 0 ? (
          <Typography>No appointments found</Typography>
        ) : (
          appointments.filter(appt => appt.patient?._id === patient._id).slice(0, 3).map((appointment) => (
            <Box key={appointment._id} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
             <Typography>
  <strong>{appointment.date ? new Date(appointment.date).toLocaleDateString() : 'Date not available'}</strong>
</Typography>

<Typography>
  Doctor: {appointment.doctor ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 'N/A'}
</Typography>


              <Typography>Reason: {appointment.reason || 'N/A'}</Typography>
              <Chip
                label={appointment.status || 'unknown'}
                size="small"
                sx={{ mt: 1 }}
                color={
                  appointment.status === 'Completed' ? 'success' :
                    appointment.status === 'Cancelled' ? 'error' : 'primary'
                }
              />
            </Box>
          ))
        )}
      </Paper>
    </Grid>
  </Grid>
);

const AppointmentsTab = ({ appointments, loading, patient }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>Appointments</Typography>
    {loading ? (
      <Typography>Loading appointments...</Typography>
    ) : appointments.length === 0 ? (
      <Typography>No appointments found</Typography>
    ) : (
      appointments.filter(appt => appt.patient?._id === patient._id).map((appointment) => (
        <Box key={appointment._id} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
          <Typography>
  <strong>{appointment.date ? new Date(appointment.date).toLocaleDateString() : 'Date not available'}</strong>
</Typography>

          <Typography>
  Doctor: {appointment.doctor ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 'N/A'}
</Typography>

          <Typography>Reason: {appointment.reason}</Typography>
          <Chip
            label={appointment.status}
            size="small"
            sx={{ mt: 1 }}
            color={appointment.status === 'Completed' ? 'success' : appointment.status === 'Cancelled' ? 'error' : 'primary'}
          />
        </Box>
      ))
    )}
  </Paper>
);

const MedicalHistoryTab = ({ medicalHistory = [], loading }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Medical History</Typography>
        <Typography variant="body2" color="text.secondary">
          {medicalHistory.length} records found
        </Typography>
      </Box>

      {loading ? (
        <CircularProgress size={24} />
      ) : medicalHistory.length > 0 ? (
        medicalHistory.map((history, index) => (
          <Accordion key={history._id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                <strong>Record #{medicalHistory.length - index}</strong> - {new Date(history.createdAt).toLocaleDateString()}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography><strong>Diagnosis:</strong> {history.diagnosis || 'N/A'}</Typography>
                <Typography><strong>Symptoms:</strong> {history.symptoms || 'N/A'}</Typography>
                <Typography><strong>Past Illnesses:</strong> {history.pastIllnesses || 'N/A'}</Typography>
                <Typography><strong>Surgical History:</strong> {history.surgicalHistory || 'N/A'}</Typography>
                <Typography><strong>Family History:</strong> {history.familyHistory || 'N/A'}</Typography>
                
                <Typography sx={{ mt: 1 }}><strong>Allergies:</strong></Typography>
                {history.allergies?.length > 0 ? (
                  history.allergies.map((a, i) => (
                    <Typography key={i}>• {a.name} - {a.reaction} ({a.severity})</Typography>
                  ))
                ) : (
                  <Typography>No recorded allergies</Typography>
                )}

                <Typography sx={{ mt: 2 }}><strong>Current Medications:</strong></Typography>
                {history.currentMedications?.length > 0 ? (
                  history.currentMedications.map((med, i) => (
                    <Box key={i} sx={{ ml: 2, mb: 1 }}>
                      <Typography>• <strong>{med.name}</strong> - {med.dosage} ({med.frequency})</Typography>
                      {med.startDate && (
                        <Typography variant="body2">Started: {new Date(med.startDate).toLocaleDateString()}</Typography>
                      )}
                      {med.prescribedBy && (
                        <Typography variant="body2">Prescribed by: {med.prescribedBy}</Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography>No current medications</Typography>
                )}

                <Typography sx={{ mt: 2 }}><strong>Lifestyle:</strong></Typography>
                {history.lifestyle && (
                  <Box sx={{ ml: 2 }}>
                    <Typography>• Smoking: {history.lifestyle.smoking ? 'Yes' : 'No'}</Typography>
                    <Typography>• Alcohol: {history.lifestyle.alcohol ? 'Yes' : 'No'}</Typography>
                    {history.lifestyle.exerciseFrequency && (
                      <Typography>• Exercise: {history.lifestyle.exerciseFrequency}</Typography>
                    )}
                    {history.lifestyle.diet && (
                      <Typography>• Diet: {history.lifestyle.diet}</Typography>
                    )}
                  </Box>
                )}
               </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Alert severity="info">No medical history available</Alert>
      )}
    </Paper>
  );
};

const LabResultsTab = ({ labReports, loading, error }) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading lab reports: {error}
      </Alert>
    );
  }

  if (!labReports || labReports.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No lab results found for this patient
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Lab Results</Typography>
      {labReports.map((report) => (
        <Box key={report._id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
          <Typography variant="subtitle1">
            <strong>Report ID:</strong> {report._id.substring(0, 8).toUpperCase()}
          </Typography>
          <Typography>
            <strong>Status:</strong> {report.status}
          </Typography>
          <Typography>
            <strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}
          </Typography>
          
          <Typography variant="subtitle2" sx={{ mt: 2 }}>Tests:</Typography>
          {report.tests?.map((test, index) => (
            <Box key={index} sx={{ ml: 2, mb: 1 }}>
              <Typography>
                <strong>{test.name}</strong>: {test.result} {test.unit}
              </Typography>
              {test.normalRange && (
                <Typography variant="caption">
                  (Normal range: {test.normalRange})
                </Typography>
              )}
            </Box>
          ))}

          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/lab/reports/${report._id}`)}
            sx={{ mt: 2 }}
          >
            View Full Report
          </Button>
        </Box>
      ))}
    </Paper>
  );
};

const statusColors = {
  active: 'primary',
  completed: 'success',
  cancelled: 'error'
};

const PrescriptionsTab = ({ prescriptions, loading }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>Prescriptions</Typography>
    {loading ? (
      <Typography>Loading...</Typography>
    ) : !Array.isArray(prescriptions) || prescriptions.length === 0 ? (
      <Typography>No prescriptions found</Typography>
    ) : (
      prescriptions.map((prescription) => (
        <Box key={prescription._id} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
          <Typography><strong>Date:</strong> {new Date(prescription.createdAt).toLocaleDateString()}</Typography>
          <Typography><strong>Doctor:</strong> Dr. {prescription.doctor?.lastName}</Typography>
          <Typography><strong>Diagnosis:</strong> {prescription.diagnosis || 'Not specified'}</Typography>
          <Typography><strong>Medications:</strong></Typography>
          <ul>
            {prescription.medications.map((med, index) => (
              <li key={index}>
                {med.name} - {med.dosage} ({med.frequency}) for {med.duration}
                {med.instructions && ` - ${med.instructions}`}
              </li>
            ))}
          </ul>
          <Typography><strong>Status:</strong> 
            <Chip 
              label={prescription.status} 
              size="small" 
              color={statusColors[prescription.status] || 'default'}
              sx={{ ml: 1 }}
            />
          </Typography>
        </Box>
      ))
    )}
  </Paper>
);
const ConsultationsTab = ({ consultations, loading }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>Consultations</Typography>
    {loading ? (
      <Typography>Loading consultations...</Typography>
    ) : !Array.isArray(consultations) || consultations.length === 0 ? (
      <Typography>No consultations found</Typography>
    ) : (
      consultations.map((consultation) => (
        <Box key={consultation._id} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
          <Typography><strong>Date:</strong> {new Date(consultation.createdAt).toLocaleDateString()}</Typography>
          <Typography><strong>Doctor:</strong> {consultation.doctor?.firstName} {consultation.doctor?.lastName}</Typography>
          <Typography><strong>Diagnosis:</strong> {consultation.diagnosis || 'N/A'}</Typography>
          <Typography><strong>Notes:</strong> {consultation.notes}</Typography>
          {consultation.symptoms?.length > 0 && (
            <Box>
              <Typography><strong>Symptoms:</strong></Typography>
              <ul>
                {consultation.symptoms.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            </Box>
            
          )}
          
        </Box>
      ))
    )}
  </Paper>
);


export default DoctorPatientProfile;