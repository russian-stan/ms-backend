const AppError = require('../utils/AppError');
const getMessage = require('../utils/dictionary.js');
const translate = require('translate');

const translateMessage = async (message) => {
  if(process.env.APP_LANGUAGE === 'ru') {
    return await translate(message, {
      to: 'ru',
      engine: process.env.TRANSLATE_ENGINE,
      key: process.env.YANDEX_TRANSLATE_API_KEY
    });
  } else {
    return message;
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please, use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = async (err) => {
  const errors = Object.values(err.errors).map(el => el.message).join('. ');

  const message = `${getMessage('invalidInput')}. ${await translateMessage(errors)}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  const message = getMessage('invalidToken');
  return new AppError(message, 401);
};

const handleJWTExpiredError = () => {
  const message = getMessage('expiredToken');
  return new AppError(message, 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if(err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: getMessage('abstractMessage')
    })
  }
};

module.exports = async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if(process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign({}, err, {message: err.message});

    if(error.name === 'CastError') error = handleCastErrorDB(error);
    if(error.code === 11000) error = handleDuplicateFieldsDB(error);
    if(error.name === 'ValidationError') error = await handleValidationErrorDB(error);
    if(error.name ==='JsonWebTokenError') error = handleJWTError();
    if(error.name ==='TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
