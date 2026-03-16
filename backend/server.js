const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const Message = require('./models/messageModel');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinProject', (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`User joined project: ${projectId}`);
  });

  socket.on('sendMessage', async (data) => {
    // data: { projectId, senderId, receiverId, message }
    try {
      await Message.save(data.senderId, data.receiverId, data.projectId, data.message);
      io.to(`project_${data.projectId}`).emit('message', data);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('CollabHive API is running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
