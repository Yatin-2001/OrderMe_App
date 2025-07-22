const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const orderRoutes = require('./routes/order.routes');
const { startOrderConsumers } = require('./kafka/consumers');
const refundWatcher = require('./utils/refundWatcher');

dotenv.config();

const app = express();
app.use(express.json());

// Base route
app.use('/api/orders', orderRoutes);

// Start server
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orders';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB for Order Service');

  app.listen(PORT, () => {
    console.log(`🚀 Order Service running on port ${PORT}`);

    // Start Kafka consumers
    startOrderConsumers();

    // Start refund watcher loop
    refundWatcher();
  });

}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
});
