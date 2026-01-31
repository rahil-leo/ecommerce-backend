const express = require('express');
const {
  register,
  login,
  staffLogin,
  getMe,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/staff/login', staffLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
