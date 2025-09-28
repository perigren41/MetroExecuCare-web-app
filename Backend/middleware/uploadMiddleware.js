const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const profilePictureDir = path.join(__dirname, '../uploads/profile-pictures');
const requestFilesDir = path.join(__dirname, '../uploads/request-files');

if (!fs.existsSync(profilePictureDir)) {
  fs.mkdirSync(profilePictureDir, { recursive: true });
}

if (!fs.existsSync(requestFilesDir)) {
  fs.mkdirSync(requestFilesDir, { recursive: true });
}

// Configure multer for profile picture uploads
const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilePictureDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp.extension
    const userId = req.user.id;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// Configure multer for request file uploads
const requestFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, requestFilesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: requestId_userId_timestamp_originalname
    const userId = req.user.id;
    const requestId = req.params.requestId || 'pending';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const filename = `${requestId}_${userId}_${timestamp}_${baseName}${extension}`;
    cb(null, filename);
  }
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
  }
};

// File filter for PDFs only
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
};

// Configure multer for profile pictures
const profilePictureUpload = multer({
  storage: profilePictureStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Configure multer for request files (PDFs)
const requestFileUpload = multer({
  storage: requestFileStorage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for PDFs
  }
});

module.exports = {
  uploadProfilePicture: profilePictureUpload.single('profile_picture'),
  uploadRequestFile: requestFileUpload.single('request_file')
};