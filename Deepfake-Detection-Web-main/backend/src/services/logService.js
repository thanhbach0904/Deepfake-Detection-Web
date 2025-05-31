const Log = require('../models/logModel');
const mongoose = require('mongoose');

// Create a new log entry
const createLog = async (userId, action, ipAddress, details = {}) => {
    try {
        // Try to convert the userId to a valid ObjectId
        let validUserId = userId;
        
        // If userId is not already a valid ObjectId, try to convert it
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            try {
                // If it's a string that might represent an ObjectId
                if (typeof userId === 'string' && userId.match(/^[0-9a-fA-F]{24}$/)) {
                    validUserId = mongoose.Types.ObjectId(userId);
                } else {
                    console.error('Invalid userId format:', userId);
                    throw new Error('Invalid userId format');
                }
            } catch (err) {
                console.error('Failed to convert userId to ObjectId:', err);
                throw new Error('Invalid userId');
            }
        }

        const log = await Log.create({
            user_id: validUserId,
            action,
            ip_address: ipAddress || '127.0.0.1',
            details: details || {},
            timestamp: new Date()
        });
        
        return log;
    } catch (error) {
        console.error('Error creating log:', error);
        throw error;
    }
};

// Get logs for a specific user
const getLogsByUserId = async (userId, limit = 100) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid userId');
        }

        return await Log.find({ user_id: userId })
            .sort({ timestamp: -1 })
            .limit(limit);
    } catch (error) {
        console.error('Error getting logs for user:', error);
        throw error;
    }
};

// Get all logs (for admin)
const getAllLogs = async (limit = 500) => {
    try {
        return await Log.find({})
            .sort({ timestamp: -1 })
            .limit(limit);
    } catch (error) {
        console.error('Error getting all logs:', error);
        throw error;
    }
};

// Get logs by action type
const getLogsByAction = async (action, limit = 100) => {
    try {
        return await Log.find({ action })
            .sort({ timestamp: -1 })
            .limit(limit);
    } catch (error) {
        console.error('Error getting logs by action:', error);
        throw error;
    }
};

// Get active users (users who have logged in within a specified timeframe)
const getActiveUsers = async (timeframeInHours = 24) => {
    try {
        const timeframeMs = timeframeInHours * 60 * 60 * 1000;
        const cutoffTime = new Date(Date.now() - timeframeMs);

        // Find users who have logged in within the timeframe
        // Use distinct to avoid counting the same user multiple times
        const activeUserIds = await Log.distinct('user_id', {
            action: 'login',
            timestamp: { $gte: cutoffTime }
        });

        return activeUserIds.length;
    } catch (error) {
        console.error('Error getting active users count:', error);
        // Return 0 instead of throwing error
        return 0;
    }
};

module.exports = {
    createLog,
    getLogsByUserId,
    getAllLogs,
    getLogsByAction,
    getActiveUsers
};