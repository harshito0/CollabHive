const User = require('../models/userModel');

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    const profileData = {
      name: req.body.name || user.name,
      bio: req.body.bio || user.bio,
      skills: req.body.skills || user.skills,
      github_link: req.body.github_link || user.github_link,
      linkedin_link: req.body.linkedin_link || user.linkedin_link,
      profile_image: req.file ? req.file.filename : user.profile_image,
    };

    await User.updateProfile(req.user.id, profileData);
    res.json({ success: true, message: 'Profile updated' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

exports.getAllUsers = async (req, res) => {
  const users = await User.getAll();
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};
