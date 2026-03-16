const db = require('../config/db');

const Project = {
  create: async (projectData) => {
    const { title, description, tech_stack, project_owner } = projectData;
    const [result] = await db.execute(
      'INSERT INTO Projects (title, description, tech_stack, project_owner) VALUES (?, ?, ?, ?)',
      [title, description, tech_stack, project_owner]
    );
    // Auto-add owner to members
    await db.execute(
      'INSERT INTO Project_Members (project_id, user_id, role, status) VALUES (?, ?, ?, ?)',
      [result.insertId, project_owner, 'owner', 'active']
    );
    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await db.execute(`
      SELECT p.*, u.name as owner_name 
      FROM Projects p 
      JOIN Users u ON p.project_owner = u.id
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM Projects WHERE id = ?', [id]);
    return rows[0];
  },

  getByOwner: async (userId) => {
    const [rows] = await db.execute('SELECT * FROM Projects WHERE project_owner = ?', [userId]);
    return rows;
  },

  addMemberRequest: async (projectId, userId) => {
    await db.execute(
      'INSERT INTO Project_Members (project_id, user_id, role, status) VALUES (?, ?, ?, ?)',
      [projectId, userId, 'contributor', 'pending']
    );
  },

  updateMemberStatus: async (projectId, userId, status) => {
    await db.execute(
      'UPDATE Project_Members SET status = ? WHERE project_id = ? AND user_id = ?',
      [status, projectId, userId]
    );
  },

  getMembers: async (projectId) => {
    const [rows] = await db.execute(`
      SELECT pm.*, u.name, u.email 
      FROM Project_Members pm 
      JOIN Users u ON pm.user_id = u.id 
      WHERE pm.project_id = ?
    `, [projectId]);
    return rows;
  }
};

module.exports = Project;
