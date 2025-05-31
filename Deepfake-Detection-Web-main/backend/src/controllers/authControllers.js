/**
 * Filename:    authController.js
 * Description: This file contains the controller functions for user authentication including registration and login.
 *              It uses the authService.js to handle the business logic, see the functions in app/backend/src/services/authService.js.
 */
const authService = require('../services/authService'); // Import the auth service
const { validationResult } = require('express-validator'); // For input validation
const logService = require('../services/logService');


const register = async (req, res) => { // Receive the request and response objects as parameters
    const {username, email, password, role} = req.body; // Extract the username, email, password, and role from the request body
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Call the service function to handle registration logic
        // See the function in app/backend/src/services/authService.js
        const result = await authService.registerUser(username, email, password, role);
        
        // Return success response
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                userId: result.id,
                username: result.username,
                email: result.email,
                role: result.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Return 409 Conflict for duplicate email/username errors
        if (error.message === 'Email already in use' || error.message === 'Username already taken') {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }
        
        // For other errors, return 400 Bad Request
        return res.status(400).json({
            success: false,
            message: error.message || 'Registration failed',
        });
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        // Call the service function to handle login logic
        // See the function in app/backend/src/services/authService.js
        const result = await authService.loginUser(email, password);
        
        // Set JWT token in cookie if using cookie-based authentication
        if (result.token) {
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
        }
        
        // Log login event - wrap in try/catch to prevent login failure if logging fails
        try {
            // Make sure we have a valid MongoDB ObjectId before calling createLog
            if (result.user && result.user._id) {
                await logService.createLog(
                    result.user._id.toString(), // Convert to string to ensure proper format
                    'login', 
                    req.ip || '127.0.0.1', 
                    { userAgent: req.headers['user-agent'] }
                );
            }
        } catch (logError) {
            // Log the error but don't fail the login
            console.error('Error creating login log:', logError);
        }
        
        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                userId: result.user.id,
                username: result.user.username,
                email: result.user.email,
                role: result.user.role,
                token: result.token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(401).json({
            success: false,
            message: error.message || 'Invalid credentials',
        });
    }
}

// Add a logout endpoint
const logout = async (req, res) => {
    try {
        // Make sure user exists in the request
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const userId = req.user.id;
        
        // Log the logout event - wrap in try/catch to prevent logout failure if logging fails
        try {
            await logService.createLog(
                userId.toString(), // Convert to string to ensure proper format
                'logout', 
                req.ip || '127.0.0.1'
            );
        } catch (logError) {
            // Log the error but don't fail the logout
            console.error('Error creating logout log:', logError);
        }
        
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Error logging out:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export the functions so that we can use them in routes files
module.exports = {
    register,
    login,
    logout,
};