const db = require('../config/db');

const User = {
  create: async (name, email, password) => {
    const [result] = await db.execute(
      'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.execute('SELECT id, name, email, bio, skills, github_link, linkedin_link, profile_image, role FROM Users WHERE id = ?', [id]);
    return rows[0];
  },

  updateProfile: async (id, profileData) => {
    const { name, bio, skills, github_link, linkedin_link, profile_image } = profileData;
    await db.execute(
      'UPDATE Users SET name = ?, bio = ?, skills = ?, github_link = ?, linkedin_link = ?, profile_image = ? WHERE id = ?',
      [name, bio, skills, github_link, linkedin_link, profile_image, id]
    );
  },

  getAll: async () => {
    const [rows] = await db.execute('SELECT id, name, bio, skills, profile_image FROM Users');
    return rows;
  },

  saveResetToken: async (userId, token, expiry) => {
    await db.execute(
      'INSERT INTO Password_Reset (user_id, token, expiry) VALUES (?, ?, ?)',
      [userId, token, expiry]
    );
  },

  findResetToken: async (token) => {
    const [rows] = await db.execute('SELECT * FROM Password_Reset WHERE token = ? AND expiry > NOW()', [token]);
    return rows[0];
  },

  updatePassword: async (userId, hashedPassword) => {
    await db.execute('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    await db.execute('DELETE FROM Password_Reset WHERE user_id = ?', [userId]);
  }
};

module.exports = User;
