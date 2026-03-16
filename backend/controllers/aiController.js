// In a real startup, this would call an external AI API (e.g., OpenAI or Gemini)
// For this implementation, we'll provide a sophisticated mock response that follows the requirements.

const db = require('../config/db');

exports.getMentorAdvice = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    res.status(400);
    throw new Error('Query is required');
  }

  // Mock AI response logic
  const response = {
    roadmap: [
      'Phase 1: Basic setup and authentication',
      'Phase 2: Core modules and database schema',
      'Phase 3: Real-time features and integrations',
      'Phase 4: Deployment and monitoring'
    ],
    tech_stack: ['Node.js', 'Express', 'MySQL', 'Socket.io', 'JWT'],
    database_schema: [
      'Users(id, name, email, ...)',
      'Projects(id, title, description, ...)',
      'Messages(id, sender_id, ...)'
    ],
    api_architecture: 'RESTful API with modular routes and controllers, leveraging JWT for security.'
  };

  // Save to database
  await db.execute(
    'INSERT INTO AI_Queries (user_id, query, response) VALUES (?, ?, ?)',
    [req.user.id, query, JSON.stringify(response)]
  );

  res.json(response);
};
