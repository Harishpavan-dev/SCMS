import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';
import useNotifications from './hooks/useNotifications';

// Layouts
import { ProtectedLayout } from './layouts/ProtectedLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { QRGeneratorPage } from './pages/attendance/QRGeneratorPage';
import { QRScannerPage } from './pages/attendance/QRScannerPage';
import { LecturersPage } from './pages/lecturers/LecturersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MyAttendancePage } from './pages/attendance/MyAttendancePage';
import { RepAttendancePage } from './pages/attendance/RepAttendancePage';
import { RepAnalyticsPage } from './pages/attendance/RepAnalyticsPage';
import { AdminQrAttendance } from './pages/attendance/AdminQrAttendance';
import { StudentsPage } from './pages/students/StudentsPage';
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { StudentIdCard } from './pages/students/StudentIdCard';
import { HodDashboard } from './pages/dashboards/HodDashboard';
import { SubjectsPage } from './pages/subjects/SubjectsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ResultsPage } from './pages/results/ResultsPage';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [init, setInit] = useState(false);

  // Initialize notifications
  useNotifications();

  useEffect(() => {
    checkAuth().finally(() => setInit(true));
  }, [checkAuth]);

  if (!init) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegistrationPage />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Admin Routes */}
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/lecturers" element={<LecturersPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/attendance/admin-scan" element={<AdminQrAttendance />} />
          
          {/* Role-Specific Dashboards */}
          <Route path="/dashboards/student-dashboard" element={<StudentDashboard />} />
          <Route path="/dashboards/hod-dashboard" element={<HodDashboard />} />
          {/* Attendance Routes */}
          <Route path="/attendance" element={<RepAttendancePage />} />
          <Route path="/rep-login" element={<RepAttendancePage />} />
          <Route path="/attendance/rep-analytics" element={<RepAnalyticsPage />} />
          
          {/* Legacy Lecturer Routes (Disabled) */}
          <Route path="/attendance/generator" element={<QRGeneratorPage />} /> 
          
          {/* Student/Rep Routes */}
          <Route path="/my-id-card" element={<StudentIdCard />} />
          <Route path="/attendance/my" element={<MyAttendancePage />} />
          <Route path="/attendance/scan" element={<QRScannerPage />} />
          
          {/* Common/Shared Routes Structure */}
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
