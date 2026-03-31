import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import { studentApi } from '../services/api';
import { TableSkeleton, ErrorBox } from './Courses';

const columns = [
  {
    key: 'courseId',
    label: 'Course',
    render: (val) => (
      <div>
        <p className="font-medium text-slate-700">{val?.courseName || '—'}</p>
        <p className="text-xs text-slate-400">{val?.courseCode}</p>
      </div>
    ),
  },
  { key: 'semester', label: 'Sem' },
  { key: 'totalClasses',    label: 'Total Classes' },
  { key: 'attendedClasses', label: 'Attended' },
  {
    key: 'percentage',
    label: 'Attendance %',
    render: (val) => {
      const pct = parseFloat(val);
      const colour =
        pct >= 75 ? 'text-emerald-700 bg-emerald-50'
        : pct >= 60 ? 'text-amber-700 bg-amber-50'
        : 'text-red-700 bg-red-50';
      return (
        <div className="flex items-center gap-3 min-w-[140px]">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colour}`}>{pct}%</span>
          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      );
    },
  },
];

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    studentApi.getAttendance()
      .then((res) => setRecords(res.data.attendance || []))
      .catch(() => setError('Unable to fetch attendance records.'))
      .finally(() => setLoading(false));
  }, []);

  const overall = records.length
    ? (records.reduce((s, r) => s + parseFloat(r.percentage || 0), 0) / records.length).toFixed(1)
    : null;

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Attendance" subtitle="Your class attendance overview" />

      <div className="flex-1 p-6 space-y-5">

        {/* Summary strip */}
        {!loading && !error && overall !== null && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Overall average:</span>
            <span className={`font-bold text-base ${parseFloat(overall) >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
              {overall}%
            </span>
            {parseFloat(overall) < 75 && (
              <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                Below required 75%
              </span>
            )}
          </div>
        )}

        {loading && <TableSkeleton rows={6} cols={5} />}
        {error   && <ErrorBox message={error} />}

        {!loading && !error && (
          <Table
            columns={columns}
            data={records}
            emptyMsg="No attendance records found."
          />
        )}
      </div>
    </div>
  );
}
