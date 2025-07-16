import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  return (
    <Card sx={{ minWidth: 200 }}>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {Icon && <Icon color={color} fontSize="large" />}
          <div>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" component="div">
              {value}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;