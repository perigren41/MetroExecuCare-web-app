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
  const userValidators = require('../validators/userValidators');
  console.log('✅ userValidators imported:', Object.keys(userValidators));
} catch (error) {
  console.log('❌ Error importing userValidators:', error.message);
}

// Now let's import them properly if they exist
let getUsers, getUserById, updateUser, updateUserStatus, deleteUser;
let upload, uploadProfilePicture, deleteProfilePicture;
let authenticateToken;
let validateUpdateUser, validateUpdateUserStatus;

try {
  const userControllerFunctions = require('../controllers/userController');
  ({
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser
  } = userControllerFunctions);
  
  console.log('User controller functions:', {
    getUsers: typeof getUsers,
    getUserById: typeof getUserById,
    updateUser: typeof updateUser,
    updateUserStatus: typeof updateUserStatus,
    deleteUser: typeof deleteUser
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

if (typeof getUserById === 'function') {
  router.get('/:id', getUserById);
  console.log('✅ Added GET /:id route');
} else {
  console.log('❌ getUserById is not a function:', typeof getUserById);
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

console.log('userRoutes setup complete!');

module.exports = router;