const Bookmark = require('./../models/bookmarkModel');
const getData = require('../utils/getData');
const catchAsync = require('./../utils/catchAsync');


exports.getMyBookmarks = catchAsync(async (req, res, next) => {
  const favList = await Bookmark.find({user: req.user});

  res.status(200).json({
    status: 'success',
    data: favList
  });
});

exports.addToFavorite = catchAsync(async (req, res, next) => {

  const newBookmark = await Bookmark.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      data: newBookmark
    }
  });
});

exports.removeFromFavorite = catchAsync(async (req, res, next) => {

  res.status(204).json({
    status: 'success',
    data: null
  });
});
