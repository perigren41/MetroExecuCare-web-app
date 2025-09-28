const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { pool } = require('../config/database/connection');

// Configure multer for profile picture upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profile-pictures');

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const uniqueName = `${req.user.id}_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const userId = req.user.id;
    const fileName = req.file.filename;
    const filePath = `/uploads/profile-pictures/${fileName}`;

    // Get current profile picture to delete old one
    const [currentUser] = await pool.execute(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );

    // Update user's profile picture in database
    await pool.execute(
      'UPDATE users SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [filePath, userId]
    );

    // Delete old profile picture if exists
    if (currentUser[0] && currentUser[0].profile_picture) {
      const oldFilePath = path.join(__dirname, '../', currentUser[0].profile_picture);
      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.log('Could not delete old profile picture:', error.message);
      }
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profile_picture: filePath
      }
    });
  } catch (error) {
    // Clean up uploaded file if database update fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Delete profile picture
const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current profile picture
    const [users] = await pool.execute(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const currentProfilePicture = users[0].profile_picture;

    if (!currentProfilePicture) {
      return res.status(400).json({
        success: false,
        error: 'No profile picture to delete'
      });
    }

    // Remove profile picture from database
    await pool.execute(
      'UPDATE users SET profile_picture = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../', currentProfilePicture);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.log('Could not delete profile picture file:', error.message);
    }

    res.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  upload,
  uploadProfilePicture,
  deleteProfilePicture
};