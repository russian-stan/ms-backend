const express = require('express');
const movieController = require('./../controllers/movieController');

const router = express.Router();

router.get('/category', movieController.getMovies);


module.exports = router;
