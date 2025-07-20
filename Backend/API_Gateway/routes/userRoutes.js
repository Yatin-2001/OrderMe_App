const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile/:id', requireAuth, userController.getProfile);

module.exports = router;
