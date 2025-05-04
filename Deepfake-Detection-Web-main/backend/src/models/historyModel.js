const mongoose = require('mongoose');

// Create a history schema
const historySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content_uploaded: { type: String, required: true },
    detection_result: { type: String, required: true },
    user_feedback: {type: String, default: "correct"},
    detection_time: { type: Date, default: Date.now },
});

// Export the model so that we can use it in other files
const History = mongoose.model('History', historySchema);
module.exports = History;