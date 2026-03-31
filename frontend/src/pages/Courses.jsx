import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import { studentApi } from '../services/api';

const columns = [
  { key: 'courseCode', label: 'Code' },
  { key: 'courseName', label: 'Course Name' },
  { key: 'department', label: 'Department' },
  { key: 'semester',   label: 'Sem' },
  {
    key: 'credits',
    label: 'Credits',
    render: (val) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
        {val} cr
      </span>
    ),
  },
  {
    key: 'faculty',
    label: 'Faculty',
    render: (val) => val?.name || '—',
  },
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    studentApi.getCourses()
      .then((res) => setCourses(res.data.courses || []))
      .catch(() => setError('Unable to fetch courses.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Courses" subtitle="Your enrolled courses this semester" />

      <div className="flex-1 p-6 space-y-5">

        {/* Count badge */}
        {!loading && !error && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{courses.length}</span> course{courses.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {loading && <TableSkeleton rows={5} cols={6} />}

        {error && <ErrorBox message={error} />}

        {!loading && !error && (
          <Table
            columns={columns}
            data={courses}
            emptyMsg="No courses found for your department and semester."
          />
        )}
      </div>
    </div>
  );
}

/* ── Shared skeleton & error helpers ──────────────────────── */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="bg-slate-50 px-5 py-3.5 flex gap-8">
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded flex-1" />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="border-t border-slate-100 px-5 py-3.5 flex gap-8">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-3 bg-slate-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ErrorBox({ message }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
      {message}
    </div>
  );
}
