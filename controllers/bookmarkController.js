const Bookmark = require('./../models/bookmarkModel');
const catchAsync = require('./../utils/catchAsync');

const getMyBookmarks = catchAsync(async (req, res, next) => {
  const favList = await Bookmark.find({user: req.user});

  res.status(200).json({
    status: 'success',
    data: favList
  });
});

const addToFavorite = catchAsync(async (req, res, next) => {

  const newBookmark = await Bookmark.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      data: newBookmark
    }
  });
});

const removeFromFavorite = catchAsync(async (req, res, next) => {
  await Bookmark.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  getMyBookmarks,
  addToFavorite,
  removeFromFavorite
};
