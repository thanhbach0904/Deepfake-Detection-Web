const mongoose = require('mongoose');

//Create a user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a name'],
        unique: [true, 'Name already exists'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: [true, 'Email already exists'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    role: {
        type: String,
        required: true,
        enum: ['user',  'admin'],
        default: 'user',
    },
});

// Export the model so that we can use it in other files
const User = mongoose.model('User', userSchema);
module.exports = User;