require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const shipmentRoutes = require('./routes/shipmentRoutes');
const { startShipmentConsumers } = require('./kafka/consumer');

const app = express();
app.use(express.json());
app.use('/api/shipments', shipmentRoutes);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Shipment DB');

    startShipmentConsumers();

    app.listen(process.env.PORT, () => {
      console.log(`Shipment service running on port ${process.env.PORT}`);
    });

  } catch (err) {
    console.error('Failed to start Shipment service:', err.message);
    
  }
};

startServer();
