import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import { studentApi } from '../services/api';
import { TableSkeleton, ErrorBox } from './Courses';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

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
  {
    key: 'marksObtained',
    label: 'Marks Obtained',
    render: (val) => <span className="font-semibold text-slate-800">{val}</span>,
  },
  { key: 'maxMarks', label: 'Max Marks' },
  {
    key: 'marksObtained',
    label: 'Score %',
    render: (val, row) => {
      const pct = row.maxMarks ? ((val / row.maxMarks) * 100).toFixed(1) : 0;
      const colour = pct >= 75 ? 'text-emerald-700' : pct >= 50 ? 'text-amber-700' : 'text-red-600';
      return <span className={`text-xs font-semibold ${colour}`}>{pct}%</span>;
    },
  },
];

export default function InternalMarks() {
  const [records, setRecords]       = useState([]);
  const [semester, setSemester]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  function fetchMarks(sem) {
    setLoading(true);
    setError('');
    studentApi.getInternalMarks(sem || undefined)
      .then((res) => setRecords(res.data.internalMarks || []))
      .catch(() => setError('Unable to fetch internal marks.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchMarks(''); }, []);

  function handleSemesterChange(e) {
    const val = e.target.value;
    setSemester(val);
    fetchMarks(val);
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Internal Marks" subtitle="Assessment marks per course" />

      <div className="flex-1 p-6 space-y-5">

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Semester:</label>
          <select
            id="semester-select-internal"
            value={semester}
            onChange={handleSemesterChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
          {semester && (
            <span className="text-xs text-slate-400">
              Showing {records.length} record{records.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading && <TableSkeleton rows={5} cols={5} />}
        {error   && <ErrorBox message={error} />}

        {!loading && !error && (
          <Table
            columns={columns}
            data={records}
            emptyMsg="No internal marks found for the selected semester."
          />
        )}
      </div>
    </div>
  );
}
