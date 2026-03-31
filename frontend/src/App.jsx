import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout        from './pages/Layout';
import Login         from './pages/Login';
import Dashboard     from './pages/Dashboard';
import Profile       from './pages/Profile';
import Courses       from './pages/Courses';
import Attendance    from './pages/Attendance';
import InternalMarks from './pages/InternalMarks';
import Grades        from './pages/Grades';
import Fees          from './pages/Fees';
import Timetable     from './pages/Timetable';

/** Simple auth guard — redirect to /login if no JWT token */
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes share the Layout (sidebar + main) */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index            element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="profile"       element={<Profile />} />
          <Route path="courses"       element={<Courses />} />
          <Route path="attendance"    element={<Attendance />} />
          <Route path="internal-marks" element={<InternalMarks />} />
          <Route path="grades"        element={<Grades />} />
          <Route path="fees"          element={<Fees />} />
          <Route path="timetable"     element={<Timetable />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
