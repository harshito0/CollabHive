const db = require('../config/db');

const Message = {
  save: async (senderId, receiverId, projectId, message) => {
    const [result] = await db.execute(
      'INSERT INTO Messages (sender_id, receiver_id, project_id, message) VALUES (?, ?, ?, ?)',
      [senderId, receiverId || null, projectId || null, message]
    );
    return result.insertId;
  },

  getProjectMessages: async (projectId) => {
    const [rows] = await db.execute(
      `SELECT m.*, u.name as sender_name 
       FROM Messages m 
       JOIN Users u ON m.sender_id = u.id 
       WHERE m.project_id = ? 
       ORDER BY m.timestamp ASC`,
      [projectId]
    );
    return rows;
  },

  getChatHistory: async (user1, user2) => {
    const [rows] = await db.execute(
      `SELECT * FROM Messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY timestamp ASC`,
      [user1, user2, user2, user1]
    );
    return rows;
  }
};

module.exports = Message;
