import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { studentApi, profileApi } from '../services/api';

export default function Dashboard() {
  const [profile, setProfile]     = useState(null);
  const [courses, setCourses]     = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [profRes, coursesRes, attRes, marksRes] = await Promise.allSettled([
          profileApi.getStudentProfile(),
          studentApi.getCourses(),
          studentApi.getAttendance(),
          studentApi.getMarks(),
        ]);

        if (profRes.status === 'fulfilled')    setProfile(profRes.value.data);
        if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data.courses || []);
        if (attRes.status === 'fulfilled')     setAttendance(attRes.value.data.attendance || []);
        if (marksRes.status === 'fulfilled')   setMarks(marksRes.value.data.marks || []);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const avgAttendance = attendance.length
    ? (attendance.reduce((s, r) => s + parseFloat(r.percentage || 0), 0) / attendance.length).toFixed(1)
    : '—';

  const latestRecord = marks.length ? marks[marks.length - 1] : null;
  const cgpa = latestRecord?.cgpa ?? '—';
  const sgpa = latestRecord?.sgpa ?? '—';

  return (
    <div className="flex flex-col h-full">
      <Navbar
        title="Dashboard"
        subtitle={profile ? `${profile.department || ''} · Sem ${profile.currentSemester || ''}` : 'Welcome back'}
      />

      <div className="flex-1 p-6 space-y-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
          <p className="text-primary-100 text-sm font-medium mb-1">Welcome back,</p>
          <h2 className="text-2xl font-bold">
            {profile?.user?.name || JSON.parse(localStorage.getItem('user') || '{}').name || 'Student'}
          </h2>
          <p className="text-primary-200 text-sm mt-1">
            {profile?.department
              ? `${profile.department} · Reg No: ${profile.registerNumber || 'N/A'}`
              : 'Your academic summary is below'}
          </p>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 h-24 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-3" />
                <div className="h-7 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              title="Enrolled Courses"
              value={courses.length}
              subtitle="This semester"
              accent="border-primary-500"
              icon={<BookIcon />}
            />
            <Card
              title="Avg. Attendance"
              value={avgAttendance !== '—' ? `${avgAttendance}%` : '—'}
              subtitle="Across all courses"
              accent="border-emerald-500"
              icon={<ClipboardIcon />}
            />
            <Card
              title="SGPA"
              value={sgpa}
              subtitle="Latest semester"
              accent="border-violet-500"
              icon={<AcademicCapIcon />}
            />
            <Card
              title="CGPA"
              value={cgpa}
              subtitle="Cumulative"
              accent="border-amber-500"
              icon={<StarIcon />}
            />
          </div>
        )}

        {/* Quick Navigation */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_LINKS.map(({ to, label, color, icon: Icon }) => (
              <a
                key={to}
                href={to}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-slate-200
                            shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`}
              >
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-600 text-center">{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Courses Preview */}
        {courses.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Enrolled Courses</h3>
              <a href="/courses" className="text-xs text-primary-600 hover:underline font-medium">
                View all →
              </a>
            </div>
            <div className="divide-y divide-slate-100">
              {courses.slice(0, 5).map((c) => (
                <div key={c._id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.courseName}</p>
                    <p className="text-xs text-slate-400">{c.courseCode}</p>
                  </div>
                  <span className="text-xs bg-primary-50 text-primary-700 font-medium px-2.5 py-1 rounded-full">
                    {c.credits} cr
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const QUICK_LINKS = [
  { to: '/courses',        label: 'Courses',         color: 'bg-primary-500', icon: BookIcon },
  { to: '/attendance',     label: 'Attendance',      color: 'bg-emerald-500', icon: ClipboardIcon },
  { to: '/internal-marks', label: 'Internal Marks',  color: 'bg-rose-500',    icon: PencilIcon },
  { to: '/grades',         label: 'Grades',          color: 'bg-violet-500',  icon: AcademicCapIcon },
  { to: '/fees',           label: 'Fees',            color: 'bg-amber-500',   icon: CurrencyIcon },
  { to: '/timetable',      label: 'Timetable',       color: 'bg-cyan-500',    icon: CalendarIcon },
];

function BookIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
}
function ClipboardIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>;
}
function PencilIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>;
}
function AcademicCapIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;
}
function StarIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>;
}
function CurrencyIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
}
function CalendarIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
}
