const mongoose = require('mongoose');

// Create a history schema
const historySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //Reference to the User model - use as foreign key
        required: true,
    },
    content_uploaded: {
        type: String, // File path or URL for the uploaded content 
        //processed by middleware be4 adding to dtb
        required: true,
    },
    detection_result: {
        type: String, // Result of the detection process - for example "authentic" or "deepfake"
        required: true,
    },
    user_feedback:{
        type: String,
        default: "correct",
    },
    detection_time: {
        type: Date,
        default: Date.now, // default value is the time that the row is added to database
    },
});

// Export the model so that we can use it in other files
const History = mongoose.model('History', historySchema);
module.exports = History;