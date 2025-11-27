import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import HealthDiagnosis from './pages/HealthDiagnosis';
import TreatmentPlanner from './pages/TreatmentPlanner';
import Login from './pages/login';
import Register from './pages/register';

// Function to validate token (you can expand this later for real JWT checks)
const validateToken = (token: string | null) => {
  console.log("Validating token:", token);
  return !!token; // true if token exists, false otherwise
};

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  if (!validateToken(token)) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
  return children;
};

// App routing
function App() {
  return (
    <Routes>
      {/* Default route redirects to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diagnosis"
        element={
          <ProtectedRoute>
            <HealthDiagnosis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/treatment-planner"
        element={
          <ProtectedRoute>
            <TreatmentPlanner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/treatment"
        element={
          <ProtectedRoute>
            <TreatmentPlanner />
          </ProtectedRoute>
        }
      />

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
