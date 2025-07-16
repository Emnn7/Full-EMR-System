import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div>
      <Typography variant="h4">Unauthorized Access</Typography>
      <Typography>You don't have permission to view this page</Typography>
      <Button component={Link} to="/" variant="contained">
        Return Home
      </Button>
    </div>
  );
}