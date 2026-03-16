const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile, getAllUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'backend/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.get('/profile', protect, getProfile);
router.put('/update-profile', protect, upload.single('profile_image'), updateProfile);
router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
