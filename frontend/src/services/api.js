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
};

export default api;
