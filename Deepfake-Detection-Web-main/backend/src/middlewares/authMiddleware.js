/**
 * Filename:   authMiddleware.js
 * Description: This file contains middleware functions for user authentication (by verify token) and authorization (by checking user roles).
 *              It uses the jwt library to verify the token and the User model to get user details from the database.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Adjust path as needed

/**
 * Middleware to validate user token and protect routes
 */
const verifyToken = async (req, res, next) => {
  let token;
  
  // Check for token in cookies or Authorization header
  if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
      return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
      });
  }
  
  try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
          return res.status(401).json({
              success: false,
              message: 'User not found'
          });
      }
      
      // Add user object to request
      req.user = user;
      next();
  } catch (error) {
      return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
      });
  }
};

/**
* Middleware to restrict access based on user roles
*/
const authorize = (...roles) => {
  return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
          return res.status(403).json({
              success: false,
              message: `User role ${req.user.role} is not authorized to access this route`
          });
      }
      next();
  };
};

// Export the middleware functions so that we can use them in routes
module.exports = {
  verifyToken,
  authorize
};