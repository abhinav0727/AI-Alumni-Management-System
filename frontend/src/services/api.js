import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Student Academic APIs
export const studentApi = {
  getCourses:      (semester) => api.get('/student/courses',        { params: semester ? { semester } : {} }),
  getAttendance:   (semester) => api.get('/student/attendance',     { params: semester ? { semester } : {} }),
  getInternalMarks:(semester) => api.get('/student/internal-marks', { params: semester ? { semester } : {} }),
  getMarks:        (semester) => api.get('/student/marks',          { params: semester ? { semester } : {} }),
  getFees:         ()         => api.get('/student/fees'),
  getTimetable:    (semester) => api.get('/student/timetable',      { params: semester ? { semester } : {} }),
};

// Auth APIs
export const authApi = {
  login:   (data) => api.post('/auth/login', data),
  getMe:   ()     => api.get('/auth/me'),
};

// Profile APIs
export const profileApi = {
  getStudentProfile:    ()     => api.get('/profile/student/me'),
  updateStudentProfile: (data) => api.put('/profile/student/me', data),
  getAlumniProfile:    ()     => api.get('/profile/alumni/me'),
  updateAlumniProfile: (data) => api.put('/profile/alumni/me', data),
};

// Alumni – Jobs APIs (real backend endpoints)
export const alumniApi = {
  getMyJobs:  ()     => api.get('/jobs/my-jobs'),
  createJob:  (data) => api.post('/jobs', data),
  deleteJob:  (id)   => api.delete(`/jobs/${id}`),
};

// Alumni – Achievements APIs
// NOTE: backend field is 'type'; frontend calls it 'category' — mapped here.
export const achievementsApi = {
  getAll:  ()     => api.get('/alumni/achievements'),
  add:     (data) => api.post('/alumni/achievements', {
    title:       data.title,
    description: data.description,
    type:        data.category,   // category → type
    date:        data.date || null,
  }),
  remove:  (id)   => api.delete(`/alumni/achievements/${id}`),
};

// Alumni - Mentorship APIs
export const mentorshipApi = {
  getRequests: () => api.get('/alumni/mentorship'),
  updateStatus: (id, status) => api.put(`/alumni/mentorship/${id}`, { status }),
};

// Student - Mentorship APIs
export const studentMentorshipApi = {
  getRecommendedMentors: () => api.get('/recommend/mentors'),
  getMyRequests: () => api.get('/student/mentorship'),
  createRequest: (data) => api.post('/student/mentorship', data),
};

// Resume APIs
export const resumeApi = {
  getMe: () => api.get('/resume/me'),
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
