const express = require('express');
const router = express.Router();
const { getProjectMessages, getDirectMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/project/:projectId', protect, getProjectMessages);
router.get('/direct/:userId', protect, getDirectMessages);

module.exports = router;
