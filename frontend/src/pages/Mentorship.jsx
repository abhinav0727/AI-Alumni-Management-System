import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Table  from '../components/Table';
import { mentorshipApi } from '../services/api';

const STATUS_FILTER = ['all', 'pending', 'accepted', 'rejected'];

const STATUS_BADGE = {
  pending:  <span className="badge-pending">Pending</span>,
  accepted: <span className="badge-paid">Accepted</span>,
  rejected: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">Rejected</span>,
};

export default function Mentorship() {
  const [requests, setRequests] = useState([]);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const res = await mentorshipApi.getRequests();
      const normalized = res.data.map((r) => ({
        ...r,
        studentName: r.student?.name || 'Unknown',
        department: r.student?.department || 'N/A',
        requestedAt: r.createdAt,
      }));
      setRequests(normalized);
    } catch (err) {
      console.error('Failed to load mentorship requests', err);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await mentorshipApi.updateStatus(id, newStatus);
      setRequests((prev) =>
        prev.map((r) => r._id === id ? { ...r, status: newStatus } : r)
      );
    } catch (err) {
      console.error('Failed to update status', err);
      // Optional: Handle error display gracefully
    }
  }

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const pendingCount  = requests.filter((r) => r.status === 'pending').length;
  const acceptedCount = requests.filter((r) => r.status === 'accepted').length;

  const columns = [
    { key: 'studentName', label: 'Student' },
    { key: 'department',  label: 'Department' },
    { key: 'topic',       label: 'Topic' },
    {
      key: 'requestedAt',
      label: 'Date',
      render: (v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => STATUS_BADGE[v] || v,
    },
    {
      key: '_id',
      label: 'Actions',
      render: (id, row) =>
        row.status === 'pending' ? (
          <div className="flex gap-2">
            <button
              onClick={() => updateStatus(id, 'accepted')}
              className="px-3 py-1 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600
                         rounded-lg transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => updateStatus(id, 'rejected')}
              className="px-3 py-1 text-xs font-semibold text-white bg-red-400 hover:bg-red-500
                         rounded-lg transition-colors"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">—</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Mentorship" subtitle="Manage student mentorship requests" />

      <div className="flex-1 p-6 space-y-5">

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Accepted</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{acceptedCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-slate-700 mt-1">{requests.length}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTER.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${filter === f
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  ({requests.filter((r) => r.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filtered}
          emptyMsg="No mentorship requests found."
        />
      </div>
    </div>
  );
}
