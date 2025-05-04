/**
 * Filename: validationMiddleware.js
 * Description: This file contains validation middleware functions for validating user registration and login requests.
 */
const { body } = require('express-validator');

// Validation middleware for user registration
const validateRegistration = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
];

// Validation middleware for user login
const validateLogin = [
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

module.exports = {
    validateRegistration,
    validateLogin
};