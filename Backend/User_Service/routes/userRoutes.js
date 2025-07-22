const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile/:id', userController.getProfile);
router.get('/verifyUser', userController.verifyUser);

// CART APIs
router.post('/cart',  userController.addToCart);
router.get('/cart', userController.getCart);
router.delete('/cart/:productId', userController.removeFromCart);

module.exports = router;
