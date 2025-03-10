const express = require('express');
const router = express.Router();
const { getContentForPage } = require('../controllers/contentController');

// Home page route
router.get('/', getContentForPage('home'));

// Dynamic page routes
router.get('/guides/:slug', getContentForPage('guide'));

// About page
router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'About Marius Guides',
    currentPath: req.path
  });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact Us',
    currentPath: req.path
  });
});

module.exports = router; 