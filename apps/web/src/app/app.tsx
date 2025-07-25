import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { Dashboard } from '../pages/Dashboard';
import { CompanySelectionPage } from '../pages/CompanySelectionPage';
import { WriterProfilePage } from '../pages/WriterProfilePage';
import { ContentPlanningPage } from '../pages/ContentPlanningPage';
import { BlogPostManagementPage } from '../pages/BlogPostManagementPage';
import { SocialMediaPage } from '../pages/SocialMediaPage';
import { ContentLibraryPage } from '../pages/ContentLibraryPage';
import { UserManagementPage } from '../pages/UserManagementPage';
import { AnalyticsDashboard } from '../pages/AnalyticsDashboard';
import { AIDashboard } from '../pages/AIDashboard';
import { SecurityDashboard } from '../pages/SecurityDashboard';
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
        <Route 
          path="/writer-profiles" 
          element={
            <ProtectedRoute>
              <WriterProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/content-planning" 
          element={
            <ProtectedRoute>
              <ContentPlanningPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/blog-posts" 
          element={
            <ProtectedRoute>
              <BlogPostManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/social-media" 
          element={
            <ProtectedRoute>
              <SocialMediaPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/content-library" 
          element={
            <ProtectedRoute>
              <ContentLibraryPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user-management" 
          element={
            <ProtectedRoute>
              <UserManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-dashboard" 
          element={
            <ProtectedRoute>
              <AIDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/security" 
          element={
            <ProtectedRoute>
              <SecurityDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/company-selection" replace />} />
      </Routes>
    </div>
  );
}

export default App;