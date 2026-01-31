const express = require('express');
const User = require('../models/User');
const Staff = require('../models/Staff');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all staff members (Admin only)
// @route   GET /api/users/staff
// @access  Private/Admin
router.get('/staff', protect, authorize('admin'), async (req, res, next) => {
  try {
    const staff = await Staff.find({}).select('-password').populate('createdBy', 'name email');
    res.json({ 
      success: true, 
      count: staff.length,
      data: staff 
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create staff member (Admin only)
// @route   POST /api/users/staff
// @access  Private/Admin
router.post('/staff', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    console.log('Creating staff - received data:', { name, email, role, phone, hasPassword: !!password });

    // Validate input
    if (!name || !email || !password) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email and password' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('Validation failed: password too short');
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if staff already exists
    const staffExists = await Staff.findOne({ email });
    if (staffExists) {
      console.log('Validation failed: staff already exists');
      return res.status(400).json({ 
        success: false, 
        message: 'Staff member with this email already exists' 
      });
    }

    // Check if email exists in regular users
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('Validation failed: email already used by a user');
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered' 
      });
    }

    // Only allow admin or staff roles to be created
    const allowedRoles = ['staff', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      console.log('Validation failed: invalid role');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Only staff or admin roles can be created.' 
      });
    }

    // Create staff member
    const staff = await Staff.create({
      name,
      email,
      password,
      phone: phone || '',
      role: role || 'staff',
      createdBy: req.user.id
    });

    console.log('Staff member created successfully:', staff.email);

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    next(error);
  }
});

// @desc    Update staff member (Admin only)
// @route   PUT /api/users/staff/:id
// @access  Private/Admin
router.put('/staff/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { name, email, phone, isActive, role } = req.body;

    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Update fields
    if (name) staff.name = name;
    if (email) staff.email = email;
    if (phone) staff.phone = phone;
    if (isActive) staff.isActive = isActive; // 'active' or 'disabled'
    if (role) staff.role = role;

    await staff.save();

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete staff member (Admin only)
// @route   DELETE /api/users/staff/:id
// @access  Private/Admin
router.delete('/staff/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    await Staff.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
