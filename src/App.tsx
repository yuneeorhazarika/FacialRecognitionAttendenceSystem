import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ScanAttendance from './pages/ScanAttendance';
import StudentRegistration from './pages/StudentRegistration';
import ManageStudents from './pages/ManageStudents';
import AttendanceHistory from './pages/AttendanceHistory';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="scan" element={<ScanAttendance />} />
        <Route path="register" element={<StudentRegistration />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="history" element={<AttendanceHistory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;