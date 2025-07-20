const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

    

    res.json({  });
  } catch (err) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};
