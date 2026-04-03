import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { profileApi } from '../services/api';

const FIELD = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</dt>
    <dd className="mt-1 text-sm font-medium text-slate-800">{value || '—'}</dd>
  </div>
);

export default function AlumniProfile() {
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form,     setForm]     = useState({});

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = (user.name || 'A').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    profileApi.getAlumniProfile()
      .then((res) => { setProfile(res.data); setForm(res.data); })
      .catch(() => setError('Could not load profile. Ensure you are logged in as an alumni.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await profileApi.updateAlumniProfile(form);
      setProfile(res.data);
      setEditMode(false);
    } catch {
      setError('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Alumni Profile" subtitle="Your professional information" />

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
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* Identity Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-violet-700 h-20" />
              <div className="px-6 pb-6">
                <div className="-mt-10 flex items-end gap-4 mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center">
                    <span className="text-2xl font-bold text-violet-600">{initials}</span>
                  </div>
                  <div className="pb-1 flex-1 flex items-end justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{user.name}</h2>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="text-xs font-medium text-violet-600 hover:text-violet-800 border border-violet-200
                                 hover:border-violet-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>
                </div>

                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 pt-2 border-t border-slate-100">
                  <FIELD label="Role"    value="Alumni" />
                  <FIELD label="Company" value={profile?.company} />
                  <FIELD label="Designation" value={profile?.designation} />
                </dl>
              </div>
            </div>

            {/* Professional Details – View or Edit */}
            {!editMode ? (
              <>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Professional Details</h3>
                  <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                    <FIELD label="Industry"          value={profile?.industry} />
                    <FIELD label="Location"          value={profile?.location} />
                    <FIELD label="Experience (yrs)"  value={profile?.yearsOfExperience} />
                    <FIELD label="Mentor Available"  value={profile?.isMentorAvailable ? 'Yes' : 'No'} />
                  </dl>
                </div>

                {profile?.skills?.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profile?.careerTimeline?.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Career Timeline</h3>
                    <div className="space-y-3">
                      {profile.careerTimeline.map((t, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">{t.designation} at {t.company}</p>
                            <p className="text-xs text-slate-400">{t.startYear} – {t.endYear || 'Present'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                <h3 className="text-sm font-semibold text-slate-700">Edit Professional Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'company',          label: 'Company',             type: 'text'   },
                    { key: 'designation',      label: 'Designation / Role',  type: 'text'   },
                    { key: 'industry',         label: 'Industry',            type: 'text'   },
                    { key: 'location',         label: 'Location',            type: 'text'   },
                    { key: 'yearsOfExperience',label: 'Years of Experience', type: 'number' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                      <input
                        type={type}
                        value={form[key] || ''}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="mentorToggle"
                      checked={!!form.isMentorAvailable}
                      onChange={(e) => setForm({ ...form, isMentorAvailable: e.target.checked })}
                      className="w-4 h-4 accent-violet-600"
                    />
                    <label htmlFor="mentorToggle" className="text-sm text-slate-700">
                      Available for Mentorship
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold
                               rounded-lg transition-colors disabled:opacity-60">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditMode(false)}
                    className="px-5 py-2 border border-slate-300 text-slate-600 text-sm font-medium
                               rounded-lg hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
