const express = require('express');
const router = express.Router();
const { protect, roleMiddleware } = require('../middleware/authMiddleware');
const { roleMiddleware: roleCheck } = require('../middleware/roleMiddleware');
const lifecycleController = require('../controllers/lifecycleController');

// Only admin can access lifecycle endpoints
router.get('/students', protect, roleCheck('admin'), lifecycleController.getStudents);
router.post('/graduate/preview', protect, roleCheck('admin'), lifecycleController.graduatePreview);
router.post('/graduate/confirm', protect, roleCheck('admin'), lifecycleController.graduateConfirm);
router.post('/graduate/:userId', protect, roleCheck('admin'), lifecycleController.graduateSingle);
router.post('/revert/:userId', protect, roleCheck('admin'), lifecycleController.revertGraduation);

module.exports = router;
