# CollabHive Backend - Production Ready

Welcome to the CollabHive backend. This is a scalable, modular Node.js/Express application designed for a startup environment.

## Tech Stack
- **Node.js & Express.js**
- **MySQL** (Database)
- **JWT & Bcrypt** (Auth)
- **Socket.io** (Real-time)
- **Multer** (File Uploads)
- **Nodemailer** (Email)

## Folder Structure
```text
backend/
├── config/             # Database configuration
├── controllers/        # Business logic
├── middleware/         # Auth and error handling
├── models/             # Database abstraction
├── routes/             # API endpoints
├── utils/              # Helper functions (email, etc.)
├── uploads/            # Profile image storage
├── .env                # Secret keys (template provided)
├── schema.sql          # MySQL database schema
└── server.js           # Entry point
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup**
   - Create a MySQL database named `collabhive_db`.
   - Run the SQL queries in `schema.sql` to create the tables.

3. **Environment Variables**
   - Update the `.env` file with your database credentials, JWT secret, and email setup.

4. **Run the Server**
   ```bash
   # Development mode (starts server.js)
   node server.js
   ```

## API Documentation Examples

### 1. Authentication
- **POST /api/auth/signup**
  - **Body:** `{ "name": "John Doe", "email": "john@example.com", "password": "password123" }`
  - **Response:** `{ "id": 1, "name": "John Doe", "token": "JWT_TOKEN_HERE" }`

- **POST /api/auth/login**
  - **Body:** `{ "email": "john@example.com", "password": "password123" }`
  - **Response:** `{ "id": 1, "name": "John Doe", "token": "JWT_TOKEN_HERE" }`

### 2. User Profiles
- **GET /api/users/profile**
  - **Header:** `Authorization: Bearer <TOKEN>`
  - **Response:** `{ "id": 1, "name": "John Doe", "skills": "React, Node.js", ... }`

- **PUT /api/users/update-profile** (Form Data)
  - **Fields:** `bio`, `skills`, `github_link`
  - **File:** `profile_image`

### 3. Projects
- **POST /api/projects/create**
  - **Header:** `Authorization: Bearer <TOKEN>`
  - **Body:** `{ "title": "Project X", "description": "Amazing idea", "tech_stack": "React, MySQL" }`

- **POST /api/projects/join**
  - **Body:** `{ "projectId": 1 }`

- **GET /api/projects/user/:userId**
  - **Response:** List of projects owned by this user (Portfolio).

### 4. Chat & Messages
- **GET /api/messages/project/:projectId**
  - **Description:** Get chat history for a project.

- **GET /api/messages/direct/:userId**
  - **Description:** Get direct message history.

### 5. AI Mentor
- **POST /api/ai/mentor**
  - **Body:** `{ "query": "Build a taxi app" }`
  - **Response:** `{ "roadmap": [...], "tech_stack": [...], "database_schema": [...] }`

## Real-time Features
- Connect to the server via Socket.io.
- Join a project room: `socket.emit('joinProject', projectId)`.
- Send message: `socket.emit('sendMessage', { projectId, message, senderId })`.
