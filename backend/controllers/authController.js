const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findByEmail(email);

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await User.create(name, email, hashedPassword);

  res.status(201).json({
    id: userId,
    name,
    email,
    token: generateToken(userId),
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findByEmail(email);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  await User.saveResetToken(user.id, resetToken, expiry);

  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });
    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.error(err);
    res.status(500);
    throw new Error('Email could not be sent');
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const resetInfo = await User.findResetToken(token);
  if (!resetInfo) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updatePassword(resetInfo.user_id, hashedPassword);

  res.status(200).json({ success: true, message: 'Password reset successful' });
};
