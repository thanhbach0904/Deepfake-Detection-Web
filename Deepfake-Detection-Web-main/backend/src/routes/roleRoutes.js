const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middlewares/authMiddleware');
const { 
    getAllUsers, 
    getUserById, 
    deleteUser, 
    getUserHistoryById,
    getUserLogsById,
    getSystemStats
} = require('../controllers/adminControllers');

const {getHistoryOfUser} = require('../controllers/historyControllers')
// Routes accessible by all authenticated users
// The request from client must first pass through the verifyToken middleware 
// before reaching the route handler
// See these middleware functions in app/backend/src/middlewares/authMiddleware.js
router.get('/profile', verifyToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'User profile retrieved',
        data: req.user
    });
});

router.get('/users/:userId/history', verifyToken, getUserHistoryById);

// Routes for admins only
// Protected by verifyToken and authorize middlewares
router.get('/admin-dashboard', verifyToken, authorize('admin'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin dashboard accessed successfully'
    });
});

// Get all users
router.get('/users', verifyToken, authorize('admin'), getAllUsers);

// Get system statistics
router.get('/stats', verifyToken, authorize('admin'),  getSystemStats);

// Get user by ID
router.get('/users/:userId', verifyToken, authorize('admin'), getUserById);

// Get user logs by ID
router.get('/users/:userId/logs',verifyToken, authorize('admin'),  getUserLogsById);

// Delete user by ID
router.delete('/users/:userId', verifyToken, authorize('admin'), deleteUser);


module.exports = router;