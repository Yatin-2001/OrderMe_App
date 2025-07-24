import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import cors from 'cors';

import notificationRoutes from './routes/notificationRoutes';
import { initSocket } from './socket.js';
import { startNotificationConsumer } from './kafka/consumer';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/notifications', notificationRoutes);

const server = http.createServer(app);
initSocket(server);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
    startNotificationConsumer();
  })
  .catch((err) => console.error('DB connection failed', err));
