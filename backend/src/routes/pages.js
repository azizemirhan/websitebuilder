const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// List all pages
router.get('/pages', pageController.listPages);

// Get single page
router.get('/pages/:id', pageController.getPage);

// Create new page
router.post('/pages', pageController.createPage);

// Update/Save page
router.post('/pages/:id', pageController.savePage);

// Delete page
router.delete('/pages/:id', pageController.deletePage);

module.exports = router;
