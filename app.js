const express = require('express');
const morgan = require('morgan');
const app = express();

console.log(`App started in ${process.env.NODE_ENV} mode`);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

module.exports = app;
