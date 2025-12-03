import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';

import Notices from '../pages/Notices';
import AdminNotices from '../pages/AdminNotices';

import Events from '../pages/Events';
import AdminEvents from '../pages/AdminEvents';

import Chat from '../pages/Chat';

import ProfilePage from '../pages/Profile';
import AlumniDashboard from '../pages/AlumniDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';

import AdminReports from '../pages/AdminReports';
import AdminAlumni from '../pages/AdminAlumni';
import InvitePage from '../pages/Invite';

import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRouter() {
  return (
    <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AlumniDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notices" 
          element={
            <ProtectedRoute>
              <Notices />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events" 
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/notices" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminNotices />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/events" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminEvents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/alumni" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminAlumni />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminReports />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/invite" 
          element={
            <ProtectedRoute requireAdmin>
              <InvitePage />
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}
