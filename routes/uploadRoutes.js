const express = require('express');
const { upload } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Upload image
// @route   POST /api/upload
// @access  Private/Admin/Staff
router.post('/', protect, authorize('admin', 'staff'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    res.status(200).json({
      success: true,
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading image' });
  }
});

module.exports = router;
