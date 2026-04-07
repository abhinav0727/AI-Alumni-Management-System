const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const profileRoutes = require('./routes/profileRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const lifecycleRoutes = require('./routes/lifecycleRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const jobRoutes = require('./routes/jobRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
// Phase 9 – Academic System (FIX #1: renamed studentAcademicRoutes → studentRoutes)
const studentRoutes = require('./routes/studentRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config({ path: './config/.env' });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/lifecycle', lifecycleRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/recommend', recommendRoutes);
// Phase 9 – Academic System (FIX #2: single, verified mount point)
app.use('/api/student', studentRoutes);

// Not found and error handler middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
