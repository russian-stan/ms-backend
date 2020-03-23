const fetchData = require('./fetchData.js');

class MovieInfo {
  constructor() {
    this.movieInfo = {};
  }

  async getMovieData(url) {
    this.movieInfo = await fetchData(url);
  }

  async getCredits(url) {
    let cast = await fetchData(url);
    if (cast.length > 0) cast = data.cast.slice(0, 7);
    MovieInfo.assignData(this.movieInfo, cast);
  }

  async getTrailer(url) {
    let {results} = await fetchData(url);
    MovieInfo.assignData(this.movieInfo, {trailers: results});
  }

  async getImages(url) {
    let {backdrops} = await fetchData(url);
    MovieInfo.assignData(this.movieInfo, {images: backdrops});
  }

  parseDetails() {
    const features = ['production_countries', 'genres', 'crew'];
    features.forEach(feature => {
      if (this.movieInfo[feature].length > 0) {
        this.movieInfo[feature] = Array.from(new Set(this.movieInfo[feature].map(el => el.name))).join(`, `);
      } else {
        this.movieInfo[feature] = null;
      }
    });
  }

  static assignData(target, obj) {
    Object.assign(target, obj);
  }
}

module.exports = MovieInfo;
