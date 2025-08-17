const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();

async function main() {
  await connectDB(process.env.MONGO_URI);
  const app = express();

  const corsConfig = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  };
  app.use(cors(corsConfig));
  app.options('*', cors(corsConfig));
  app.use(express.json());

  app.use((req, _res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
  });

  app.get('/', (_req, res) => res.json({ ok: true }));

  const ridesRouter = require('./routes/rideRoutes');

  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/rides', ridesRouter);
  app.use('/api/bookings', require('./routes/bookingRoutes'));

  const port = process.env.PORT || 5000;
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: corsConfig.origin,
      methods: corsConfig.methods,
      allowedHeaders: corsConfig.allowedHeaders,
      credentials: corsConfig.credentials
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('join', (room) => socket.join(room));
    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
  });

  app.set('io', io);

  server.listen(port, () => console.log(`API + Socket.IO running on :${port}`));
}

if (require.main === module) main();
