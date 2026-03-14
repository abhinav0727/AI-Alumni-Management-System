const Job = require('../models/Job');

// ALUMNI: Create a new job
exports.createJob = async (req, res) => {
  try {
    const { title, company, description, requiredSkills, location } = req.body;
    
    const job = new Job({
      title,
      company,
      description,
      requiredSkills,
      location,
      postedBy: req.user._id
    });

    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating job', error: error.message });
  }
};

// ALUMNI: Update an existing job
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Find job and ensure it belongs to the requesting alumni
    const job = await Job.findOne({ _id: jobId, postedBy: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    const { title, company, description, requiredSkills, location } = req.body;
    
    if (title) job.title = title;
    if (company) job.company = company;
    if (description) job.description = description;
    if (requiredSkills) job.requiredSkills = requiredSkills;
    if (location) job.location = location;

    await job.save();
    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating job', error: error.message });
  }
};

// ALUMNI: Delete a job
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId, postedBy: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    await job.deleteOne();
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting job', error: error.message });
  }
};

// ALUMNI: Get jobs posted by the logged-in alumni
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving your jobs', error: error.message });
  }
};

// STUDENT: Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving jobs', error: error.message });
  }
};

// STUDENT: Apply to a job
exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check for duplicate application
    const hasApplied = job.applications.some(
      (app) => app.student.toString() === studentId.toString()
    );

    if (hasApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    job.applications.push({
      student: studentId,
      status: 'applied'
    });

    await job.save();
    res.status(200).json({ message: 'Applied to job successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error applying to job', error: error.message });
  }
};

// STUDENT: Get jobs the student has applied to
exports.getMyApplications = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    // Find jobs where the applications array contains the student's ID
    const jobs = await Job.find({ 'applications.student': studentId })
      .populate('postedBy', 'name email');

    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving applications', error: error.message });
  }
};
