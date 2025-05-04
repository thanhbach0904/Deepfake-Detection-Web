/**
 * File: authService.js
 * Description: This file contains the service functions perform actual business logic for user registration and login.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Assuming you have a User model

//CRUD

/**
 * Register a new user - Create
 */
const registerUser = async (username, email, password, role) => {
    // Check if user already exists
    const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
        if (existingUser.email === email) {
            throw new Error('Email already in use');
        }
        throw new Error('Username already taken');
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    // See the User model in app/backend/src/models/User.js
    const user = new User({
        username,
        email,
        password: hashedPassword,
        role: role || 'user' // Default to 'user' if role not provided
    });
    
    await user.save();
    
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
    };
};


//login

const loginUser = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`Login failed: No user found with email ${email}`);
    throw new Error('Invalid credentials');
    }
  
  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
      throw new Error('Invalid credentials');
  }
  
  // Generate JWT token
  const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
  );
  
  return {
      token,
      user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
      }
  };
};

// Export the functions so that we can use them in authController.js
module.exports = {
  registerUser,
  loginUser
};