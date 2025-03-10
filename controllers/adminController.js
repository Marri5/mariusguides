const Guide = require('../models/Guide');
const ContentBlock = require('../models/ContentBlock');
const fs = require('fs');
const path = require('path');

// @desc    Admin dashboard
// @route   GET /admin
exports.getDashboard = async (req, res) => {
  try {
    const guidesCount = await Guide.countDocuments();
    const contentBlocksCount = await ContentBlock.countDocuments();
    const recentGuides = await Guide.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name');
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      currentPath: req.path,
      guidesCount,
      contentBlocksCount,
      recentGuides
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error,
      currentPath: req.path
    });
  }
};

// @desc    Show all guides
// @route   GET /admin/guides
exports.getGuides = async (req, res) => {
  try {
    const guides = await Guide.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name');
    
    res.render('admin/guides/index', {
      title: 'Manage Guides',
      currentPath: req.path,
      guides
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error,
      currentPath: req.path
    });
  }
};

// @desc    Show guide creation form
// @route   GET /admin/guides/create
exports.getCreateGuide = (req, res) => {
  res.render('admin/guides/create', {
    title: 'Create New Guide',
    currentPath: req.path
  });
};

// @desc    Create new guide
// @route   POST /admin/guides/create
exports.postCreateGuide = async (req, res) => {
  try {
    const { title, description, tags, published } = req.body;
    
    const guideData = {
      title,
      description,
      author: req.session.user.id,
      published: published === 'on',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };
    
    // If thumbnail was uploaded, add it to guide data
    if (req.file) {
      guideData.thumbnail = `/uploads/${req.file.filename}`;
    }
    
    const guide = await Guide.create(guideData);
    
    res.redirect(`/admin/guides/${guide._id}/edit`);
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error,
      currentPath: req.path
    });
  }
};

// @desc    Show guide edit form
// @route   GET /admin/guides/:id/edit
exports.getEditGuide = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .populate({
        path: 'contentBlocks',
        options: { sort: { position: 1 } }
      });
    
    if (!guide) {
      return res.status(404).render('pages/error', {
        title: 'Guide Not Found',
        error: { message: 'Guide not found' },
        currentPath: req.path
      });
    }
    
    res.render('admin/guides/edit', {
      title: `Edit Guide: ${guide.title}`,
      currentPath: req.path,
      guide
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error,
      currentPath: req.path
    });
  }
};

// @desc    Update guide
// @route   PUT /admin/guides/:id
exports.putUpdateGuide = async (req, res) => {
  try {
    const { title, description, tags, published } = req.body;
    
    const updateData = {
      title,
      description,
      published: published === 'on',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };
    
    // If thumbnail was uploaded, add it to update data
    if (req.file) {
      // Delete old thumbnail if it exists and is not the default
      const guide = await Guide.findById(req.params.id);
      if (guide.thumbnail && guide.thumbnail !== '/images/default-thumbnail.jpg') {
        const oldThumbnailPath = path.join(__dirname, '../public', guide.thumbnail);
        if (fs.existsSync(oldThumbnailPath)) {
          fs.unlinkSync(oldThumbnailPath);
        }
      }
      
      updateData.thumbnail = `/uploads/${req.file.filename}`;
    }
    
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!guide) {
      return res.status(404).render('pages/error', {
        title: 'Guide Not Found',
        error: { message: 'Guide not found' },
        currentPath: req.path
      });
    }
    
    res.redirect('/admin/guides');
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error,
      currentPath: req.path
    });
  }
};

// @desc    Delete guide
// @route   DELETE /admin/guides/:id
exports.deleteGuide = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }
    
    // Delete associated content blocks
    await ContentBlock.deleteMany({ guide: guide._id });
    
    // Delete thumbnail if it's not the default
    if (guide.thumbnail && guide.thumbnail !== '/images/default-thumbnail.jpg') {
      const thumbnailPath = path.join(__dirname, '../public', guide.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }
    
    await guide.deleteOne();
    
    res.redirect('/admin/guides');
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Show all content blocks
// @route   GET /admin/content-blocks
exports.getContentBlocks = async (req, res) => {
  try {
    const contentBlocks = await ContentBlock.find()
      .sort({ createdAt: -1 })
      .populate('guide', 'title')
      .populate('createdBy', 'name');
    
    res.render('admin/content-blocks/index', {
      title: 'Manage Content Blocks',
      currentPath: req.path,
      contentBlocks
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error,
      currentPath: req.path
    });
  }
};

// @desc    Show content block creation form
// @route   GET /admin/content-blocks/create
exports.getCreateBlock = async (req, res) => {
  try {
    const guides = await Guide.find().sort({ title: 1 });
    
    res.render('admin/content-blocks/create', {
      title: 'Create New Content Block',
      currentPath: req.path,
      guides,
      guideId: req.query.guideId || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error,
      currentPath: req.path
    });
  }
};

// @desc    Create new content block
// @route   POST /admin/content-blocks/create
exports.postCreateBlock = async (req, res) => {
  try {
    const { title, type, content, guide, position } = req.body;
    
    const blockData = {
      title,
      type,
      content,
      guide,
      position: position || 0,
      createdBy: req.session.user.id
    };
    
    // If media was uploaded, add it to block data
    if (req.file) {
      blockData.mediaUrl = `/uploads/${req.file.filename}`;
    }
    
    const contentBlock = await ContentBlock.create(blockData);
    
    // Add content block to guide
    await Guide.findByIdAndUpdate(
      guide,
      { $push: { contentBlocks: contentBlock._id } }
    );
    
    res.redirect(`/admin/guides/${guide}/edit`);
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error,
      currentPath: req.path
    });
  }
};

// @desc    Show content block edit form
// @route   GET /admin/content-blocks/:id/edit
exports.getEditBlock = async (req, res) => {
  try {
    const contentBlock = await ContentBlock.findById(req.params.id);
    const guides = await Guide.find().sort({ title: 1 });
    
    if (!contentBlock) {
      return res.status(404).render('pages/error', {
        title: 'Content Block Not Found',
        error: { message: 'Content block not found' },
        currentPath: req.path
      });
    }
    
    res.render('admin/content-blocks/edit', {
      title: `Edit Content Block: ${contentBlock.title}`,
      currentPath: req.path,
      contentBlock,
      guides
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error,
      currentPath: req.path
    });
  }
};

// @desc    Update content block
// @route   PUT /admin/content-blocks/:id
exports.putUpdateBlock = async (req, res) => {
  try {
    const { title, type, content, guide, position } = req.body;
    
    const contentBlock = await ContentBlock.findById(req.params.id);
    
    if (!contentBlock) {
      return res.status(404).render('pages/error', {
        title: 'Content Block Not Found',
        error: { message: 'Content block not found' },
        currentPath: req.path
      });
    }
    
    // Check if guide has changed
    const oldGuideId = contentBlock.guide.toString();
    const newGuideId = guide;
    
    if (oldGuideId !== newGuideId) {
      // Remove content block from old guide
      await Guide.findByIdAndUpdate(
        oldGuideId,
        { $pull: { contentBlocks: contentBlock._id } }
      );
      
      // Add content block to new guide
      await Guide.findByIdAndUpdate(
        newGuideId,
        { $push: { contentBlocks: contentBlock._id } }
      );
    }
    
    const updateData = {
      title,
      type,
      content,
      guide: newGuideId,
      position: position || 0
    };
    
    // If media was uploaded, add it to update data
    if (req.file) {
      // Delete old media if it exists
      if (contentBlock.mediaUrl) {
        const oldMediaPath = path.join(__dirname, '../public', contentBlock.mediaUrl);
        if (fs.existsSync(oldMediaPath)) {
          fs.unlinkSync(oldMediaPath);
        }
      }
      
      updateData.mediaUrl = `/uploads/${req.file.filename}`;
    }
    
    await ContentBlock.findByIdAndUpdate(
      req.params.id,
      updateData,
      { runValidators: true }
    );
    
    res.redirect(`/admin/guides/${newGuideId}/edit`);
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error,
      currentPath: req.path
    });
  }
};

// @desc    Delete content block
// @route   DELETE /admin/content-blocks/:id
exports.deleteBlock = async (req, res) => {
  try {
    const contentBlock = await ContentBlock.findById(req.params.id);
    
    if (!contentBlock) {
      return res.status(404).json({ success: false, message: 'Content block not found' });
    }
    
    // Remove content block from guide
    await Guide.findByIdAndUpdate(
      contentBlock.guide,
      { $pull: { contentBlocks: contentBlock._id } }
    );
    
    // Delete media if it exists
    if (contentBlock.mediaUrl) {
      const mediaPath = path.join(__dirname, '../public', contentBlock.mediaUrl);
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }
    
    await contentBlock.deleteOne();
    
    res.redirect(`/admin/guides/${contentBlock.guide}/edit`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 