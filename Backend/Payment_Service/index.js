require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const paymentRoutes = require('./routes/paymentRoutes');
const { startPaymentConsumers } = require('./kafka/consumers');

const app = express();
app.use(express.json());
app.use('/api/payments', paymentRoutes);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Payment DB');

    startPaymentConsumers();

    app.listen(process.env.PORT, () => {
      console.log(`Payment service running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Payment service:', err.message);
  }
};

startServer();
