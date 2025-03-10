const express = require('express');
const router = express.Router();
const { 
  getLogin, 
  postLogin, 
  getRegister,
  postRegister,
  getProfile,
  putUpdateProfile,
  logout
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/logout', logout);

// Protected routes
router.get('/profile', isAuthenticated, getProfile);
router.put('/profile', isAuthenticated, upload.single('avatar'), putUpdateProfile);

module.exports = router; 