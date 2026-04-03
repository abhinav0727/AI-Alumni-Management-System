import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { achievementsApi } from '../services/api';

const CATEGORIES = ['Research', 'Professional', 'Technical', 'Academic', 'Other'];

const BADGE_COLOR = {
  Research:     'bg-blue-50 text-blue-700',
  Professional: 'bg-emerald-50 text-emerald-700',
  Technical:    'bg-violet-50 text-violet-700',
  Academic:     'bg-amber-50 text-amber-700',
  Other:        'bg-slate-100 text-slate-600',
};

export default function Achievements() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ title: '', description: '', date: '', category: 'Professional' });
  const [formError, setFormError] = useState('');
  const [saving,   setSaving]   = useState(false);

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    try {
      setLoading(true);
      setApiError('');
      const res = await achievementsApi.getAll();
      // Normalize: map backend 'type' → 'category' for display
      const normalized = (res.data.achievements || []).map((a) => ({
        ...a,
        id:       a._id,
        category: a.type,
      }));
      setItems(normalized);
    } catch (err) {
      console.error(err);
      setApiError('Failed to load achievements. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Add ────────────────────────────────────────────────────────────────────
  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    try {
      setSaving(true);
      setFormError('');
      const res = await achievementsApi.add(form);
      const a = res.data.achievement;
      setItems([{ ...a, id: a._id, category: a.type }, ...items]);
      setForm({ title: '', description: '', date: '', category: 'Professional' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || 'Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    try {
      await achievementsApi.remove(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to delete achievement.');
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Achievements" subtitle="Your milestones and accomplishments" />

      <div className="flex-1 p-6 space-y-5">

        {/* Header action */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {loading ? 'Loading…' : `${items.length} achievement${items.length !== 1 ? 's' : ''} recorded`}
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700
                       text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Add Achievement
          </button>
        </div>

        {/* API-level error banner */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {apiError}
            <button onClick={fetchAchievements} className="ml-3 underline text-red-600 text-xs">Retry</button>
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">New Achievement</h3>
            {formError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2 mb-3">{formError}</p>
            )}
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm
                               focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g. Best Paper Award"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm
                               focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm
                               focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm
                               focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Brief description"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold
                             rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setFormError(''); }}
                  className="px-5 py-2 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-2 bg-slate-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List */}
        {!loading && !apiError && items.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            No achievements added yet. Click the button above to add one.
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5
                           flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <StarIcon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_COLOR[item.category] || BADGE_COLOR.Other}`}>
                        {item.category}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                    )}
                    {item.date && (
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StarIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>;
}
function TrashIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
}
