const getData = require('../utils/getData');
const catchAsync = require('./../utils/catchAsync');
const Movie = require('../utils/MovieInfo.js');

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

exports.getSerchData = catchAsync(async (req, res, next) => {
  const searchQuery = req.query.searchQuery;
  const page = req.query.page;
  console.log({searchQuery});
  const url = `/search/movie?api_key=${process.env.MOVIEDB_KEY}&${process.env.MOVIEDB_LANGUAGE}&query=${searchQuery}&page=${page}&include_adult=true`;

  const data = await getData(url);
  res.status(200).json({
    status: 'success',
    data
  })
});

exports.getDiscoverData = catchAsync(async (req, res, next) => {

  let actorID = '';

  if (req.body.actor) {
    const url = `/search/person?api_key=${process.env.MOVIEDB_KEY}&${process.env.MOVIEDB_LANGUAGE}&query=${req.body.actor}&page=1&include_adult=false&region=${req.body.country}`;
    const data = await getData(url);
    if (data.results.length > 0 && 'id' in data.results[0]) {
      actorID = data.results[0].id;
    }
  }

  const url = '/discover/movie?api_key=' + process.env.MOVIEDB_KEY +
    '&' + process.env.MOVIEDB_LANGUAGE +
    '&' + 'region=' + req.body.country +
    '&' + 'sort_by=' + req.body.sort +
    '&' + 'include_adult=true&include_video=false' +
    '&' + 'page=' + req.body.page +
    '&' + 'release_date.gte=' + req.body.yearFrom +
    '&' + 'release_date.lte=' + req.body.yearTill +
    '&' + 'vote_average.gte=' + req.body.rate +
    '&' + 'with_genres=' + req.body.genere +
    '&' + 'with_people=' + actorID;

  console.log(url);

  const data = await getData(url);

  res.status(200).json({
    status: 'success',
    data
  })
});

const getURL = (id, url) => {
  const urls = {
    movieDataURL: `/movie/${id}?api_key=${process.env.MOVIEDB_KEY}&${process.env.MOVIEDB_LANGUAGE}`,
    creditsURL: `/movie/${id}/credits?api_key=${process.env.MOVIEDB_KEY}`,
    trailerURL: `/movie/${id}/videos?api_key=${process.env.MOVIEDB_KEY}&${process.env.MOVIEDB_LANGUAGE}`,
    imagesURL: `/movie/${id}/images?api_key=${process.env.MOVIEDB_KEY}`,
    similarURL: `/movie/${id}/similar?api_key=${process.env.MOVIEDB_KEY}&${process.env.MOVIEDB_LANGUAGE}&page=1`,
  };
  return urls[url]
};

const initPipeline = async (id) => {
  const movie = new Movie();
  await movie.getMovieData(getURL(id, 'movieDataURL'));
  await movie.getCredits(getURL(id, 'creditsURL'));
  await movie.getTrailer(getURL(id, 'trailerURL'));
  await movie.getImages(getURL(id, 'imagesURL'));
  await movie.getSimilar(getURL(id, 'similarURL'));
  movie.parseDetails();

  return movie;
};

exports.getMovieData = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const data = await initPipeline(id);

  res.status(200).json({
    status: 'success',
    ...data
  });
});
