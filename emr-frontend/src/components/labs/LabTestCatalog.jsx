import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLabTestCatalog, 
  addLabTestToCatalog,
  updateLabTest,
  deleteLabTest
} from '../../redux/slices/labTestCatalogSlice';
import {
  Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Switch, FormControlLabel,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';


const LabTestCatalog = () => {
  const dispatch = useDispatch();
  const { tests, loading } = useSelector((state) => state.labTestCatalog);

  const [newTest, setNewTest] = useState({
    name: '',
    code: '',
    category: '',
    description: '',
    price: 0,
    isActive: true,
  });

  const [editTest, setEditTest] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchLabTestCatalog());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const currentState = editTest ? editTest : newTest;
    const setState = editTest ? setEditTest : setNewTest;
    
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = () => {
    const currentState = editTest ? editTest : newTest;
    const setState = editTest ? setEditTest : setNewTest;
    
    setState((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

const handleAddTest = () => {
  const { name, code, category, price } = newTest;
  if (name.trim() && code.trim() && category.trim() && price >= 0) {
    dispatch(addLabTestToCatalog({
      ...newTest,
      name: name.trim(),
      code: code.trim(),
      category: category.trim(),
      description: newTest.description.trim(),
      price: Number(price) // Ensure it's a number
    }));
    setNewTest({
      name: '',
      code: '',
      category: '',
      description: '',
      price: 0,
      isActive: true,
    });
  }
};

const handleUpdateTest = () => {
  if (editTest && editTest.name.trim() && editTest.code.trim() && 
      editTest.category.trim() && editTest.price >= 0) {
    dispatch(updateLabTest({
      _id: editTest._id,
      name: editTest.name.trim(),
      code: editTest.code.trim(),
      category: editTest.category.trim(),
      description: editTest.description.trim(),
      price: Number(editTest.price),
      isActive: editTest.isActive
    }));
    setEditTest(null);
  }
};

 const handleEditClick = (test) => {
  setEditTest({ 
    _id: test._id, // Make sure to include the ID
    name: test.name,
    code: test.code,
    category: test.category,
    description: test.description,
    isActive: test.isActive,
    createdAt: test.createdAt
  });
};

  const handleCancelEdit = () => {
    setEditTest(null);
  };

  const handleDeleteClick = (test) => {
    setTestToDelete(test);
    setDeleteDialogOpen(true);
  };
  const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');


  const handleConfirmDelete = () => {
    if (testToDelete) {
      dispatch(deleteLabTest(testToDelete._id));
      setDeleteDialogOpen(false);
      setTestToDelete(null);
      setSnackbarMessage('Test deleted successfully');
    setSnackbarOpen(true);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTestToDelete(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lab Test Catalog
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
  <Typography variant="h6">
    {editTest ? `Edit Test: ${editTest.name}` : 'Add New Test'}
  </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Test Name"
            name="name"
            value={editTest ? editTest.name : newTest.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Test Code"
            name="code"
            value={editTest ? editTest.code : newTest.code}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Category"
            name="category"
            value={editTest ? editTest.category : newTest.category}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Description (optional)"
            name="description"
            value={editTest ? editTest.description : newTest.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />

          <TextField
  label="Price"
  name="price"
  type="number"
  value={editTest ? editTest.price : newTest.price}
  onChange={handleChange}
  fullWidth
  inputProps={{ min: 0, step: 0.01 }}
/>
          <FormControlLabel
            control={
              <Switch
                checked={editTest ? editTest.isActive : newTest.isActive}
                onChange={handleToggle}
              />
            }
            label="Active"
          />
          {editTest ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleUpdateTest}>
                Update Test
              </Button>
              <Button variant="outlined" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </Box>
          ) : (
            <Button variant="contained" onClick={handleAddTest}>
              Add Test
            </Button>
          )}
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
            ) : (
              tests.map((test) => (
                <TableRow key={test._id}>
                  <TableCell>{test.name}</TableCell>
                  <TableCell>{test.code}</TableCell>
                  <TableCell>{test.category}</TableCell>
                  <TableCell>${test.price ? test.price.toFixed(2) : 'N/A'}</TableCell>
                  <TableCell>{test.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{new Date(test.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(test)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(test)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

<Snackbar
  open={snackbarOpen}
  autoHideDuration={3000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert onClose={() => setSnackbarOpen(false)} severity="success">
    {snackbarMessage}
  </Alert>
</Snackbar>


    {/* Delete Confirmation Dialog */}
<Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
  <DialogTitle>Confirm Delete</DialogTitle>
  <DialogContent>
    Are you sure you want to delete the test "{testToDelete?.name}"?
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCancelDelete}>Cancel</Button>
    <Button onClick={handleConfirmDelete} color="error" variant="contained">
      Delete
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default LabTestCatalog;