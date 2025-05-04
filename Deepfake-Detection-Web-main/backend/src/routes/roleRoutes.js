const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middlewares/authMiddleware');
const { getAllUsers, getUserById, deleteUser } = require('../controllers/adminControllers');
const {getHistoryOfUser, getAllUserHistory} = require('../controllers/historyControllers');
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



// Routes for admins only
// Protected by verifyToken and authorize middlewares
router.get('/admin-dashboard', verifyToken, authorize('admin'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin dashboard accessed successfully'
    });
});
//get user information
router.get('/users', verifyToken, authorize('admin'), getAllUsers);
router.get('/users/:userId', verifyToken, authorize('admin'), getUserById);
router.delete('/users/:userId', verifyToken, authorize('admin'), deleteUser);

//get history information
router.get('/history:userId', verifyToken, authorize('admin'), getHistoryOfUser);
router.get('/history', verifyToken, authorize('admin'), getAllUserHistory);
module.exports = router;