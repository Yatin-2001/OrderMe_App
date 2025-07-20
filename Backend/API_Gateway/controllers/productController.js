const { forwardRequest } = require('../utils/httpClient');
const baseURL = process.env.PRODUCT_SERVICE_URL;

exports.getAllProducts = async (req, res) => {
  try {
    const data = await forwardRequest('get', `${baseURL}/`);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getProductById = async (req, res) => {
  try {
    const data = await forwardRequest('get', `${baseURL}/${req.params.id}`);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = await forwardRequest('post', `${baseURL}/`, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const data = await forwardRequest('put', `${baseURL}/${req.params.id}`, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const data = await forwardRequest('delete', `${baseURL}/${req.params.id}`);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Inventory state updates
exports.reserveInventory = async (req, res) => {
  try {
    const data = await forwardRequest('post', `${baseURL}/reserve`, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.releaseInventory = async (req, res) => {
  try {
    const data = await forwardRequest('post', `${baseURL}/release`, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.finalizeInventory = async (req, res) => {
  try {
    const data = await forwardRequest('post', `${baseURL}/finalize`, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};
