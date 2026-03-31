import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import { studentApi } from '../services/api';
import { TableSkeleton, ErrorBox } from './Courses';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const GRADE_COLOR = {
  O:  'bg-emerald-50 text-emerald-700',
  'A+': 'bg-teal-50 text-teal-700',
  A:  'bg-blue-50 text-blue-700',
  'B+': 'bg-violet-50 text-violet-700',
  B:  'bg-purple-50 text-purple-700',
  C:  'bg-amber-50 text-amber-700',
  RA: 'bg-red-50 text-red-700',
  AB: 'bg-slate-100 text-slate-500',
};

function gradeColumns(semester) {
  return [
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
    { key: 'credits', label: 'Credits' },
    {
      key: 'grade',
      label: 'Grade',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${GRADE_COLOR[val] || 'bg-slate-100 text-slate-600'}`}>
          {val}
        </span>
      ),
    },
  ];
}

export default function Grades() {
  const [records, setRecords]   = useState([]);
  const [semester, setSemester] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  function fetchGrades(sem) {
    setLoading(true);
    setError('');
    studentApi.getMarks(sem || undefined)
      .then((res) => setRecords(res.data.marks || []))
      .catch(() => setError('Unable to fetch grades.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchGrades(''); }, []);

  function handleSemesterChange(e) {
    const val = e.target.value;
    setSemester(val);
    fetchGrades(val);
  }

  // derive subjects list from records
  const filteredRecord = records.find((r) => !semester || r.semester === Number(semester));
  const subjects = filteredRecord ? filteredRecord.subjects || [] : records.flatMap((r) => r.subjects || []);

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Grades" subtitle="Semester results and GPA" />

      <div className="flex-1 p-6 space-y-5">

        {/* Filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Semester:</label>
          <select
            id="semester-select-grades"
            value={semester}
            onChange={handleSemesterChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>

        {/* GPA summary cards */}
        {!loading && records.map((rec) => {
          if (semester && rec.semester !== Number(semester)) return null;
          return (
            <div key={rec._id} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <p className="text-xs font-medium text-violet-500 uppercase tracking-wide">Semester {rec.semester}</p>
                <p className="text-2xl font-bold text-violet-800 mt-1">{rec.sgpa ?? '—'}</p>
                <p className="text-xs text-violet-400 mt-0.5">SGPA</p>
              </div>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <p className="text-xs font-medium text-primary-500 uppercase tracking-wide">Cumulative</p>
                <p className="text-2xl font-bold text-primary-800 mt-1">{rec.cgpa ?? '—'}</p>
                <p className="text-xs text-primary-400 mt-0.5">CGPA</p>
              </div>
            </div>
          );
        })}

        {loading && <TableSkeleton rows={5} cols={3} />}
        {error   && <ErrorBox message={error} />}

        {!loading && !error && (
          <Table
            columns={gradeColumns(semester)}
            data={subjects}
            emptyMsg="No grade records found."
          />
        )}
      </div>
    </div>
  );
}
