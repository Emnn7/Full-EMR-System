import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

const ReportTemplates = ({ templates = [], onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    content: ''
  });

  const handleOpenDialog = (index = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setTemplateForm(templates[index]);
    } else {
      setEditingIndex(null);
      setTemplateForm({ name: '', content: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTemplateForm({ name: '', content: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTemplateForm({
      ...templateForm,
      [name]: value,
    });
  };

  const handleSaveTemplate = () => {
    const updatedTemplates = [...templates];
    if (editingIndex !== null) {
      updatedTemplates[editingIndex] = templateForm;
    } else {
      updatedTemplates.push(templateForm);
    }
    onUpdate(updatedTemplates);
    handleCloseDialog();
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter((_, i) => i !== index);
      onUpdate(updatedTemplates);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Templates</Typography>
        <Button startIcon={<Add />} onClick={() => handleOpenDialog()} variant="contained">
          Add Template
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List>
        {templates.length === 0 && (
          <Typography variant="body2" color="text.secondary">No templates available.</Typography>
        )}

        {templates.map((template, index) => (
          <ListItem key={index} divider
            secondaryAction={
              <>
                <IconButton edge="end" onClick={() => handleOpenDialog(index)}>
                  <Edit />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(index)}>
                  <Delete />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={template.name}
              secondary={template.content.slice(0, 60) + (template.content.length > 60 ? '...' : '')}
            />
          </ListItem>
        ))}
      </List>

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIndex !== null ? 'Edit Template' : 'Add Template'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Template Name"
            name="name"
            value={templateForm.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Content"
            name="content"
            value={templateForm.content}
            onChange={handleChange}
            fullWidth
            multiline
            rows={6}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTemplate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportTemplates;
