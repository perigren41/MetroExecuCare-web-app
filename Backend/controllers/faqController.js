const { pool } = require('../config/database/connection');
const { logActivity, ACTIVITY_TYPES, getRequestInfo } = require('../utils/activityLogger');

// Category mapping from database enum to display names
const CATEGORY_DISPLAY_NAMES = {
  'general': 'General',
  'getting_started': 'Getting Started',
  'approval_workflow': 'Approval Workflow',
  'request_tracking': 'Request Tracking',
  'after_approval': 'After Approval',
  'application_process': 'Application Process',
  'special_requests': 'Special Requests',
  'letter_requests': 'Letter Requests',
  'timeline': 'Timeline',
  'medical_tests': 'Medical Tests',
  'hospitals': 'Hospitals',
  'file_uploads': 'File Uploads'
};

// GET /api/faqs - Get all active FAQs grouped by category
const getFAQs = async (req, res) => {
  try {
    const [faqs] = await pool.execute(`
      SELECT
        id,
        question,
        answer,
        category,
        display_order,
        view_count,
        created_at,
        updated_at
      FROM faqs
      WHERE is_active = 1
      ORDER BY category, display_order ASC, created_at DESC
    `);

    // Group FAQs by category
    const groupedFAQs = {};
    faqs.forEach(faq => {
      const categoryKey = faq.category;
      const categoryName = CATEGORY_DISPLAY_NAMES[categoryKey] || categoryKey;

      if (!groupedFAQs[categoryName]) {
        groupedFAQs[categoryName] = [];
      }

      groupedFAQs[categoryName].push({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: categoryKey,
        displayOrder: faq.display_order,
        viewCount: faq.view_count,
        createdAt: faq.created_at,
        updatedAt: faq.updated_at
      });
    });

    res.json({
      success: true,
      data: {
        categories: groupedFAQs,
        totalFAQs: faqs.length
      }
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FAQs'
    });
  }
};

// POST /api/faqs - Create new FAQ (admin and HR only)
const createFAQ = async (req, res) => {
  try {
    // Check if user is admin or HR
    if (req.user.role !== 'admin' && req.user.role !== 'hr_personnel') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin or HR role required.'
      });
    }

    const { question, answer, category, displayOrder = 0 } = req.body;

    // Validate required fields
    if (!question || !answer || !category) {
      return res.status(400).json({
        success: false,
        error: 'Question, answer, and category are required'
      });
    }

    // Validate category
    const validCategories = [
      'general',
      'getting_started',
      'approval_workflow',
      'request_tracking',
      'after_approval',
      'application_process',
      'special_requests',
      'letter_requests',
      'timeline',
      'medical_tests',
      'hospitals',
      'file_uploads'
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Insert FAQ
    const [result] = await pool.execute(
      `INSERT INTO faqs (question, answer, category, display_order, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [question, answer, category, displayOrder, req.user.id]
    );

    // Get the created FAQ
    const [createdFAQ] = await pool.execute(
      `SELECT
        id,
        question,
        answer,
        category,
        display_order,
        created_at,
        updated_at
       FROM faqs
       WHERE id = ?`,
      [result.insertId]
    );

    // Log activity
    const requestInfo = getRequestInfo(req);
    await logActivity({
      userId: req.user.id,
      action: ACTIVITY_TYPES.FAQ_CREATED,
      description: `Added new FAQ in ${CATEGORY_DISPLAY_NAMES[category]} category`,
      newValues: {
        faqId: result.insertId,
        question: question.substring(0, 100)
      },
      ...requestInfo
    });

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: {
        faq: createdFAQ[0]
      }
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create FAQ'
    });
  }
};

// PUT /api/faqs/:id - Update FAQ (admin and HR only)
const updateFAQ = async (req, res) => {
  try {
    // Check if user is admin or HR
    if (req.user.role !== 'admin' && req.user.role !== 'hr_personnel') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin or HR role required.'
      });
    }

    const { id } = req.params;
    const { question, answer, category, displayOrder, isActive } = req.body;

    // Check if FAQ exists
    const [existingFAQ] = await pool.execute(
      'SELECT id FROM faqs WHERE id = ?',
      [id]
    );

    if (existingFAQ.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (question !== undefined) {
      updates.push('question = ?');
      params.push(question);
    }
    if (answer !== undefined) {
      updates.push('answer = ?');
      params.push(answer);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (displayOrder !== undefined) {
      updates.push('display_order = ?');
      params.push(displayOrder);
    }
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      params.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    params.push(id);

    await pool.execute(
      `UPDATE faqs SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated FAQ
    const [updatedFAQ] = await pool.execute(
      `SELECT
        id,
        question,
        answer,
        category,
        display_order,
        is_active,
        created_at,
        updated_at
       FROM faqs
       WHERE id = ?`,
      [id]
    );

    // Log activity
    const requestInfo = getRequestInfo(req);
    await logActivity({
      userId: req.user.id,
      action: ACTIVITY_TYPES.FAQ_UPDATED,
      description: `Updated FAQ`,
      newValues: {
        faqId: id,
        updates: Object.keys(req.body)
      },
      ...requestInfo
    });

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: {
        faq: updatedFAQ[0]
      }
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update FAQ'
    });
  }
};

// DELETE /api/faqs/:id - Soft delete FAQ (admin and HR only)
const deleteFAQ = async (req, res) => {
  try {
    // Check if user is admin or HR
    if (req.user.role !== 'admin' && req.user.role !== 'hr_personnel') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin or HR role required.'
      });
    }

    const { id } = req.params;

    // Check if FAQ exists
    const [existingFAQ] = await pool.execute(
      'SELECT id, question FROM faqs WHERE id = ?',
      [id]
    );

    if (existingFAQ.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    // Soft delete
    await pool.execute(
      'UPDATE faqs SET is_active = 0 WHERE id = ?',
      [id]
    );

    // Log activity
    const requestInfo = getRequestInfo(req);
    await logActivity({
      userId: req.user.id,
      action: ACTIVITY_TYPES.FAQ_DELETED,
      description: `Deleted FAQ`,
      oldValues: {
        faqId: id,
        question: existingFAQ[0].question.substring(0, 100)
      },
      ...requestInfo
    });

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete FAQ'
    });
  }
};

// GET /api/faqs/categories - Get available categories
const getCategories = async (req, res) => {
  try {
    const categories = Object.entries(CATEGORY_DISPLAY_NAMES).map(([key, value]) => ({
      key,
      displayName: value
    }));

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};

module.exports = {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getCategories,
  CATEGORY_DISPLAY_NAMES
};