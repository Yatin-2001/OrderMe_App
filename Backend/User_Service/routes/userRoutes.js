const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile/:id', userController.getProfile);
router.get('/verifyUser', userController.verifyUser);

module.exports = router;
