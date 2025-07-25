import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import startCqrsConsumers from './kafka/consumers.js';

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to CQRS DB'))
  .catch(err => console.error('CQRS DB Error:', err));

app.use('/users', userRoutes);
app.use('/orders', orderRoutes);

startCqrsConsumers();

const PORT = process.env.PORT || 5009;
app.listen(PORT, () => console.log(`CQRS Read Service running on port ${PORT}`));
