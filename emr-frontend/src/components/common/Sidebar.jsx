import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Science as ScienceIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Toolbar
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROLES } from '../../config/roles';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const getMenuItems = () => {
    const commonItems = [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: `/${user?.role.toLowerCase()}`,
      },
      {
        text: 'Settings',
        icon: <SettingsIcon />,
        path: '/settings',
      },
    ];

    if (user?.role === ROLES.Admin) {
      return [
        ...commonItems,
        {
          text: 'User Management',
          icon: <PeopleIcon />,
          path: '/admin/users',
        },
      ];
    }

    if (user?.role === ROLES.Receptionist) {
      return [
        ...commonItems,
        {
          text: 'Patient Registration',
          icon: <PeopleIcon />,
          path: '/receptionist/register',
        },
        {
          text: 'Appointments',
          icon: <CalendarIcon />,
          path: '/receptionist/appointments',
        },
      ];
    }

    if (user?.role === ROLES.Doctor) {
      return [
        ...commonItems,
        {
          text: 'Patients',
          icon: <PeopleIcon />,
          path: '/doctor/patients',
        },
        {
          text: 'Prescriptions',
          icon: <ReceiptIcon />,
          path: '/doctor/prescriptions',
        },
        {
          text: 'Lab Results',
          icon: <ScienceIcon />,
          path: '/doctor/lab-results',
        },
      ];
    }

    if (user?.role === ROLES.LabAssistant) {
      return [
        ...commonItems,
        {
          text: 'Vital Signs',
          icon: <HospitalIcon />,
          path: '/lab/vital-signs',
        },
        {
          text: 'Lab Tests',
          icon: <ScienceIcon />,
          path: '/lab/tests',
        },
      ];
    }

    return commonItems;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <List>
        {getMenuItems().map((item, index) => (
          <ListItem
            button
            key={index}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;