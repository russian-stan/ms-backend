const express = require('express');
const movieController = require('./../controllers/movieController');

const router = express.Router();

router.get('/category', movieController.getMovies);
router.get('/movie/:id', movieController.getMovieData);
router.get('/actor/:id', movieController.getActorData);
router.get('/search', movieController.getSerchData);
router.post('/discover', movieController.getDiscoverData);

module.exports = router;
