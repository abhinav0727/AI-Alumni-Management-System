import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import { studentApi } from '../services/api';
import { TableSkeleton, ErrorBox } from './Courses';

const STATUS_BADGE = {
  paid:    <span className="badge-paid">Paid</span>,
  pending: <span className="badge-pending">Pending</span>,
  partial: <span className="badge-partial">Partial</span>,
};

const columns = [
  { key: 'semester', label: 'Semester', render: (v) => `Semester ${v}` },
  {
    key: 'totalAmount',
    label: 'Total Amount',
    render: (v) => `₹ ${Number(v).toLocaleString('en-IN')}`,
  },
  {
    key: 'paidAmount',
    label: 'Paid Amount',
    render: (v) => `₹ ${Number(v).toLocaleString('en-IN')}`,
  },
  {
    key: 'totalAmount',
    label: 'Balance',
    render: (v, row) => {
      const bal = v - row.paidAmount;
      return <span className={bal > 0 ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>
        ₹ {Number(bal).toLocaleString('en-IN')}
      </span>;
    },
  },
  {
    key:    'status',
    label:  'Status',
    render: (v) => STATUS_BADGE[v] || <span className="text-slate-400 text-xs">{v}</span>,
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  },
];

export default function Fees() {
  const [fees, setFees]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    studentApi.getFees()
      .then((res) => setFees(res.data.fees || []))
      .catch(() => setError('Unable to fetch fee records.'))
      .finally(() => setLoading(false));
  }, []);

  const totalDue = fees.reduce((s, f) => s + (f.totalAmount - f.paidAmount), 0);

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Fees" subtitle="Your tuition fee statement" />

      <div className="flex-1 p-6 space-y-5">

        {/* Summary */}
        {!loading && !error && fees.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Paid</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                ₹ {fees.reduce((s, f) => s + f.paidAmount, 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Fee</p>
              <p className="text-xl font-bold text-slate-700 mt-1">
                ₹ {fees.reduce((s, f) => s + f.totalAmount, 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className={`border rounded-xl p-4 shadow-sm ${totalDue > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {totalDue > 0 ? 'Balance Due' : 'Fully Paid'}
              </p>
              <p className={`text-xl font-bold mt-1 ${totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ₹ {totalDue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        {loading && <TableSkeleton rows={4} cols={6} />}
        {error   && <ErrorBox message={error} />}

        {!loading && !error && (
          <Table columns={columns} data={fees} emptyMsg="No fee records found." />
        )}
      </div>
    </div>
  );
}
