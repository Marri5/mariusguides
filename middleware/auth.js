/**
 * Authentication middleware
 */

// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('pages/error', {
      title: 'Access Denied',
      error: { message: 'You do not have permission to access this resource' },
      currentPath: req.path
    });
  }
  next();
}; 