import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { studentApi } from '../services/api';
import { ErrorBox } from './Courses';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const DAY_COLOR = {
  Monday:    'bg-blue-500',
  Tuesday:   'bg-violet-500',
  Wednesday: 'bg-emerald-500',
  Thursday:  'bg-amber-500',
  Friday:    'bg-rose-500',
  Saturday:  'bg-cyan-500',
};

export default function Timetable() {
  const [records, setRecords]   = useState([]);
  const [semester, setSemester] = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  function fetchTimetable(sem) {
    setLoading(true);
    setError('');
    studentApi.getTimetable(sem || undefined)
      .then((res) => setRecords(res.data.timetable || []))
      .catch(() => setError('Unable to fetch timetable.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchTimetable(''); }, []);

  function handleSemesterChange(e) {
    const val = e.target.value;
    setSemester(val);
    fetchTimetable(val);
  }

  // Build lookup: day → sorted class entries
  const tt = records[0]; // one timetable record per semester
  const schedule = tt?.schedule || [];

  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = schedule
      .filter((s) => s.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {});

  const hasAny = schedule.length > 0;

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Timetable" subtitle="Your weekly class schedule" />

      <div className="flex-1 p-6 space-y-5">

        {/* Semester filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Semester:</label>
          <select
            id="semester-select-timetable"
            value={semester}
            onChange={handleSemesterChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">Current Semester</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-pulse">
            {DAYS.map((d) => (
              <div key={d} className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-2/3 mx-auto" />
                {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded" />)}
              </div>
            ))}
          </div>
        )}

        {error && <ErrorBox message={error} />}

        {!loading && !error && !hasAny && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            No timetable found for this semester.
          </div>
        )}

        {!loading && !error && hasAny && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DAYS.map((day) => (
              <div key={day} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Day header */}
                <div className={`${DAY_COLOR[day]} px-3 py-2 text-center`}>
                  <p className="text-white text-xs font-semibold tracking-wide">{day.slice(0, 3).toUpperCase()}</p>
                </div>

                <div className="p-2 space-y-2 min-h-[80px]">
                  {byDay[day].length === 0 ? (
                    <p className="text-center text-xs text-slate-300 py-4">—</p>
                  ) : (
                    byDay[day].map((entry, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                        <p className="text-xs font-semibold text-slate-700 leading-tight">
                          {entry.courseId?.courseCode || entry.courseId?.courseName || 'Course'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-tight">{entry.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
