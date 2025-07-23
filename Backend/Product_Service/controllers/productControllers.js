const Product = require('../models/products');
const Inventory = require('../models/inventory');
const { sendEvent } = require('../kafka/producer');
const {findNearestWarehouseWithStock} = require('../utils/productUtils');

// gRPC controllers - to be used by gRPC server to answer queries
exports.getProductById = async (id) => {
    
    var prod = await Product.findOne({_id: id});
    var inv = await Inventory.find({productId: id});

    var availableQty = inv.reduce((qty, item) => (qty + item.quantity), 0);
    var reservedQty = inv.reduce((qty, item) => (qty + item.reserved), 0);

    var product = {};

    product.id = id;
    product.name = prod.name;
    product.availableQty = availableQty;
    product.reservedQty = reservedQty;


    return product;

};

// Kafka consumer controllers...
exports.reserveInventory = async (data) => {

    const warehouse = findNearestWarehouseWithStock(data.items, data.address.coordinates);

    if(warehouse !== null){
        // There is a warehouse with all the inventory...
        for (const item of data.items) {
            var invId = warehouse.stock.find((stockItm) => stockItm.productId == item.productId);

            await Inventory.findByIdAndUpdate(
                invId._id,
                {
                  $inc: {
                    reserved: item.quantity,
                  },
                  $dec: {
                    quantity: item.quantity,
                  }
                },
            );

        }


        // Initiate SAGA for add Paymment
        await sendEvent('update-payment', {
            orderId: data.orderId,
            userId: data.userId,
            amount: data.amount,
            paymentMethod: data.paymentMethod
        })

        await sendEvent('inventory-reserved', { orderId: data.orderId, warehouseId: warehouse.warehouse });

    } else {
        await sendEvent('inventory-failed', { orderId: data.orderId });

    }

};

exports.releaseInventory = async (data) => {

    try{
        for (const item of data.items) {
            const inv = await Inventory.find({productId: item.productId, warehouseId: data.warehouseId});
            if (inv) {
                inv.quantity += item.quantity;
                inv.reserved -= item.quantity
                await inv.save();
            }
        }

        console.log("Inventory released successfully for cancelled order!!!");
    
    } catch(err) {
        console.log(`Inventory release failed for cancelled order: ${data.orderId}.\nReason: ${err}`);

    }

};


/////////////////////////////////////////////////////////////////

// REST APIs for Admin tasks;

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getProductByIdREST = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.createProduct = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const product = new Product({ name, description, price });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
