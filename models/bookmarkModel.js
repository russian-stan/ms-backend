const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Bookmark must belong to a User!'],
      select: false
    },
    id: {
      type: Number,
      required: [true, 'Bookmark must have a movie id.'],
    },
    poster_path: {
      type: String
    },
    release_date: {
      type: String
    },
    title: {
      type: String
    },
    vote_average: {
      type: Number
    },
    vote_count: {
      type: Number
    }
  },
  {
    versionKey: false
  });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
