const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

console.log(`App started in ${process.env.NODE_ENV} mode`);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
app.options('*', cors());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/', (req, res, next) => {
  res.send('Hello')
});

module.exports = app;
