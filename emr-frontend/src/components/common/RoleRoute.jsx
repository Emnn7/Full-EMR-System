import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRoleLevel } from '../../config/roles';

const RoleRoute = ({ children, minRoleLevel }) => {
  const { user } = useSelector((state) => state.auth);
  const userRoleLevel = getRoleLevel(user?.role);

  if (userRoleLevel < minRoleLevel) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;