import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { Dashboard } from '../pages/Dashboard';
import { CompanySelectionPage } from '../pages/CompanySelectionPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/company-selection" 
          element={
            <ProtectedRoute>
              <CompanySelectionPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/company-selection" replace />} />
      </Routes>
    </div>
  );
}

export default App;