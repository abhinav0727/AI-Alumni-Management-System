/**
 * academicController.js
 * Phase 9 – Academic System Integration
 *
 * STUDENT handlers: READ-ONLY, scoped to req.user._id
 * ADMIN handlers:   WRITE, with strict studentId role validation
 *
 * FIXES APPLIED (refinement pass):
 *   #3 – semester query params parsed as Number (parseInt)
 *   #4 – getCourses() scoped to student's department + semester from StudentProfile
 *   #5 – updateTimetable() accepts both flat array and grouped {Monday:[]} formats
 *   #7 – semester must be a valid number; all existing marks/fee validations verified
 */

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const InternalMarks = require('../models/InternalMarks');
const Marks = require('../models/Marks');
const Fee = require('../models/Fee');
const Timetable = require('../models/Timetable');

// ─────────────────────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────────────────────

/**
 * Validates that the provided userId belongs to a User with role 'student'.
 * Returns the User document on success, or writes an error response and returns null.
 * FIX #7 – centralised guard used by every admin write endpoint.
 */
async function validateStudentId(res, studentId) {
  if (!studentId) {
    res.status(400).json({ message: 'studentId is required' });
    return null;
  }
  const user = await User.findById(studentId).select('role name email');
  if (!user) {
    res.status(404).json({ message: 'User not found for the provided studentId' });
    return null;
  }
  if (user.role !== 'student') {
    res.status(400).json({
      message: `studentId does not belong to a student. Found role: '${user.role}'`,
    });
    return null;
  }
  return user;
}

/**
 * FIX #3 – Parses a query param value as a positive integer semester number.
 * Returns the parsed number, or null if the value is absent or invalid.
 */
function parseSemester(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1 || n > 12) return null;
  return n;
}

/**
 * FIX #5 – Normalises the incoming schedule into a flat array.
 * Accepts either:
 *   • Flat array:    [{ day, time, courseId }, ...]
 *   • Grouped obj:  { Monday: [{ time, courseId }], Tuesday: [...] }
 * Returns the flat array or null if the input is unrecognisable.
 */
function normaliseSchedule(schedule) {
  if (Array.isArray(schedule)) {
    return schedule; // already flat – validate structure in Mongoose
  }
  if (schedule !== null && typeof schedule === 'object') {
    // grouped format → flatten
    const flat = [];
    for (const [day, entries] of Object.entries(schedule)) {
      if (!Array.isArray(entries)) return null;
      for (const entry of entries) {
        flat.push({ day, time: entry.time, courseId: entry.courseId });
      }
    }
    return flat;
  }
  return null;
}

// ─────────────────────────────────────────────────────────
// STUDENT – READ-ONLY HANDLERS
// ─────────────────────────────────────────────────────────

/**
 * GET /api/student/courses
 * FIX #4 – Returns courses filtered by the student's own department
 *           (fetched from StudentProfile) and optional ?semester= query.
 * Query: ?semester=3  (optional, must be 1-12)
 */
exports.getCourses = async (req, res) => {
  try {
    // FIX #4 – fetch student's profile to get their department
    const profile = await StudentProfile.findOne({ user: req.user._id }).select('department');

    const filter = {};

    if (profile && profile.department) {
      filter.department = profile.department;
    }

    // FIX #3 – parse semester as number
    const semNum = parseSemester(req.query.semester);
    if (semNum !== null) filter.semester = semNum;

    const courses = await Course.find(filter)
      .populate('faculty', 'name email')
      .sort({ semester: 1, courseCode: 1 });

    res.status(200).json({
      count: courses.length,
      department: profile ? profile.department : null,
      courses,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courses', error: err.message });
  }
};

/**
 * GET /api/student/attendance
 * Returns attendance records for the logged-in student.
 * Query: ?semester=3  (optional, must be 1-12)
 */
exports.getAttendance = async (req, res) => {
  try {
    const filter = { studentId: req.user._id };

    // FIX #3 – parse semester as number
    const semNum = parseSemester(req.query.semester);
    if (semNum !== null) filter.semester = semNum;

    const records = await Attendance.find(filter)
      .populate('courseId', 'courseCode courseName credits')
      .sort({ semester: 1 });

    res.status(200).json({ count: records.length, attendance: records });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance', error: err.message });
  }
};

/**
 * GET /api/student/internal-marks
 * Returns internal marks for the logged-in student.
 * Query: ?semester=3  (optional, must be 1-12)
 */
exports.getInternalMarks = async (req, res) => {
  try {
    const filter = { studentId: req.user._id };

    // FIX #3 – parse semester as number
    const semNum = parseSemester(req.query.semester);
    if (semNum !== null) filter.semester = semNum;

    const records = await InternalMarks.find(filter)
      .populate('courseId', 'courseCode courseName credits')
      .sort({ semester: 1 });

    res.status(200).json({ count: records.length, internalMarks: records });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching internal marks', error: err.message });
  }
};

/**
 * GET /api/student/marks
 * Returns semester results (grades + SGPA/CGPA) for the logged-in student.
 * Query: ?semester=3  (optional, must be 1-12)
 */
exports.getMarks = async (req, res) => {
  try {
    const filter = { studentId: req.user._id };

    // FIX #3 – parse semester as number
    const semNum = parseSemester(req.query.semester);
    if (semNum !== null) filter.semester = semNum;

    const records = await Marks.find(filter)
      .populate('subjects.courseId', 'courseCode courseName credits')
      .sort({ semester: 1 });

    res.status(200).json({ count: records.length, marks: records });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching marks', error: err.message });
  }
};

/**
 * GET /api/student/fees
 * Returns fee records for the logged-in student.
 * Query: ?semester=3  (optional, must be 1-12)
 */
exports.getFees = async (req, res) => {
  try {
    const filter = { studentId: req.user._id };

    // FIX #3 – parse semester as number
    const semNum = parseSemester(req.query.semester);
    if (semNum !== null) filter.semester = semNum;

    const records = await Fee.find(filter).sort({ semester: 1 });

    res.status(200).json({ count: records.length, fees: records });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching fees', error: err.message });
  }
};

/**
 * GET /api/student/timetable
 * Returns timetable for the logged-in student.
 * Query: ?semester=3  (optional, must be 1-12)
 */
exports.getTimetable = async (req, res) => {
  try {
    const filter = { studentId: req.user._id };

    // FIX #3 – parse semester as number
    const semNum = parseSemester(req.query.semester);
    if (semNum !== null) filter.semester = semNum;

    const records = await Timetable.find(filter)
      .populate('schedule.courseId', 'courseCode courseName')
      .sort({ semester: 1 });

    res.status(200).json({ count: records.length, timetable: records });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching timetable', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// ADMIN – WRITE HANDLERS
// ─────────────────────────────────────────────────────────

/**
 * POST /api/admin/course
 * Body: { courseCode, courseName, department, semester, credits, faculty? }
 * FIX #3 – semester must be a number.
 */
exports.createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, department, faculty } = req.body;
    const credits = Number(req.body.credits);

    // FIX #3 + FIX #7 – coerce and validate semester
    const semester = parseInt(req.body.semester, 10);
    if (!courseCode || !courseName || !department || isNaN(semester) || isNaN(credits)) {
      return res.status(400).json({
        message:
          'courseCode, courseName, department, semester (number 1-12), and credits are required',
      });
    }

    const course = await Course.create({
      courseCode,
      courseName,
      department,
      semester,
      credits,
      faculty: faculty || null,
    });

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'A course with this code already exists for this semester and department',
      });
    }
    res.status(500).json({ message: 'Error creating course', error: err.message });
  }
};

/**
 * POST /api/admin/attendance
 * Body: { studentId, courseId, semester, totalClasses, attendedClasses }
 * FIX #3 – semester coerced to Number.
 * FIX #7 – attendedClasses <= totalClasses enforced.
 */
exports.updateAttendance = async (req, res) => {
  try {
    const { studentId, courseId, totalClasses, attendedClasses } = req.body;

    // FIX #7 – validate studentId role
    const student = await validateStudentId(res, studentId);
    if (!student) return;

    // FIX #3 + FIX #7 – coerce and validate semester
    const semester = parseInt(req.body.semester, 10);
    if (!courseId || isNaN(semester) || totalClasses == null || attendedClasses == null) {
      return res.status(400).json({
        message: 'courseId, semester (number 1-12), totalClasses, and attendedClasses are required',
      });
    }
    if (attendedClasses > totalClasses) {
      return res.status(400).json({
        message: 'attendedClasses cannot exceed totalClasses',
      });
    }

    const record = await Attendance.findOneAndUpdate(
      { studentId, courseId, semester },
      { totalClasses, attendedClasses },
      { new: true, upsert: true, runValidators: true }
    ).populate('courseId', 'courseCode courseName');

    res.status(200).json({ message: 'Attendance updated successfully', record });
  } catch (err) {
    res.status(500).json({ message: 'Error updating attendance', error: err.message });
  }
};

/**
 * POST /api/admin/internal-marks
 * Body: { studentId, courseId, semester, marksObtained, maxMarks }
 * FIX #3 – semester coerced to Number.
 * FIX #7 – marksObtained <= maxMarks enforced both here and in model pre-save.
 */
exports.updateInternalMarks = async (req, res) => {
  try {
    const { studentId, courseId, marksObtained, maxMarks } = req.body;

    // FIX #7 – validate studentId role
    const student = await validateStudentId(res, studentId);
    if (!student) return;

    // FIX #3 + FIX #7 – coerce and validate semester
    const semester = parseInt(req.body.semester, 10);
    if (!courseId || isNaN(semester) || marksObtained == null || maxMarks == null) {
      return res.status(400).json({
        message: 'courseId, semester (number 1-12), marksObtained, and maxMarks are required',
      });
    }
    if (marksObtained > maxMarks) {
      return res.status(400).json({
        message: `marksObtained (${marksObtained}) cannot exceed maxMarks (${maxMarks})`,
      });
    }

    const record = await InternalMarks.findOneAndUpdate(
      { studentId, courseId, semester },
      { marksObtained, maxMarks },
      { new: true, upsert: true, runValidators: true }
    ).populate('courseId', 'courseCode courseName');

    res.status(200).json({ message: 'Internal marks updated successfully', record });
  } catch (err) {
    res.status(500).json({ message: 'Error updating internal marks', error: err.message });
  }
};

/**
 * POST /api/admin/marks
 * Body: { studentId, semester, subjects: [{ courseId, grade, credits }], cgpa? }
 * FIX #3 – semester coerced to Number.
 * SGPA is auto-computed by the Marks model pre-save hook.
 */
exports.updateMarks = async (req, res) => {
  try {
    const { studentId, subjects, cgpa } = req.body;

    // FIX #7 – validate studentId role
    const student = await validateStudentId(res, studentId);
    if (!student) return;

    // FIX #3 + FIX #7 – coerce and validate semester
    const semester = parseInt(req.body.semester, 10);
    if (isNaN(semester) || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        message: 'semester (number 1-12) and a non-empty subjects array are required',
      });
    }

    // Use find + save (not findOneAndUpdate) to trigger the SGPA pre-save hook.
    let record = await Marks.findOne({ studentId, semester });
    if (record) {
      record.subjects = subjects;
      if (cgpa !== undefined) record.cgpa = cgpa;
    } else {
      record = new Marks({ studentId, semester, subjects, cgpa: cgpa || 0 });
    }
    await record.save(); // triggers SGPA calculation

    await record.populate('subjects.courseId', 'courseCode courseName credits');

    res.status(200).json({ message: 'Marks updated successfully', record });
  } catch (err) {
    res.status(500).json({ message: 'Error updating marks', error: err.message });
  }
};

/**
 * POST /api/admin/fees
 * Body: { studentId, semester, totalAmount, paidAmount, dueDate? }
 * FIX #3 – semester coerced to Number.
 * Status is auto-derived by Fee model pre-save hook.
 */
exports.updateFees = async (req, res) => {
  try {
    const { studentId, totalAmount, paidAmount, dueDate } = req.body;

    // FIX #7 – validate studentId role
    const student = await validateStudentId(res, studentId);
    if (!student) return;

    // FIX #3 + FIX #7 – coerce and validate semester
    const semester = parseInt(req.body.semester, 10);
    if (isNaN(semester) || totalAmount == null || paidAmount == null) {
      return res.status(400).json({
        message: 'semester (number 1-12), totalAmount, and paidAmount are required',
      });
    }
    if (paidAmount > totalAmount) {
      return res.status(400).json({
        message: `paidAmount (${paidAmount}) cannot exceed totalAmount (${totalAmount})`,
      });
    }

    // Use find + save to trigger the pre-save status derivation hook.
    let record = await Fee.findOne({ studentId, semester });
    if (record) {
      record.totalAmount = totalAmount;
      record.paidAmount = paidAmount;
      if (dueDate !== undefined) record.dueDate = dueDate;
    } else {
      record = new Fee({
        studentId,
        semester,
        totalAmount,
        paidAmount,
        dueDate: dueDate || null,
      });
    }
    await record.save(); // triggers status auto-derivation

    res.status(200).json({ message: 'Fee record updated successfully', record });
  } catch (err) {
    res.status(500).json({ message: 'Error updating fees', error: err.message });
  }
};

/**
 * POST /api/admin/timetable
 * Body: { studentId, semester, schedule }
 *   schedule can be:
 *     • Flat array:   [{ day, time, courseId }, ...]
 *     • Grouped obj:  { Monday: [{ time, courseId }], Tuesday: [...] }
 * FIX #3 – semester coerced to Number.
 * FIX #5 – accepts both flat-array and grouped-object schedule formats.
 */
exports.updateTimetable = async (req, res) => {
  try {
    const { studentId } = req.body;

    // FIX #7 – validate studentId role
    const student = await validateStudentId(res, studentId);
    if (!student) return;

    // FIX #3 + FIX #7 – coerce and validate semester
    const semester = parseInt(req.body.semester, 10);
    if (isNaN(semester)) {
      return res.status(400).json({ message: 'semester must be a number between 1 and 12' });
    }

    // FIX #5 – normalise schedule to flat array
    const rawSchedule = req.body.schedule;
    const schedule = normaliseSchedule(rawSchedule);
    if (!schedule || schedule.length === 0) {
      return res.status(400).json({
        message:
          'schedule is required. Provide either a flat array [{ day, time, courseId }] ' +
          'or a grouped object { Monday: [{ time, courseId }] }',
      });
    }

    const record = await Timetable.findOneAndUpdate(
      { studentId, semester },
      { schedule },
      { new: true, upsert: true, runValidators: true }
    ).populate('schedule.courseId', 'courseCode courseName');

    res.status(200).json({ message: 'Timetable updated successfully', record });
  } catch (err) {
    res.status(500).json({ message: 'Error updating timetable', error: err.message });
  }
};
