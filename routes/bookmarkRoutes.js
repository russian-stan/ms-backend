const express = require('express');
const bookmarkController = require('./../controllers/bookmarkController.js');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(bookmarkController.getMyBookmarks)
  .post(bookmarkController.addToFavorite)
  .delete(bookmarkController.removeFromFavorite);

module.exports = router;
