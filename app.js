const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');
const movieRouter = require('./routes/movieRoutes.js');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

console.log(`App started in ${process.env.NODE_ENV} mode`);

// Body parser, reading data from body into req.body object
app.use(express.json({limit: '10kb'}));

app.use(cors());
app.options('*', cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/users', userRouter);
app.use('/api/v1/movies', movieRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find '${req.originalUrl}' on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
