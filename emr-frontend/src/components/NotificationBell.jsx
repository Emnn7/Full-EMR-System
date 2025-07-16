import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemText, Typography } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { markAsRead } from '../../src/redux/slices/notificationSlice';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const notifications = useSelector(state => state.notification.unread);
  const dispatch = useDispatch();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <List sx={{ width: 360 }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <ListItem 
                key={notification._id} 
                button
                onClick={() => handleMarkAsRead(notification._id)}
              >
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.createdAt).toLocaleString()}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <Typography variant="body2">No new notifications</Typography>
            </ListItem>
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationBell;