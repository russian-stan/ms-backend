const User = require('./../models/userModel');
const Bookmark = require('./../models/bookmarkModel');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('./../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Email = require('../utils/Email');
const getMessage = require('../utils/dictionary.js');


const signToken = (id, name) => {
  return jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id, user.name);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'none'
  };

  res.cookie('jwt', token, cookieOptions);

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

const checkToken = (req) => {
  let token;

  // Getting token an check if it actually exists
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  return token;
};


const signup = asyncHandler(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  await new Email(newUser, '').sendWelcome();

  createSendToken(newUser, 201, req, res);
});

const login = asyncHandler(async (req, res, next) => {
  const {email, password} = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError(getMessage('incompleteCredentials'), 400));
  }

  // 2) Check if user exist & password is correct
  const user = await User.findOne({email}).select('+password'); //--> select('+password') needs because we put 'select: false' in userSchema

  if (!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError(getMessage('credentialsFail'), 401));
  }

  // 3) If everything is ok, send token to client
  createSendToken(user, 200, req, res);
});

const logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 100),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'none'
  });
  res.status(200).json({ status: 'success' });
};

const protect = asyncHandler(async (req, res, next) => {

  let token = checkToken(req);

  if (!token) {
    return next(new AppError(getMessage('notLoggedIn'), 401));
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError(getMessage('userIsNotExists'), 401));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError(getMessage('changedPassword'), 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; //--> put the user's entire data on the request
  next();
});

const checkAuthentication = asyncHandler(async (req, res, next) => {

  let isAuthorized = false;
  let token = checkToken(req);
  let userData = {};

  if(token) {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser.changePasswordAfter(decoded.iat)) {
      isAuthorized = true;
      userData.name = currentUser.name;
      userData.email = currentUser.email;
      userData.id = currentUser._id;
    }
  } else {
    isAuthorized = false;
  }

  res.status(200).json({
    status: 'success',
    data: {
      ...userData,
      isAuthorized
    }
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user on POSTed email
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return next(new AppError(getMessage('wrongEmail'), 404));
  }

  // 2) Generate the random reset token
  const ResetNumber = user.createPasswordResetNumber();

  // save needful options in current user object in DB and turn off all required validators in userSchema
  await user.save({validateBeforeSave: false});

  // 3) Send it to user's email
  try {
    await new Email(user, ResetNumber).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Reset number has been sent to email!'
    })
  } catch (err) {
    user.passwordResetNumber = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave: false});

    next(new AppError(getMessage('sendEmailError'), 500));
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on token
  const hashedResetNumber = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetNumber: hashedResetNumber,
    passwordResetExpires: {$gt: Date.now()}
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    next(new AppError(getMessage('expiredToken'), 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetNumber = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update passwordChangedAt for the user - line 52 in userModel

  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

const updatePassword = asyncHandler(async (req, res, next) => {

  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if posted current password is correct
  if (!await user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError(getMessage('wrongCurrentPassword'), 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in and send JWT
  createSendToken(user, 200, req, res);
});

const updateMe = asyncHandler(async (req, res, next) => {
  const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) {
        newObj[el] = obj[el];
      }
    });
    return newObj;
  };

  // 2) Filter out fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

const deleteMe = asyncHandler(async (req, res, nex) => {

  await User.findByIdAndDelete(req.user.id);
  await Bookmark.remove({user: req.user.id});

  res.status(204).json({
    status: 'success',
    data: null
  });
});


module.exports = {
  signup,
  login,
  logout,
  protect,
  checkAuthentication,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateMe,
  deleteMe
};
