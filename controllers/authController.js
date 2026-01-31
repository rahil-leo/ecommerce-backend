const User = require('../models/User');
const Staff = require('../models/Staff');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email and password' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = user.getSignedJwtToken();
    // Set JWT in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user in User model
    let user = await User.findOne({ email }).select('+password');
    let userType = 'user';

    // If not found in User, check Staff model
    if (!user) {
      user = await Staff.findOne({ email }).select('+password');
      userType = 'staff';
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if staff is disabled
    if (userType === 'staff' && user.isActive === 'disabled') {
      return res.status(403).json({ success: false, message: 'Staff is disabled, contact admin' });
    }

    // Generate token
    const token = user.getSignedJwtToken();
    // Set JWT in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: userType
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login staff
// @route   POST /api/auth/staff/login
// @access  Public
exports.staffLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check only Staff model
    const staff = await Staff.findOne({ email }).select('+password');

    if (!staff) {
      return res.status(401).json({ success: false, message: 'Invalid staff credentials' });
    }

    // Check if password matches
    const isMatch = await staff.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid staff credentials' });
    }

    // Check if staff is disabled
    if (staff.isActive === 'disabled') {
      return res.status(403).json({ success: false, message: 'Staff is disabled, contact admin' });
    }

    // Generate token
    const token = staff.getSignedJwtToken();
    // Set JWT in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json({
      success: true,
      user: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        userType: 'staff'
      }
    });
  } catch (error) {
    next(error);
  }
};

  // @desc    Logout user (clear cookie)
  // @route   POST /api/auth/logout
  // @access  Public
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/'
  });
  res.status(200).json({ success: true, message: 'Logged out' });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user is already populated by protect middleware
    // It could be from User or Staff model
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};
