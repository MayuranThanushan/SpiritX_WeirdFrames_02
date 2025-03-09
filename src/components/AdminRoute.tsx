import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export interface AuthContextType {
  currentUser: { isAdmin: boolean } | null;
}

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser || !currentUser.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;