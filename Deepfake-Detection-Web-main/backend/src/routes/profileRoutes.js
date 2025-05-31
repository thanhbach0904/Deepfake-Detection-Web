const express = require('express');
const router = express.Router();
const { getUserProfile, updatePassword } = require('../controllers/profileControllers');
const {verifyToken} = require('../middlewares/authMiddleware');



// GET user profile with statistics
router.get('/me', verifyToken, getUserProfile);

// POST update password
router.post('/update-password',verifyToken, updatePassword);

module.exports = router;