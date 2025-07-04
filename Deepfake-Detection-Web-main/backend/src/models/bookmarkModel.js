const mongoose = require('mongoose');


const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PinterestPin',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//unique bookmark for each user
bookmarkSchema.index({ user: 1, pin: 1 }, { unique: true });

//indexing
bookmarkSchema.index({ user: 1, createdAt: -1 }); 
bookmarkSchema.index({ pin: 1 }); 

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
module.exports = Bookmark;