const Guide = require('../models/Guide');
const ContentBlock = require('../models/ContentBlock');

// Factory function to get content for different page types
exports.getContentForPage = (pageType) => async (req, res) => {
  try {
    switch (pageType) {
      case 'home':
        // Get published guides for home page
        const featuredGuides = await Guide.find({ published: true })
          .sort({ createdAt: -1 })
          .limit(6)
          .populate('author', 'name');
        
        return res.render('pages/home', {
          title: 'Marius Guides - Educational Content',
          currentPath: req.path,
          featuredGuides
        });
      
      case 'guide':
        // Get specific guide by slug
        const guide = await Guide.findOne({ 
          slug: req.params.slug,
          published: true 
        }).populate('author', 'name avatar bio')
          .populate({
            path: 'contentBlocks',
            options: { sort: { position: 1 } }
          });
        
        if (!guide) {
          return res.status(404).render('pages/404', {
            title: 'Guide Not Found',
            currentPath: req.path
          });
        }
        
        // Get related guides (same tags)
        const relatedGuides = await Guide.find({
          _id: { $ne: guide._id },
          published: true,
          tags: { $in: guide.tags }
        }).limit(3).populate('author', 'name');
        
        return res.render('pages/guide', {
          title: guide.title,
          currentPath: req.path,
          guide,
          relatedGuides
        });
      
      default:
        return res.status(404).render('pages/404', {
          title: 'Page Not Found',
          currentPath: req.path
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error : {},
      currentPath: req.path
    });
  }
}; 