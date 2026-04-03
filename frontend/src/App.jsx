import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Shared layout
import Layout        from './pages/Layout';
import Login         from './pages/Login';

// Student pages (Phase 10 – unchanged)
import Dashboard     from './pages/Dashboard';
import Profile       from './pages/Profile';
import Courses       from './pages/Courses';
import Attendance    from './pages/Attendance';
import InternalMarks from './pages/InternalMarks';
import Grades        from './pages/Grades';
import Fees          from './pages/Fees';
import Timetable     from './pages/Timetable';
import StudentMentorship from './pages/StudentMentorship';

// Alumni pages (Phase 11)
import AlumniDashboard  from './pages/AlumniDashboard';
import AlumniProfile    from './pages/AlumniProfile';
import Achievements     from './pages/Achievements';
import Mentorship       from './pages/Mentorship';
import Jobs             from './pages/Jobs';
import Posts            from './pages/Posts';

/* ── Guards ─────────────────────────────────────────────── */

/** Redirect to /login if not authenticated */
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

/** Redirect to /dashboard if authenticated user is not alumni */
function RequireAlumni({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'alumni') return <Navigate to="/dashboard" replace />;
  return children;
}

/* ── Router ─────────────────────────────────────────────── */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* ── Student Portal (Phase 10 – untouched) ── */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index                  element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="profile"         element={<Profile />} />
          <Route path="courses"         element={<Courses />} />
          <Route path="attendance"      element={<Attendance />} />
          <Route path="internal-marks"  element={<InternalMarks />} />
          <Route path="grades"          element={<Grades />} />
          <Route path="fees"            element={<Fees />} />
          <Route path="timetable"       element={<Timetable />} />
          <Route path="mentorship"      element={<StudentMentorship />} />
        </Route>

        {/* ── Alumni Portal (Phase 11) ── */}
        <Route
          path="/alumni"
          element={
            <RequireAlumni>
              <Layout />
            </RequireAlumni>
          }
        >
          <Route index                  element={<Navigate to="/alumni/dashboard" replace />} />
          <Route path="dashboard"       element={<AlumniDashboard />} />
          <Route path="profile"         element={<AlumniProfile />} />
          <Route path="achievements"    element={<Achievements />} />
          <Route path="mentorship"      element={<Mentorship />} />
          <Route path="jobs"            element={<Jobs />} />
          <Route path="posts"           element={<Posts />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
