const express = require('express');
const router = express.Router();
const { createTeam, getAllTeams, getTeamById } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllTeams);
router.post('/create', protect, createTeam);
router.get('/:id', getTeamById);

module.exports = router;
