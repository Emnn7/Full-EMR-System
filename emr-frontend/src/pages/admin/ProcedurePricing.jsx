// ProcedurePricing.jsx
import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, TextField, Button, FormControl, InputLabel,
  Select, MenuItem, Box, Grid, Typography, Switch
} from '@mui/material';
import { Add, Edit, Delete, Save, Cancel } from '@mui/icons-material';

const ProcedurePricing = ({ pricing, onUpdate }) => {
  const [editingId, setEditingId] = React.useState(null);
  const [editedProcedure, setEditedProcedure] = React.useState({});
  const [newProcedure, setNewProcedure] = React.useState({
    name: '',
    code: '',
    category: '',
    basePrice: 0,
    duration: 30,
    isActive: true
  });

  const handleEdit = (proc) => {
    setEditingId(proc._id || proc.code);
    setEditedProcedure({ ...proc });
  };

  const handleSave = (id) => {
    const updatedPricing = pricing.map(p =>
      (p._id || p.code) === id ? editedProcedure : p
    );
    onUpdate(updatedPricing);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    const updated = pricing.filter(p => (p._id || p.code) !== id);
    onUpdate(updated);
  };

  const handleAdd = () => {
    if (!newProcedure.name || !newProcedure.code || !newProcedure.category) return;
    const newEntry = { ...newProcedure, _id: Date.now().toString() }; // fake _id for UI
    onUpdate([...pricing, newEntry]);
    setNewProcedure({
      name: '',
      code: '',
      category: '',
      basePrice: 0,
      duration: 30,
      isActive: true
    });
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Price ($)</TableCell>
            <TableCell>Duration (min)</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pricing.map((proc) => {
            const isEditing = editingId === (proc._id || proc.code);
            return (
              <TableRow key={proc._id || proc.code}>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      value={editedProcedure.name}
                      onChange={(e) =>
                        setEditedProcedure({ ...editedProcedure, name: e.target.value })
                      }
                      size="small"
                      fullWidth
                    />
                  ) : (
                    proc.name
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      value={editedProcedure.code}
                      onChange={(e) =>
                        setEditedProcedure({ ...editedProcedure, code: e.target.value })
                      }
                      size="small"
                      fullWidth
                    />
                  ) : (
                    proc.code
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      value={editedProcedure.category}
                      onChange={(e) =>
                        setEditedProcedure({ ...editedProcedure, category: e.target.value })
                      }
                      size="small"
                      fullWidth
                    />
                  ) : (
                    proc.category
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      type="number"
                      value={editedProcedure.basePrice}
                      onChange={(e) =>
                        setEditedProcedure({ ...editedProcedure, basePrice: Number(e.target.value) })
                      }
                      size="small"
                      fullWidth
                    />
                  ) : (
                    `$${proc.basePrice}`
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      type="number"
                      value={editedProcedure.duration}
                      onChange={(e) =>
                        setEditedProcedure({ ...editedProcedure, duration: Number(e.target.value) })
                      }
                      size="small"
                      fullWidth
                    />
                  ) : (
                    `${proc.duration} min`
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Switch
                      checked={editedProcedure.isActive}
                      onChange={(e) =>
                        setEditedProcedure({ ...editedProcedure, isActive: e.target.checked })
                      }
                    />
                  ) : proc.isActive ? 'Active' : 'Inactive'}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <>
                      <IconButton onClick={() => handleSave(proc._id || proc.code)}>
                        <Save />
                      </IconButton>
                      <IconButton onClick={() => setEditingId(null)}>
                        <Cancel />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton onClick={() => handleEdit(proc)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(proc._id || proc.code)}>
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Add New Procedure</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Procedure Name"
              value={newProcedure.name}
              onChange={(e) =>
                setNewProcedure({ ...newProcedure, name: e.target.value })
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Code"
              value={newProcedure.code}
              onChange={(e) =>
                setNewProcedure({ ...newProcedure, code: e.target.value })
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Category"
              value={newProcedure.category}
              onChange={(e) =>
                setNewProcedure({ ...newProcedure, category: e.target.value })
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Base Price"
              type="number"
              value={newProcedure.basePrice}
              onChange={(e) =>
                setNewProcedure({ ...newProcedure, basePrice: Number(e.target.value) })
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Duration (min)"
              type="number"
              value={newProcedure.duration}
              onChange={(e) =>
                setNewProcedure({ ...newProcedure, duration: Number(e.target.value) })
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newProcedure.isActive ? 'Active' : 'Inactive'}
                label="Status"
                onChange={(e) =>
                  setNewProcedure({
                    ...newProcedure,
                    isActive: e.target.value === 'Active'
                  })
                }
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
            >
              Add Procedure
            </Button>
          </Grid>
        </Grid>
      </Box>
    </TableContainer>
  );
};

export default ProcedurePricing;
