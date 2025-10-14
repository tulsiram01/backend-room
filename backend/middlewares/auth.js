const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({ 
        success: false, 
        message: 'Session expired. Please login again.' 
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Session expired. Please login again.' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed.' 
    });
  }
};

// Admin authorization middleware
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin role required.' 
      });
    }
    
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied.' 
    });
  }
};

// Owner authorization middleware
const ownerAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (req.user.role !== 'owner') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Owner role required.' 
      });
    }
    
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied.' 
    });
  }
};

// Add session timeout middleware
const checkSession = (req, res, next) => {
  // Session will be handled by JWT expiration
  next();
};

module.exports = { 
  auth, 
  adminAuth, 
  ownerAuth, 
  checkSession 
};