const historyService = require('../services/historyService');
const logService = require('../services/logService');

const saveHistoryController = async (req, res, detectionData) => {
    try {
        // Handle both object and string parameter formats
        let userId, filePath, detectionResult;
        
        if (typeof detectionData === 'object') {
            // If detectionData is an object with properties
            userId = detectionData.userId;
            filePath = detectionData.filePath;
            detectionResult = detectionData.detectionResult;
        } else {
            // If detectionData is just the result string (for backward compatibility)
            userId = req.body.userId || req.user?.id;
            filePath = req.file?.path || 'Unknown';
            detectionResult = detectionData;
        }

        if (!userId) {
            throw new Error('User ID is required');
        }

        const history = await historyService.saveHistory(userId, filePath, detectionResult);
        await logService.createLog(
            userId,
            'detection',
            req.ip,
            { 
                contentPath: filePath,
                result: detectionResult
            }
        );
        res.status(201).json({
            success: true,
            result: {
                detectionResult,
                historyId: history._id
            }
        });
    } catch (error) {
        console.error('Error saving history:', error);
        res.status(500).json({ error: error.message });
    }
};

const getHistoryOfUser = async (req, res) => {
    try{
        const id = req.params.userId;
        const history = await historyService.getHistoryByUserId(id);
        if (!history || history.length === 0){
            console.log('This user has no history.');
            return res.status(404).json({
                success: false,
                message: 'This user has no history.'
            });
        }
        return res.status(200).json({
            success: true,
            data: history
        });
    }
    catch(error){
        console.log('Error occurs when get history of this user:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getAllUserHistory = async (req, res) => {
    try{
        const history = await historyService.getAllHistory();
        if (!history || history.length === 0){
            console.log('System has no history of user detection.');
            return res.status(404).json({
                success: false,
                message: 'System has no history of user detection.'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: history
        });
    }
    catch(error){
        console.log('Error occurs when get history of all user:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getHistoryOfUser, getAllUserHistory, saveHistoryController };