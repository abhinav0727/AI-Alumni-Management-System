import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Table  from '../components/Table';
import { alumniApi } from '../services/api';

const SKILLS = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'Machine Learning'];

const EMPTY_FORM = {
  title: '', company: '', location: '', description: '',
  requiredSkills: [], jobType: 'Full-time',
};

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];

export default function Jobs() {
  const [jobs,      setJobs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [submitting,setSubmitting]= useState(false);
  const [formError, setFormError] = useState('');

  function loadJobs() {
    setLoading(true);
    alumniApi.getMyJobs()
      .then((res) => setJobs(res.data.jobs || []))
      .catch(() => setError('Unable to fetch job listings.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadJobs(); }, []);

  function toggleSkill(skill) {
    const current = form.requiredSkills;
    setForm({
      ...form,
      requiredSkills: current.includes(skill)
        ? current.filter((s) => s !== skill)
        : [...current, skill],
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim()) {
      setFormError('Title and Company are required.'); return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await alumniApi.createJob(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadJobs(); // refresh list
    } catch {
      setFormError('Failed to post job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(jobId) {
    if (!window.confirm('Delete this job listing?')) return;
    try {
      await alumniApi.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch {
      alert('Failed to delete job.');
    }
  }

  const columns = [
    {
      key: 'title',
      label: 'Position',
      render: (v, row) => (
        <div>
          <p className="font-medium text-slate-700">{v}</p>
          <p className="text-xs text-slate-400">{row.company}</p>
        </div>
      ),
    },
    { key: 'location',  label: 'Location', render: (v) => v || 'Remote' },
    {
      key: 'requiredSkills',
      label: 'Skills',
      render: (v) => (
        <div className="flex flex-wrap gap-1">
          {(v || []).slice(0, 3).map((s) => (
            <span key={s} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-full">{s}</span>
          ))}
          {(v || []).length > 3 && (
            <span className="text-xs text-slate-400">+{v.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'applications',
      label: 'Applicants',
      render: (v) => (
        <span className="text-sm font-semibold text-slate-700">{v?.length || 0}</span>
      ),
    },
    {
      key: '_id',
      label: 'Action',
      render: (id) => (
        <button
          onClick={() => handleDelete(id)}
          className="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Jobs" subtitle="Post and manage job opportunities" />

      <div className="flex-1 p-6 space-y-5">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {jobs.length} listing{jobs.length !== 1 ? 's' : ''} posted
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700
                       text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Post a Job
          </button>
        </div>

        {/* Create Job Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">New Job Listing</h3>

            {formError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2 mb-4">{formError}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'title',    label: 'Job Title *',  placeholder: 'e.g. Software Engineer' },
                  { key: 'company',  label: 'Company *',    placeholder: 'e.g. Google' },
                  { key: 'location', label: 'Location',     placeholder: 'e.g. Bangalore / Remote' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input
                      type="text"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Job Type</label>
                  <select
                    value={form.jobType}
                    onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm
                               focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and requirements…"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm
                             focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSkill(s)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors
                        ${form.requiredSkills.includes(s)
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-violet-400'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold
                             rounded-lg transition-colors disabled:opacity-60">
                  {submitting ? 'Posting…' : 'Post Job'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setFormError(''); }}
                  className="px-5 py-2 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-t border-slate-100 px-5 py-4 flex gap-8">
                {[...Array(5)].map((_, j) => <div key={j} className="h-3 bg-slate-100 rounded flex-1" />)}
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        ) : (
          <Table columns={columns} data={jobs} emptyMsg="No jobs posted yet. Click 'Post a Job' to get started." />
        )}
      </div>
    </div>
  );
}
