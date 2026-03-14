const express = require('express');
const { 
  createJob, 
  updateJob, 
  deleteJob, 
  getMyJobs, 
  getAllJobs, 
  applyToJob, 
  getMyApplications 
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

const router = express.Router();

// --- ALUMNI ROUTES ---
router.post('/', protect, roleMiddleware('alumni'), createJob);
router.put('/:jobId', protect, roleMiddleware('alumni'), updateJob);
router.delete('/:jobId', protect, roleMiddleware('alumni'), deleteJob);
router.get('/my-jobs', protect, roleMiddleware('alumni'), getMyJobs);

// --- STUDENT ROUTES ---
router.get('/', protect, roleMiddleware('student'), getAllJobs);
router.post('/apply/:jobId', protect, roleMiddleware('student'), applyToJob);
router.get('/my-applications', protect, roleMiddleware('student'), getMyApplications);

module.exports = router;
