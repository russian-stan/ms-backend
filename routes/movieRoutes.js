const express = require('express');
const movieController = require('./../controllers/movieController');

const router = express.Router();

router.get('/category', movieController.getMovies);
router.get('/movie/:id', movieController.getMovieData);
router.get('/search', movieController.getSerchData);

module.exports = router;
