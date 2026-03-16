const express = require('express');
const router = express.Router();
const { getMentorAdvice } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/mentor', protect, getMentorAdvice);

module.exports = router;
