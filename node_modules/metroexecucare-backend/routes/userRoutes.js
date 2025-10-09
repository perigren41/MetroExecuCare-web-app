const express = require('express');
const router = express.Router();

// Debug: Check each import one by one
console.log('Starting userRoutes imports...');

try {
  const userController = require('../controllers/userController');
  console.log('✅ userController imported:', Object.keys(userController));
} catch (error) {
  console.log('❌ Error importing userController:', error.message);
}

try {
  const profileController = require('../controllers/profileController');
  console.log('✅ profileController imported:', Object.keys(profileController));
} catch (error) {
  console.log('❌ Error importing profileController:', error.message);
}

try {
  const authMiddleware = require('../middleware/authMiddleware');
  console.log('✅ authMiddleware imported:', Object.keys(authMiddleware));
} catch (error) {
  console.log('❌ Error importing authMiddleware:', error.message);
}

try {
  const uploadMiddleware = require('../middleware/uploadMiddleware');
  console.log('✅ uploadMiddleware imported:', Object.keys(uploadMiddleware));
} catch (error) {
  console.log('❌ Error importing uploadMiddleware:', error.message);
}

try {
  const userValidators = require('../validators/userValidators');
  console.log('✅ userValidators imported:', Object.keys(userValidators));
} catch (error) {
  console.log('❌ Error importing userValidators:', error.message);
}

// Now let's import them properly if they exist
let getUsers, getUserById, getUserActivityLogs, updateUser, updateUserStatus, deleteUser, getDeletedUsers, restoreUser, uploadProfilePicture, removeProfilePicture, updateUserNotes, getUserNotes, getAdminActivityLogs;
let upload, deleteProfilePicture, uploadProfilePictureMiddleware;
let authenticateToken;
let validateUpdateUser, validateUpdateUserStatus;

try {
  const userControllerFunctions = require('../controllers/userController');
  ({
    getUsers,
    getUserById,
    getUserActivityLogs,
    updateUser,
    updateUserStatus,
    deleteUser,
    getDeletedUsers,
    restoreUser,
    uploadProfilePicture,
    removeProfilePicture,
    updateUserNotes,
    getUserNotes,
    getAdminActivityLogs
  } = userControllerFunctions);
  
  console.log('User controller functions:', {
    getUsers: typeof getUsers,
    getUserById: typeof getUserById,
    getUserActivityLogs: typeof getUserActivityLogs,
    updateUser: typeof updateUser,
    updateUserStatus: typeof updateUserStatus,
    deleteUser: typeof deleteUser,
    getDeletedUsers: typeof getDeletedUsers,
    restoreUser: typeof restoreUser
  });
} catch (error) {
  console.log('Error destructuring userController:', error.message);
}

try {
  const profileControllerFunctions = require('../controllers/profileController');
  ({
    upload,
    uploadProfilePicture,
    deleteProfilePicture
  } = profileControllerFunctions);
  
  console.log('Profile controller functions:', {
    upload: typeof upload,
    uploadProfilePicture: typeof uploadProfilePicture,
    deleteProfilePicture: typeof deleteProfilePicture
  });
} catch (error) {
  console.log('Error destructuring profileController:', error.message);
}

try {
  const authMiddlewareFunctions = require('../middleware/authMiddleware');
  ({ authenticateToken } = authMiddlewareFunctions);
  
  console.log('Auth middleware functions:', {
    authenticateToken: typeof authenticateToken
  });
} catch (error) {
  console.log('Error destructuring authMiddleware:', error.message);
}

try {
  const validatorFunctions = require('../validators/userValidators');
  ({
    validateUpdateUser,
    validateUpdateUserStatus
  } = validatorFunctions);

  console.log('Validator functions:', {
    validateUpdateUser: typeof validateUpdateUser,
    validateUpdateUserStatus: typeof validateUpdateUserStatus
  });
} catch (error) {
  console.log('Error destructuring validators:', error.message);
}

try {
  const uploadMiddlewareFunctions = require('../middleware/uploadMiddleware');
  ({ uploadProfilePicture: uploadProfilePictureMiddleware } = uploadMiddlewareFunctions);

  console.log('Upload middleware functions:', {
    uploadProfilePictureMiddleware: typeof uploadProfilePictureMiddleware
  });
} catch (error) {
  console.log('Error destructuring uploadMiddleware:', error.message);
}


if (typeof authenticateToken === 'function') {
  router.use(authenticateToken);
  console.log('✅ Applied authenticateToken middleware');
} else {
  console.log('❌ authenticateToken is not a function:', typeof authenticateToken);
}

if (typeof getUsers === 'function') {
  router.get('/', getUsers);
  console.log('✅ Added GET / route');
} else {
  console.log('❌ getUsers is not a function:', typeof getUsers);
}

// Deleted users management routes - MUST be before /:id route
if (typeof getDeletedUsers === 'function') {
  router.get('/deleted', getDeletedUsers);
  console.log('✅ Added GET /deleted route');
} else {
  console.log('❌ getDeletedUsers is not a function:', typeof getDeletedUsers);
}

// Admin activity logs route - MUST be before /:id route
if (typeof getAdminActivityLogs === 'function') {
  router.get('/admin/activity-logs', getAdminActivityLogs);
  console.log('✅ Added GET /admin/activity-logs route');
} else {
  console.log('❌ getAdminActivityLogs is not a function:', typeof getAdminActivityLogs);
}

if (typeof getUserById === 'function') {
  router.get('/:id', getUserById);
  console.log('✅ Added GET /:id route');
} else {
  console.log('❌ getUserById is not a function:', typeof getUserById);
}

if (typeof getUserActivityLogs === 'function') {
  router.get('/:id/activity-logs', getUserActivityLogs);
  console.log('✅ Added GET /:id/activity-logs route');
} else {
  console.log('❌ getUserActivityLogs is not a function:', typeof getUserActivityLogs);
}


if (typeof updateUser === 'function' && typeof validateUpdateUser === 'function') {
  router.put('/:id', validateUpdateUser, updateUser);
  console.log('✅ Added PUT /:id route');
} else {
  console.log('❌ updateUser or validateUpdateUser not functions:', {
    updateUser: typeof updateUser,
    validateUpdateUser: typeof validateUpdateUser
  });
}

if (typeof updateUserStatus === 'function' && typeof validateUpdateUserStatus === 'function') {
  router.put('/:id/status', validateUpdateUserStatus, updateUserStatus);
  console.log('✅ Added PUT /:id/status route');
} else {
  console.log('❌ updateUserStatus or validateUpdateUserStatus not functions');
}

if (typeof deleteUser === 'function') {
  router.delete('/:id', deleteUser);
  console.log('✅ Added DELETE /:id route');
} else {
  console.log('❌ deleteUser is not a function:', typeof deleteUser);
}

if (typeof restoreUser === 'function') {
  router.put('/:id/restore', restoreUser);
  console.log('✅ Added PUT /:id/restore route');
} else {
  console.log('❌ restoreUser is not a function:', typeof restoreUser);
}

// Profile picture routes
if (typeof upload === 'object' && typeof uploadProfilePicture === 'function') {
  router.post('/profile/picture', upload.single('profile_picture'), uploadProfilePicture);
  console.log('✅ Added POST /profile/picture route');
} else {
  console.log('❌ upload or uploadProfilePicture not valid:', {
    upload: typeof upload,
    uploadProfilePicture: typeof uploadProfilePicture
  });
}

if (typeof deleteProfilePicture === 'function') {
  router.delete('/profile/picture', deleteProfilePicture);
  console.log('✅ Added DELETE /profile/picture route');
} else {
  console.log('❌ deleteProfilePicture is not a function:', typeof deleteProfilePicture);
}

// New profile picture upload route
if (typeof uploadProfilePictureMiddleware === 'function' && typeof uploadProfilePicture === 'function') {
  router.post('/:id/profile-picture', uploadProfilePictureMiddleware, uploadProfilePicture);
  console.log('✅ Added POST /:id/profile-picture route');
} else {
  console.log('❌ uploadProfilePictureMiddleware or uploadProfilePicture not functions:', {
    uploadProfilePictureMiddleware: typeof uploadProfilePictureMiddleware,
    uploadProfilePicture: typeof uploadProfilePicture
  });
}

// Remove profile picture route
if (typeof removeProfilePicture === 'function') {
  router.delete('/:id/profile-picture', removeProfilePicture);
  console.log('✅ Added DELETE /:id/profile-picture route');
} else {
  console.log('❌ removeProfilePicture not a function:', typeof removeProfilePicture);
}

// Notes management routes
if (typeof getUserNotes === 'function') {
  router.get('/:id/notes', getUserNotes);
  console.log('✅ Added GET /:id/notes route');
} else {
  console.log('❌ getUserNotes is not a function:', typeof getUserNotes);
}

if (typeof updateUserNotes === 'function') {
  router.put('/:id/notes', updateUserNotes);
  console.log('✅ Added PUT /:id/notes route');
} else {
  console.log('❌ updateUserNotes is not a function:', typeof updateUserNotes);
}

console.log('userRoutes setup complete!');

module.exports = router;