import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Card   from '../components/Card';
import { profileApi, alumniApi } from '../services/api';

/* ── Mock data for features without a real endpoint ── */
const MOCK_MENTORSHIP_REQUESTS = [
  { _id: 'm1', studentName: 'Arjun Kumar',   department: 'CSE', status: 'pending' },
  { _id: 'm2', studentName: 'Priya Sharma',  department: 'ECE', status: 'pending' },
  { _id: 'm3', studentName: 'Rahul Verma',   department: 'CSE', status: 'accepted' },
];

export default function AlumniDashboard() {
  const [profile,  setProfile]  = useState(null);
  const [jobs,     setJobs]     = useState([]);
  const [loading,  setLoading]  = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    async function load() {
      const [profRes, jobsRes] = await Promise.allSettled([
        profileApi.getAlumniProfile(),
        alumniApi.getMyJobs(),
      ]);
      if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data.jobs || []);
      setLoading(false);
    }
    load();
  }, []);

  const pending  = MOCK_MENTORSHIP_REQUESTS.filter((r) => r.status === 'pending').length;
  const accepted = MOCK_MENTORSHIP_REQUESTS.filter((r) => r.status === 'accepted').length;

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Alumni Dashboard" subtitle="Welcome to your alumni portal" />

      <div className="flex-1 p-6 space-y-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-violet-800 rounded-2xl p-6 text-white">
          <p className="text-violet-200 text-sm font-medium mb-1">Welcome back,</p>
          <h2 className="text-2xl font-bold">{user.name || 'Alumni'}</h2>
          <p className="text-violet-200 text-sm mt-1">
            {profile?.company
              ? `${profile.designation || 'Professional'} at ${profile.company}`
              : 'Complete your profile to get started'}
          </p>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 h-24 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-3" />
                <div className="h-7 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card
              title="Mentorship Requests"
              value={pending}
              subtitle="Awaiting your response"
              accent="border-violet-500"
              icon={<HandIcon />}
            />
            <Card
              title="Accepted Students"
              value={accepted}
              subtitle="Currently mentoring"
              accent="border-emerald-500"
              icon={<UsersIcon />}
            />
            <Card
              title="Jobs Posted"
              value={jobs.length}
              subtitle="Active listings"
              accent="border-amber-500"
              icon={<BriefcaseIcon />}
            />
          </div>
        )}

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {QUICK_LINKS.map(({ to, label, color, icon: Icon }) => (
              <a key={to} href={to}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-slate-200
                           shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-600 text-center">{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Pending Mentorship Requests */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Recent Mentorship Requests</h3>
            <a href="/alumni/mentorship" className="text-xs text-violet-600 hover:underline font-medium">
              View all →
            </a>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_MENTORSHIP_REQUESTS.slice(0, 3).map((req) => (
              <div key={req._id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{req.studentName}</p>
                  <p className="text-xs text-slate-400">{req.department}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full
                  ${req.status === 'accepted'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'}`}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        {jobs.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">My Job Listings</h3>
              <a href="/alumni/jobs" className="text-xs text-violet-600 hover:underline font-medium">
                Manage →
              </a>
            </div>
            <div className="divide-y divide-slate-100">
              {jobs.slice(0, 3).map((j) => (
                <div key={j._id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{j.title}</p>
                    <p className="text-xs text-slate-400">{j.company} · {j.location || 'Remote'}</p>
                  </div>
                  <span className="text-xs bg-violet-50 text-violet-700 font-medium px-2.5 py-1 rounded-full">
                    {j.applications?.length || 0} applied
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
  { to: '/alumni/profile',      label: 'My Profile',    color: 'bg-violet-500', icon: UserIcon },
  { to: '/alumni/achievements', label: 'Achievements',  color: 'bg-amber-500',  icon: StarIcon },
  { to: '/alumni/mentorship',   label: 'Mentorship',    color: 'bg-emerald-500',icon: HandIcon },
  { to: '/alumni/jobs',         label: 'Jobs',          color: 'bg-rose-500',   icon: BriefcaseIcon },
  { to: '/alumni/posts',        label: 'Posts',         color: 'bg-cyan-500',   icon: ChatIcon },
];

function UserIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
}
function StarIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>;
}
function HandIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002" /></svg>;
}
function BriefcaseIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>;
}
function ChatIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;
}
function UsersIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
}
