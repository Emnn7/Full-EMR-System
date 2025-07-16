import React, { useState, useEffect } from 'react';
import { 
  DataGrid, 
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchProcedureCodes, 
  addProcedureCode, 
  updateProcedureCode,
  deleteProcedureCode,
  resetProcedureCodeState 
} from '../../redux/slices/procedureCodeSlice';

const CustomToolbar = () => {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
};

const ProcedureCodeManager = () => {
  const dispatch = useDispatch();

  // Redux state selectors
  const { codes, loading, error, success } = useSelector(state => state.procedureCode);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Form states for create & edit
  const [newCode, setNewCode] = useState({
    code: '',
    description: '',
    price: 0,
    category: 'consultation',
    isActive: true
  });

  // Store ID of code being edited
  const [editCodeId, setEditCodeId] = useState(null);

  useEffect(() => {
    dispatch(fetchProcedureCodes());
  }, [dispatch]);

  // Close dialogs on successful add or update
  useEffect(() => {
    if (success) {
      setSnackbarMessage('Procedure code updated successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      setOpenCreateDialog(false);
      setOpenEditDialog(false);
      setNewCode({
        code: '',
        description: '',
        price: 0,
        category: 'consultation',
        isActive: true
      });
      setEditCodeId(null);
      dispatch(resetProcedureCodeState());
    }
  }, [success, dispatch]);

  // Handle create
  const handleCreateCode = () => {
    dispatch(addProcedureCode(newCode));
  };

  // Snackbar close handler
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  // Handle edit dialog open
  const handleEditClick = (code) => {
    setEditCodeId(code._id);
    setNewCode({
      code: code.code,
      description: code.description,
      price: code.price,
      category: code.category,
      isActive: code.isActive
    });
    setOpenEditDialog(true);
  };

  // Handle update
  const handleUpdateCode = () => {
    dispatch(updateProcedureCode({ _id: editCodeId, ...newCode }));
  };

  // Handle delete
  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this procedure code?')) {
      dispatch(deleteProcedureCode(id));
    }
  };

const columns = [
  { field: 'code', headerName: 'Code', width: 120 },
  { field: 'description', headerName: 'Description', width: 250 },
{
  field: 'price',
  headerName: 'Price',
  width: 120,
  renderCell: (params) => {
    if (params.value === undefined || params.value === null) return 'N/A';
    const price = parseFloat(params.value);
    return isNaN(price) ? 'N/A' : `$${price.toFixed(2)}`;
  },
},
  { field: 'category', headerName: 'Category', width: 150 },
  { 
    field: 'isActive', 
    headerName: 'Status', 
    width: 100,
    renderCell: (params) => (params.value ? 'Active' : 'Inactive')
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Box>
        <Button size="small" color="primary" onClick={() => handleEditClick(params.row)}>Edit</Button>
        <Button size="small" color="error" onClick={() => handleDeleteClick(params.row._id)}>Delete</Button>
      </Box>
    )
  }
];

  useEffect(() => {
  console.log('Current codes data:', codes);
}, [codes]);
useEffect(() => {
  if (codes && codes.length > 0) {
    console.log('First code sample:', codes[0]);
    console.log('Price type:', typeof codes[0].price);
  }
}, [codes]);
useEffect(() => {
  console.log("Procedure Codes Data:", codes);
  if (codes && codes.length > 0) {
    console.log("First item price:", codes[0].price, typeof codes[0].price);
  }
}, [codes]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Procedure Codes Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Add New Procedure
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      {loading && <Typography sx={{ mb: 2 }}>Loading...</Typography>}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={codes || []}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          components={{
            Toolbar: CustomToolbar,
          }}
          getRowId={(row) => row._id}
          loading={loading}
          disableExtendRowFullWidth={true}
        />
      </Box>

      {/* Create Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Add New Procedure Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Code"
              value={newCode.code}
              onChange={(e) => setNewCode({...newCode, code: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newCode.description}
              onChange={(e) => setNewCode({...newCode, description: e.target.value})}
              fullWidth
              required
            />
            <TextField
  label="Price"
  type="number"
  value={newCode.price}
  onChange={(e) => setNewCode({...newCode, price: parseFloat(e.target.value) || 0})}
  fullWidth
  required
  inputProps={{ min: 0, step: 0.01 }}
/>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={newCode.category}
                label="Category"
                onChange={(e) => setNewCode({...newCode, category: e.target.value})}
              >
                <MenuItem value="consultation">Consultation</MenuItem>
                <MenuItem value="procedure">Procedure</MenuItem>
                <MenuItem value="test">Test</MenuItem>
                <MenuItem value="medication">Medication</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={newCode.isActive.toString()}
                label="Status"
                onChange={(e) => setNewCode({...newCode, isActive: e.target.value === 'true'})}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCode} variant="contained" disabled={loading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Procedure Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Code"
              value={newCode.code}
              onChange={(e) => setNewCode({...newCode, code: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newCode.description}
              onChange={(e) => setNewCode({...newCode, description: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Price"
              type="number"
              value={newCode.price}
              onChange={(e) => setNewCode({...newCode, price: parseFloat(e.target.value) || 0})}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={newCode.category}
                label="Category"
                onChange={(e) => setNewCode({...newCode, category: e.target.value})}
              >
                <MenuItem value="consultation">Consultation</MenuItem>
                <MenuItem value="procedure">Procedure</MenuItem>
                <MenuItem value="test">Test</MenuItem>
                <MenuItem value="medication">Medication</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={newCode.isActive.toString()}
                label="Status"
                onChange={(e) => setNewCode({...newCode, isActive: e.target.value === 'true'})}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateCode} variant="contained" disabled={loading}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProcedureCodeManager;