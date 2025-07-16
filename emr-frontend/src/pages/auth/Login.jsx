import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Link, Alert, 
  CircularProgress 
} from '@mui/material';
import { login } from '../../redux/slices/authSlice';
import { ROLES } from '../../config/roles';

const Login = () => {
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };
  
// Login.js (Updated handleSubmit)
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate() || disabled) return;

  setLoading(true);
  setError(null);

  try {
    const result = await dispatch(login(formData)).unwrap();
    console.log('Login response:', result.user?.role); // Debug role
    
    // Redirect based on role
    switch(result?.user?.role) {
      case ROLES.ADMIN:
        navigate('/AdminDashboard');
        break;
      case ROLES.DOCTOR:
        navigate('/doctor/dashboard');
        break;
      case ROLES.RECEPTIONIST:
        navigate('/receptionist/dashboard');
        break;
      case ROLES.LAB_ASSISTANT:
        navigate('/lab/dashboard');
        break;
      default:
        navigate('/unauthorized');
    }
  } catch (err) {
    if (err.response?.status === 429) { // Rate-limited
      setDisabled(true); // Lock the form
      const retryAfter = err.response?.headers?.['retry-after'] || 120; // Fallback: 2 mins
      setTimeout(() => setDisabled(false), retryAfter * 1000); // Auto-unlock
      setError(`Too many attempts. Retry after ${retryAfter} seconds.`);
    } else {
      setError(err.message || "Login failed");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={disabled}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            disabled={disabled}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || disabled}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Link href="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;