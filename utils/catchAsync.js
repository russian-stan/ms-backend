module.exports = (fun) => {
  return (req, res, next) => {
    fun(req, res, next).catch(err => {
      res.status(err.statusCode).json({
        message: err.message,
      });
    });
  }
};
