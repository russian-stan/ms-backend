const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const userRouter = require('./routes/userRoutes');
const movieRouter = require('./routes/movieRoutes');
const bookmarkRouter = require('./routes/bookmarkRoutes');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// For Heroku
app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

console.log(`App started in ${process.env.NODE_ENV} mode`);

// Set security HTTP headers
app.use(helmet());

// Body parser, reading data from body into req.body object
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://msearch-app.web.app' : 'http://localhost:8080',
  methods: ['GET','PUT','POST', 'PATCH', 'DELETE','UPDATE'],
  allowedHeaders: ['X-Requested-With', 'X-HTTP-Method-Override', 'Content-Type', 'Accept'],
  credentials: true
}));

// Development logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/movies', movieRouter);
app.use('/api/v1/bookmarks', bookmarkRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find '${req.originalUrl}' on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
