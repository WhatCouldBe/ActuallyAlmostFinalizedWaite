// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Standard routes
router.post('/signup', authController.signup);
router.post('/verify', authController.verify);
router.post('/signin', authController.signin);
router.get('/logout', authController.logout);

// Resend verification code
router.post('/resend', authController.resend);

// Forgot password - request one-time code
router.post('/request-password-otp', authController.requestPasswordOTP);
// Forgot password - OTP login
router.post('/otp-login', authController.otpLogin);
// Forgot password - change password
router.post('/change-password', authController.changePassword);

// Example protected route
router.get('/protected', (req, res) => {
  if (!req.session.user) {
    return res.status(403).json({ message: 'Not authenticated.' });
  }
  res.json({ message: 'You can access protected route!', user: req.session.user });
});

module.exports = router;
