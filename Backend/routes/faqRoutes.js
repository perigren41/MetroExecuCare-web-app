const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public route - anyone can view FAQs
router.get('/', faqController.getFAQs);

// Get available categories
router.get('/categories', faqController.getCategories);

// Protected routes - require authentication
// Admin and HR can create, update, and delete FAQs
router.post('/', authenticateToken, faqController.createFAQ);
router.put('/:id', authenticateToken, faqController.updateFAQ);
router.delete('/:id', authenticateToken, faqController.deleteFAQ);

module.exports = router;