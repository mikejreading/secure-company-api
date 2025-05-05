const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Not authorized to access this route',
        error: 'No token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token has expired
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTimestamp) {
        return res.status(401).json({
          message: 'Not authorized to access this route',
          error: 'Token has expired'
        });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          message: 'Not authorized to access this route',
          error: 'User no longer exists'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Not authorized to access this route',
          error: 'Invalid token'
        });
      }
      throw jwtError;
    }
  } catch (error) {
    res.status(401).json({ 
      message: 'Not authorized to access this route',
      error: 'Authentication failed'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to perform this action' });
    }
    next();
  };
};
