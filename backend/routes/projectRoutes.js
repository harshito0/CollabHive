const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, joinProject, getProjectMembers, approveMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllProjects);
router.post('/create', protect, createProject);
router.post('/join', protect, joinProject);
router.get('/:id/members', getProjectMembers);
router.get('/user/:userId', getUserProjects);
router.post('/approve', protect, approveMember);

module.exports = router;
