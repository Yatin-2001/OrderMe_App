const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const grpcServer = require('./gRPC/server');
const productRoutes = require('./routes/productRoutes');
const {startProductConsumers} = require('./kafka/consumer');
dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');

  // Start gRPC server
  grpcServer.bindAsync('0.0.0.0:50052', grpcServer.ServerCredentials.createInsecure(), () => {
    grpcServer.start();
    console.log('gRPC Product Service running on port 50052');
  });

  // Start REST API server
  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => {
    console.log(`REST Product API running on port ${PORT}`);
  });

  startProductConsumers();

});
