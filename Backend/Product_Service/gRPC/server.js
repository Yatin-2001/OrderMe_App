const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const productController = require('../controllers/productControllers');

const packageDef = protoLoader.loadSync(__dirname + '/../proto/product.proto');
const proto = grpc.loadPackageDefinition(packageDef).product;

const server = new grpc.Server();

server.addService(proto.ProductService.service, {
  GetProductById: async (call, callback) => {
    const product = await productController.getProductById(call.request.productId);
    if (!product) return callback(null, {});
    callback(null, {
      id: product._id.toString(),
      name: product.name,
      availableQty: product.availableQty,
      reservedQty: product.reservedQty,
    });
  },
  ReserveInventory: async (call, callback) => {
    const result = await productController.reserveInventory(call.request.productId, call.request.quantity);
    callback(null, { message: result.success ? "Reserved" : "Failed", success: result.success });
  },
  ReleaseInventory: async (call, callback) => {
    const result = await productController.releaseInventory(call.request.productId, call.request.quantity);
    callback(null, { message: result.success ? "Released" : "Failed", success: result.success });
  },
  FinalizeInventory: async (call, callback) => {
    const result = await productController.finalizeInventory(call.request.productId, call.request.quantity);
    callback(null, { message: result.success ? "Finalized" : "Failed", success: result.success });
  },
});

module.exports = server;
