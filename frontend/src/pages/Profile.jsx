import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { profileApi, resumeApi } from '../services/api';

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

  const [resumeData, setResumeData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    Promise.allSettled([
      profileApi.getStudentProfile(),
      resumeApi.getMe()
    ]).then(([profRes, resRes]) => {
      if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
      else setError('Could not load profile. Ensure you are logged in as a student.');
      
      if (resRes.status === 'fulfilled') setResumeData(resRes.value.data);
    }).finally(() => setLoading(false));
  }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setUploadMsg({ type: 'error', text: 'Only PDF files are allowed.' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setUploadMsg({ type: '', text: '' });

    try {
      await resumeApi.upload(formData);
      setUploadMsg({ type: 'success', text: 'Resume uploaded successfully ✅' });
      const updatedResume = await resumeApi.getMe();
      setResumeData(updatedResume.data);
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload resume.' });
    } finally {
      setUploading(false);
    }
  }

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

            {/* Resume Upload Module */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Resume & Skills</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-max ${resumeData?.resumeUrl ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {resumeData?.resumeUrl ? 'Resume uploaded ✅' : 'No resume uploaded'}
                </span>
              </div>
              
              <div className="text-sm text-slate-600 mb-4">
                Upload your resume in PDF format. We will automatically extract your skills to help mentors understand your background.
              </div>

              {uploadMsg.text && (
                <div className={`mb-4 px-3 py-2 rounded-lg text-sm border ${uploadMsg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {uploadMsg.text}
                </div>
              )}

              <div className="flex items-center gap-4">
                <label className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${uploading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'}`}>
                  {uploading ? 'Uploading...' : 'Upload PDF'}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Extracted Skills */}
            {(resumeData?.skills?.length > 0 || profile?.skills?.length > 0) && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Extracted Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(resumeData?.skills?.length ? resumeData.skills : profile?.skills)?.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-100">
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
