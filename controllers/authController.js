const User = require('../models/User');

// @desc    Show login page
// @route   GET /auth/login
exports.getLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  
  res.render('auth/login', {
    title: 'Login',
    currentPath: req.path,
    error: req.session.error,
  });
  
  // Clear any error messages
  delete req.session.error;
};

// @desc    Process login
// @route   POST /auth/login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      req.session.error = 'Invalid email or password';
      return res.redirect('/auth/login');
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      req.session.error = 'Invalid email or password';
      return res.redirect('/auth/login');
    }
    
    // Create session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };
    
    // Redirect to intended URL or home
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    req.session.error = 'Server error. Please try again.';
    res.redirect('/auth/login');
  }
};

// @desc    Show register page
// @route   GET /auth/register
exports.getRegister = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  
  res.render('auth/register', {
    title: 'Register',
    currentPath: req.path,
    error: req.session.error,
  });
  
  // Clear any error messages
  delete req.session.error;
};

// @desc    Process registration
// @route   POST /auth/register
exports.postRegister = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  
  try {
    // Check if passwords match
    if (password !== confirmPassword) {
      req.session.error = 'Passwords do not match';
      return res.redirect('/auth/register');
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      req.session.error = 'Email already in use';
      return res.redirect('/auth/register');
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      // First user is admin, others are regular users
      role: await User.countDocuments() === 0 ? 'admin' : 'user'
    });
    
    // Create session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };
    
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.session.error = 'Server error. Please try again.';
    res.redirect('/auth/register');
  }
};

// @desc    Show user profile
// @route   GET /auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      return res.status(404).render('pages/error', {
        title: 'User Not Found',
        error: { message: 'User not found' },
        currentPath: req.path
      });
    }
    
    res.render('auth/profile', {
      title: 'My Profile',
      currentPath: req.path,
      user
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

// @desc    Update user profile
// @route   PUT /auth/profile
exports.putUpdateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updateData = { name, bio };
    
    // If avatar was uploaded, add it to update data
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }
    
    const user = await User.findByIdAndUpdate(
      req.session.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Update session data
    req.session.user.name = user.name;
    req.session.user.avatar = user.avatar;
    
    res.redirect('/auth/profile');
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      error,
      currentPath: req.path
    });
  }
};

// @desc    Logout user
// @route   GET /auth/logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
}; 