const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const billingRoutes = require('./routes/billingRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Base route
app.use('/api/billing', billingRoutes);

// Start server
const PORT = process.env.PORT || 5015;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/billing';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB for Billing Service');

  app.listen(PORT, () => {
    console.log(`🚀 Billing Service running on port ${PORT}`);
  });

}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
});
