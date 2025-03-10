const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { 
  getDashboard,
  getGuides,
  getCreateGuide,
  postCreateGuide,
  getEditGuide,
  putUpdateGuide,
  deleteGuide,
  getContentBlocks,
  getCreateBlock,
  postCreateBlock,
  getEditBlock,
  putUpdateBlock,
  deleteBlock
} = require('../controllers/adminController');
const upload = require('../middleware/upload');
const ContentBlock = require('../models/ContentBlock');

// All admin routes require authentication and admin privileges
router.use(isAuthenticated, isAdmin);

// Dashboard
router.get('/', getDashboard);

// Guide routes
router.get('/guides', getGuides);
router.get('/guides/create', getCreateGuide);
router.post('/guides/create', upload.single('thumbnail'), postCreateGuide);
router.get('/guides/:id/edit', getEditGuide);
router.put('/guides/:id', upload.single('thumbnail'), putUpdateGuide);
router.delete('/guides/:id', deleteGuide);

// Content block routes
router.get('/content-blocks', getContentBlocks);
router.get('/content-blocks/create', getCreateBlock);
router.post('/content-blocks/create', upload.single('media'), postCreateBlock);
router.get('/content-blocks/:id/edit', getEditBlock);
router.put('/content-blocks/:id', upload.single('media'), putUpdateBlock);
router.delete('/content-blocks/:id', deleteBlock);

// Route for updating content block positions via AJAX
router.post('/content-blocks/update-positions', (req, res) => {
  const { positions } = req.body;
  
  if (!positions || !Array.isArray(positions)) {
    return res.status(400).json({ success: false, message: 'Invalid positions data' });
  }
  
  // Update each content block's position
  const updatePromises = positions.map(item => {
    return ContentBlock.findByIdAndUpdate(item.id, { position: item.position });
  });
  
  Promise.all(updatePromises)
    .then(() => {
      res.json({ success: true, message: 'Positions updated successfully' });
    })
    .catch(error => {
      console.error('Error updating positions:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    });
});

module.exports = router; 