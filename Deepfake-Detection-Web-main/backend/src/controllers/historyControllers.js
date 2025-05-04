const historyService = require('../services/historyService');

const getHistoryOfUser = async (req, res) => {
    try{
        const id = req.params.userId;
        const history = await historyService.getHistoryByUserId(id);
        if (!history){
            console.log('This user has no history.');
            return res.status(404).json({
                success:false,
                message: error.message
            });
        }
        return res.status(200).json({
            success:true,
            data:history
        });
    }
    catch(error){
        console.log('Error occurs when get history of this user:', error);
        res.status(500).json({
            success:false,
            message: error.message
        });
    }
};


const getAllUserHistory = async (req, res) => {
    try{
        const history = await historyService.getAllHistory();
        if (!history){
            console.log('System has no history of user detection.');
            return res.status(404).json({
                success:false,
                message: error.message
            });
        }
    }
    catch(error){
        console.log('Error occurs when get history of all user:', error);
        res.status(500).json({
            success:false,
            message: error.message
        });
    }
};

module.exports = {getHistoryOfUser, getAllUserHistory};