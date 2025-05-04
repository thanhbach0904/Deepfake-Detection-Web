//hitory service
//for admin and user
//user can only view their own history
//admin can view all history, get history of a specific user
//there will be no delete history service because the system need to use history for future uses

const History = require('../models/historyModel');
const mongoose = require('mongoose');

//get history of specific user - both user and admin can use
const saveHistory = async (userId, filePath, detectionResult) => {
    try {
        console.log('userId:', userId, 'filePath:', filePath, 'detectionResult:', detectionResult);
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('UserId is not valid', userId);
            throw new Error('Invalid userId');
        }

        const history = await History.create({
            user_id: userId,
            content_uploaded: filePath,
            detection_result: detectionResult,
        });
        return history;
    } catch (error) {
        console.error('Error saving history:', error);
        throw error;
    }
};


const getHistoryByUserId = async (userId) => {
    return await History.find({user_id: userId}).sort({detection_time: -1}); //detection time in descending order
}

//get all history - only admin

const getAllHistory = async () => {
    return await History.find({}).sort({dectection_time: -1});
}

module.exports = { getHistoryByUserId, getAllHistory, saveHistory };