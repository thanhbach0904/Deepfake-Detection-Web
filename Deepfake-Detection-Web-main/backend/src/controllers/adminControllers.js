const adminService = require('../services/adminService');
const historyService = require('../services/historyService');
const logService = require('../services/logService');

const getAllUsers = async (req, res) => {
    try {
        const users = await adminService.getAllUsers();
        res.status(200).json({success:true, data:users});
    }
    catch(error){
        console.error('Error occurs when getting all users:', error);
        return res.status(500).json({
            success:false ,
            message: error.message
        })
    }
};

//get by user id

const getUserById = async (req, res) => {
    try {
        const id = req.params.userId;
        const user = await adminService.getUserById(id);
        if (!user){
            return res.status(404).json({
                success:false,
                message: 'User not found'
            });
        }
        return res.status(200).json({
            success:true,
            data:user
        });
    }
    catch(error){
        console.error('Error occurs when getting user with id:', error);
        return res.status(500).json({
            success:false,
            message: error.message
        });
    }
};

//delete user by id

const deleteUser = async (req, res) => {
    try {
        const id = req.params.userId;
        const user = await adminService.deleteUserById(id);
        if (!user){
            return res.status(404).json({
                success:false,
                message: 'User not found'
            });
        }
        return res.status(200).json({
            success:true,
            data:user
        });
    }
    catch(error){
        console.error('Error occurs when deleting user with id:', error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

// Get user history by ID
const getUserHistoryById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const history = await historyService.getHistoryByUserId(userId);
        
        if (!history || history.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No history found for this user'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error getting user history:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user activity logs by ID
const getUserLogsById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const logs = await logService.getLogsByUserId(userId);
        
        if (!logs || logs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No logs found for this user'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Error getting user logs:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get system statistics for admin dashboard
const getSystemStats = async (req, res) => {
    try {
        // Get total user count
        const users = await adminService.getAllUsers();
        const totalUsers = users.length;
        
        // Get active users count (logged in within last 24 hours)
        const activeUsers = await logService.getActiveUsers(24);
        
        // Get total detections
        const allHistory = await historyService.getAllHistory();
        const totalDetections = allHistory.length;
        const deepfakeDetections = allHistory.filter(h => h.detection_result === 'deepfake').length;
        const authenticDetections = allHistory.filter(h => h.detection_result === 'authentic').length;
        
        // Get most recent logs
        const recentLogs = await logService.getAllLogs(20);
        
        return res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers
                },
                detections: {
                    total: totalDetections,
                    deepfake: deepfakeDetections,
                    authentic: authenticDetections
                },
                recentLogs
            }
        });
    } catch (error) {
        console.error('Error getting system statistics:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    deleteUser,
    getUserHistoryById,
    getUserLogsById,
    getSystemStats
}