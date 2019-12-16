const getData = require('../utils/getData');
const catchAsync = require('./../utils/catchAsync');

exports.getMovies = catchAsync(async (req, res, next) => {
  const pageType = req.query.pageType;
  const page = req.query.page;

  const url = `/movie/${pageType}?api_key=${process.env.MOVIEDB_KEY}&${process.env.MOVIEDB_LANGUAGE}&page=${page}&${process.env.MOVIEDB_REGION}`;

  const data = await getData(url);
  res.status(200).json({
    status: 'success',
    data
  })
});
