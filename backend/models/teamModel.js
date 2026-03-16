const db = require('../config/db');

const Team = {
  create: async (teamName, createdBy) => {
    const [result] = await db.execute(
      'INSERT INTO Teams (team_name, created_by) VALUES (?, ?)',
      [teamName, createdBy]
    );
    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await db.execute('SELECT * FROM Teams');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM Teams WHERE id = ?', [id]);
    return rows[0];
  }
};

module.exports = Team;
