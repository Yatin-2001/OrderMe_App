const User = require('../models/User');
const bcrypt = require('bcryptjs');
const productClient = require('../grpcClient/productClient');

// Normal APIs

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    res.status(201).json({ username: email });

  } catch (err) {
    res.status(500).json({ message: err.message });

  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ username: email });

  } catch (err) {
    res.status(500).json({ message: err.message });

  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
    
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.json({ isUserValid: "false", isAdmin: "false" });

    if(user.role === "admin") return res.json({ isUserValid: "true", isAdmin: "true" });

    res.json({ isUserValid: "true", isAdmin: "false" });

  } catch (err) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

exports.addAddress = async(req, res) => {
  try {
    const {username, address} = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(500).json({ error: "User could not be found!!!" });

    user.addressList.push(address);

    user.save();

    res.json({msg: "User address addedd successfully!!!"})

  } catch (err) {


  }
}


////////////////////////////////////////////////////////////////////

// CART realted APIs

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Validate product via gRPC
    productClient.GetProduct({ id: productId }, async (err, productData) => {
      if (err) return res.status(404).json({ error: 'Product not found' });

      const user = await User.findById(userId);

      // Check if product already in cart
      const existing = user.cart.find(item => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        user.cart.push({ productId, quantity });
      }

      await user.save();
      res.status(200).json({ message: 'Item added to cart', cart: user.cart });
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get cart with product details
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const detailedCart = await Promise.all(user.cart.map(item => {
      return new Promise((resolve) => {
        productClient.GetProduct({ id: item.productId }, (err, product) => {
          if (err) return resolve({ ...item._doc, product: null });
          resolve({
            ...item._doc,
            product: {
              name: product.name,
              price: product.price,
              available: product.availableStock,
            }
          });
        });
      });
    }));

    res.status(200).json(detailedCart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load cart' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    user.cart = user.cart.filter(item => item.productId !== productId);
    await user.save();

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

