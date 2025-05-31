const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { verifyToken, authorize } = require('../middlewares/authMiddleware');
const pinterestController = require('../controllers/pinterestControllers');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all pins with optional filtering
router.get('/pins', pinterestController.getPins);

// GET a single pin by ID
router.get('/pins/:id', pinterestController.getPinById);

// GET pins by current user
router.get('/my-pins', pinterestController.getUserPins);

// GET pins by specific user ID
router.get('/user-pins/:userId', pinterestController.getUserPins);

// POST create a new pin (no file upload needed here as Cloudinary URL is provided in the request body)
router.post('/pins', pinterestController.createPin);

//POST view a pin
router.post('/pins/:id/view', pinterestController.viewPin);

// POST like a pin
router.post('/pins/:id/like', pinterestController.likePin);

// POST unlike a pin
router.post('/pins/:id/unlike', pinterestController.unlikePin);

// DELETE a pin
router.delete('/pins/:id', pinterestController.deletePin);


// POST route to handle file upload + create pin
router.post('/pins/upload', upload.single('file'), pinterestController.uploadAndCreatePin);

// File upload endpoint for Pinterest images
// This endpoint handles the direct file upload before sending to Cloudinary
router.post('/upload-image', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Return the file path which can be used to access the file
    const filePath = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        filePath,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file'
    });
  }
});

// Admin routes
router.use(authorize('admin'));

// Admin route to get all pins (could include additional data or actions)
router.get('/admin/all-pins', pinterestController.getPins);

module.exports = router;
