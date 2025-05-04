// this file is for admin service
//such as get all users, delete user, get user by user id, see their past interactions, ......

const User = require('../models/userModel');
const mongoose = require('mongoose');

//get all user
const getAllUsers = async () => {
    return await User.find({}).select('-password'); //get all information except password

}

//get by user_id

const getUserById = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format'); //because the userid has type ObjectId(string)
    }
    return await User.findById(userId).select('-password');
};


//delete user by user_id 
const deleteUserById = async (userId) => {
    return await User.findByIdAndDelete(userId);
}

module.exports ={
    getAllUsers,
    getUserById,
    deleteUserById
};