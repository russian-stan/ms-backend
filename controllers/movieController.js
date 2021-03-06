const fetchData = require('../utils/fetchData');
const asyncHandler = require('./../utils/asyncHandler');
const Movie = require('../utils/MovieInfo.js');

const sendResponse = async (res, url) => {
  const data = await fetchData(url);
  res.status(200).json({
    status: 'success',
    data
  });
};

const getMovies = asyncHandler(async (req, res, next) => {
  const pageType = req.query.pageType;
  const page = req.query.page;
  const url = `/movie/${pageType}?api_key=${process.env.MOVIEDB_KEY}&language=${process.env.MOVIEDB_LANGUAGE}&region=${process.env.MOVIEDB_REGION}&page=${page}`;
  await sendResponse(res, url);
});

const getSimilar = asyncHandler(async (req, res, next) => {
  const id = req.query.id;
  const page = req.query.page;
  const url = `/movie/${id}/similar?api_key=${process.env.MOVIEDB_KEY}&language=${process.env.MOVIEDB_LANGUAGE}&page=${page}`;
  await sendResponse(res, url);
});

const getSerchData = asyncHandler(async (req, res, next) => {
  const searchQuery = req.query.searchQuery;
  const page = req.query.page;
  const url = `/search/movie?api_key=${process.env.MOVIEDB_KEY}&language=${process.env.MOVIEDB_LANGUAGE}&query=${searchQuery}&page=${page}&include_adult=true`;
  await sendResponse(res, url);
});

const getDiscoverData = asyncHandler(async (req, res, next) => {
  let actorID = '';

  if (req.body.actor) {
    const url = `/search/person?api_key=${process.env.MOVIEDB_KEY}&language=${process.env.MOVIEDB_LANGUAGE}&query=${req.body.actor}&page=1&include_adult=false&region=${req.body.country}`;
    const data = await fetchData(url);
    if (data.results.length > 0 && 'id' in data.results[0]) {
      actorID = data.results[0].id;
    }
  }

  const url =
    '/discover/movie?api_key=' + process.env.MOVIEDB_KEY +
    '&' + 'language=' + process.env.MOVIEDB_LANGUAGE +
    '&' + 'region=' + req.body.country +
    '&' + 'sort_by=' + req.body.sort +
    '&' + 'include_adult=true&include_video=false' +
    '&' + 'page=' + req.body.page +
    '&' + 'release_date.gte=' + req.body.yearFrom +
    '&' + 'release_date.lte=' + req.body.yearTill +
    '&' + 'vote_average.gte=' + req.body.rate +
    '&' + 'with_genres=' + req.body.genere +
    '&' + 'with_people=' + actorID;

  await sendResponse(res, url);
});

const getURL = (id, url) => {
  const urls = {
    movieDataURL: `/movie/${id}?api_key=${process.env.MOVIEDB_KEY}&language=${process.env.MOVIEDB_LANGUAGE}`,
    creditsURL: `/movie/${id}/credits?api_key=${process.env.MOVIEDB_KEY}`,
    trailerURL: `/movie/${id}/videos?api_key=${process.env.MOVIEDB_KEY}&language=${process.env.MOVIEDB_LANGUAGE}`,
    imagesURL: `/movie/${id}/images?api_key=${process.env.MOVIEDB_KEY}`,
  };
  return urls[url]
};

const initPipeline = async (id) => {
  const movie = new Movie();
  await movie.getMovieData(getURL(id, 'movieDataURL'));
  await movie.getCredits(getURL(id, 'creditsURL'));
  await movie.getTrailer(getURL(id, 'trailerURL'));
  await movie.getImages(getURL(id, 'imagesURL'));
  movie.parseDetails();

  return movie;
};

const getMovieData = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const data = await initPipeline(id);
  res.status(200).json({
    status: 'success',
    data
  });
});

const getActorData = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const urls = {
    info: `/person/${id}?api_key=${process.env.MOVIEDB_KEY}&language=${process.env.MOVIEDB_LANGUAGE}`,
    images: `/person/${id}/images?api_key=${process.env.MOVIEDB_KEY}`,
    movies: `/person/${id}/combined_credits?api_key=${process.env.MOVIEDB_KEY}&language=${process.env.MOVIEDB_LANGUAGE}`
  };

  const data = {};

  async function processLoop() {
    for (const item in urls) {
      try {
        const resp = await fetchData(urls[item]);
        Object.assign(data, {[item]: resp})
      } catch {
        Object.assign(data, {[item]: null})
      }
    }
  }

  await processLoop();

  res.status(200).json({
    status: 'success',
    data
  })
});

module.exports = {
  getMovies,
  getSimilar,
  getSerchData,
  getDiscoverData,
  getMovieData,
  getActorData
};
