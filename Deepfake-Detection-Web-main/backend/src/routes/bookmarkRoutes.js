const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const bookmarkController = require('../controllers/bookmarkControllers');

const router = express.Router();
router.use(verifyToken);

// GET user's bookmarks
router.get('/', bookmarkController.getUserBookmarks);

// GET bookmark status for a specific pin
router.get('/status/:pinId', bookmarkController.checkBookmarkStatus);

// GET bookmark count for a specific pin
router.get('/count/:pinId', bookmarkController.getBookmarkCount);

// POST add a bookmark
router.post('/:pinId', bookmarkController.addBookmark);

// POST toggle bookmark (add if not exists, remove if exists)
router.post('/toggle/:pinId', bookmarkController.toggleBookmark);

// DELETE remove a bookmark
router.delete('/:pinId', bookmarkController.removeBookmark);

module.exports = router;