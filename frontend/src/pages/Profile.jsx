import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { profileApi } from '../services/api';

const FIELD = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</dt>
    <dd className="mt-1 text-sm font-medium text-slate-800">{value || '—'}</dd>
  </div>
);

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    profileApi.getStudentProfile()
      .then((res) => setProfile(res.data))
      .catch(() => setError('Could not load profile. Ensure you are logged in as a student.'))
      .finally(() => setLoading(false));
  }, []);

  const user = profile?.user || JSON.parse(localStorage.getItem('user') || '{}');
  const initials = (user.name || 'S').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Profile" subtitle="Your academic & personal information" />

      <div className="flex-1 p-6 space-y-6 max-w-3xl">

        {loading && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-40" />
                <div className="h-3 bg-slate-200 rounded w-28" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Identity Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 h-20" />
              <div className="px-6 pb-6">
                <div className="-mt-10 flex items-end gap-4 mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md
                                  flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">{initials}</span>
                  </div>
                  <div className="pb-1">
                    <h2 className="text-lg font-bold text-slate-800">{user.name}</h2>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 pt-2 border-t border-slate-100">
                  <FIELD label="Role"    value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : undefined} />
                  <FIELD label="Department" value={profile?.department} />
                  <FIELD label="Section"    value={profile?.section} />
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Academic Details</h3>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <FIELD label="Register Number" value={profile?.registerNumber} />
                <FIELD label="Admission Year"  value={profile?.admissionYear} />
                <FIELD label="Graduation Year" value={profile?.graduationYear} />
                <FIELD label="CGPA"            value={profile?.CGPA} />
                <FIELD label="Active Arrears"  value={profile?.hasActiveArrears ? 'Yes' : 'No'} />
              </dl>
            </div>

            {/* Skills */}
            {profile?.skills?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
