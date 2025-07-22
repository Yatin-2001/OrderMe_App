const Product = require('../models/products');

// gRPC controllers - to be used by gRPC server to answer queries

exports.getProductById = async (id) => {
    return await Product.findById(id);
};

exports.reserveInventory = async (productId, quantity) => {
    const product = await Product.findById(productId);
    if (!product || product.availableQty < quantity) return { success: false };

    product.availableQty -= quantity;
    product.reservedQty += quantity;
    await product.save();
    return { success: true };
};

exports.releaseInventory = async (productId, quantity) => {
    const product = await Product.findById(productId);
    if (!product || product.reservedQty < quantity) return { success: false };

    product.availableQty += quantity;
    product.reservedQty -= quantity;
    await product.save();
    return { success: true };
};

exports.finalizeInventory = async (productId, quantity) => {
    const product = await Product.findById(productId);
    if (!product || product.reservedQty < quantity) return { success: false };

    product.reservedQty -= quantity;
    await product.save();
    return { success: true };
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
        const { name, description, price, availableQty } = req.body;
        const product = new Product({ name, description, price, availableQty });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, availableQty } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, availableQty },
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
