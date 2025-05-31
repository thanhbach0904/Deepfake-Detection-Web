const User = require('../models/userModel');
const historyService = require('../services/historyService');
const logService = require('../services/logService');

// Get user profile with statistics
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user information
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's detection history
        const history = await historyService.getHistoryByUserId(userId);
        
        // Calculate statistics
        const totalDetections = history.length;
        const deepfakeDetections = history.filter(h => h.detection_result === 'deepfake').length;
        const authenticDetections = history.filter(h => h.detection_result === 'authentic').length;
        
        // Get recent user activity logs
        const activityLogs = await logService.getLogsByUserId(userId, 10);

        // Log this profile view
        await logService.createLog(
            userId, 
            'profile_view', 
            req.ip
        );
        
        return res.status(200).json({
            success: true,
            data: {
                user,
                statistics: {
                    totalDetections,
                    deepfakeDetections,
                    authenticDetections
                },
                recentHistory: history.slice(0, 5),
                recentActivity: activityLogs
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update user password
const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Check if all required fields are present
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Both current and new password are required'
            });
        }

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if current password is correct
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        // Log password change
        await logService.createLog(
            userId, 
            'password_change', 
            req.ip
        );

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getUserProfile,
    updatePassword
};