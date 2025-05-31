const mongoose = require('mongoose');

// Create a log schema to track user activity
const logSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    action: { 
        type: String, 
        required: true,
        enum: ['login', 'logout', 'detection', 'feedback', 'profile_view', 'password_change']
    },
    ip_address: { 
        type: String 
    },
    details: {
        type: Object,
        default: {}
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

// Create indexes for faster queries
logSchema.index({ user_id: 1 });
logSchema.index({ timestamp: -1 });
logSchema.index({ action: 1 });

// Export the model
const Log = mongoose.model('Log', logSchema);
module.exports = Log;