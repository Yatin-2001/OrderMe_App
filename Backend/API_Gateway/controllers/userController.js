const { forwardRequest } = require('../utils/httpClient');
const jwt = require('jsonwebtoken');

const baseURL = process.env.USER_SERVICE_URL;

exports.register = async (req, res) => {
  try {
    const user = await forwardRequest('post', `${baseURL}/register`, req.body);

    if(user.status === 201){
        const username = user.data.userName;

        // Now create JWT token...
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        res.status(200).json({success: true, username: username, token: token});

    } else {
        res.status(401).json({error: 'Error occured while User Registration. Try again.'})
    }
    
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await forwardRequest('post', `${baseURL}/login`, req.body);

    if(user.status === 200){
        const username = user.data.userName;

        // Now create JWT token...
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        res.status(200).json({success: true, username: username, token: token});

    } else {
        res.status(401).json({error: 'User is not created. Please Register!!!'})
    }

  } catch (err) {
    res.status(500).json(err);
  }
};

// Will have a middleware to check for JWT token;
exports.getProfile = async (req, res) => {
  try {
    const data = await forwardRequest('get', `${baseURL}/profile/${req.params.id}`);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// CART APIs
exports.addToCart = async(req, res) => {
  
  try{

    const cartDetails = await forwardRequest('post', `${baseURL}/cart`, req.body);

    res.status(200).json(cartDetails);

  } catch (err) {
    res.status(500).json({ error: `Failed to add item to cart due to error: ${err}` });

  }

};

exports.getCart = async(req, res) => {
  try{

    const cartDetails = await forwardRequest('get', `${baseURL}/cart`, req.body);

    res.status(200).json(cartDetails);

  } catch (err) {
    res.status(500).json({ error: `Failed to get the cart due to error: ${err}` });
    
  }
};

exports.removeFromCart = async(req, res) => {

  const {productId} = req.params;

  try{

    const cartDetails = await forwardRequest('delete', `${baseURL}/cart/${productId}`);

    res.status(200).json(cartDetails);

  } catch (err) {
    res.status(500).json({ error: `Failed to delete item from cart due to error: ${err}` });
    
  }
};
