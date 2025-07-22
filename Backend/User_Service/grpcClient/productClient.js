const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.resolve(__dirname, '/../../Product_Service/Proto/product.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const productProto = grpc.loadPackageDefinition(packageDefinition).product;

const client = new productProto.ProductService(
  process.env.PRODUCT_SERVICE_gRPC_URL, 
  grpc.credentials.createInsecure()
);

module.exports = client;
