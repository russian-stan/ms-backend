const getData = require('./getData.js');

class MovieInfo {
  constructor() {
    this.data = {};
  }

  async getMovieData(url) {
    this.data = await getData(url);
  }

  async getCredits(url) {
    let cast = await getData(url);
    if (cast.length > 0) cast = data.cast.slice(0, 7);
    MovieInfo.assignData(this.data, cast);
  }

  async getTrailer(url) {
    let {results} = await getData(url);
    MovieInfo.assignData(this.data, {trailers: results});
  }

  async getImages(url) {
    let {backdrops} = await getData(url);
    MovieInfo.assignData(this.data, {images: backdrops});
  }

  async getSimilar(url) {
    let {results} = await getData(url);
    MovieInfo.assignData(this.data, {similar: {movies: results}});
  }

  parseDetails() {
    const features = ['production_countries', 'genres', 'crew'];
    features.forEach(feature => {
      if (this.data[feature].length > 0) {
        this.data[feature] = Array.from(new Set(this.data[feature].map(el => el.name))).join(`, `);
      } else {
        this.data[feature] = null;
      }
    });
  }

  static assignData(target, obj) {
    Object.assign(target, obj);
  }
}

module.exports = MovieInfo;
