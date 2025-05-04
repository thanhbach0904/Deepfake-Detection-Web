const adminService = require('../services/adminService');

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

module.exports = {
    getAllUsers,
    getUserById,
    deleteUser
}