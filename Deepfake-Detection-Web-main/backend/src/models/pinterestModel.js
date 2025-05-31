const mongoose = require('mongoose');

// Pinterest pin schema
const pinterestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  imageId: {
    type: String,
    required: [true, 'Cloudinary image ID is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  aiDetection: {
    isAIGenerated: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    fakeProbability: {
      type: Number,
      min: 0,
      max: 1
    },
    realProbability: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient queries
pinterestSchema.index({ createdAt: -1 }); // For sorting by newest/oldest
pinterestSchema.index({ likes: -1 }); // For sorting by popularity
pinterestSchema.index({ tags: 1 }); // For filtering by tags
pinterestSchema.index({ 'aiDetection.isAIGenerated': 1 }); // For filtering AI content

const PinterestPin = mongoose.model('PinterestPin', pinterestSchema);
module.exports = PinterestPin;