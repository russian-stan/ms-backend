const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please, tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please, provide us your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please, provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please, provide a password'],
    minlength: 6,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetNumber: String,
  passwordResetExpires: Date
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the passwordConfirm field from DB
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified or just created
  if (!this.isModified('password' || this.isNew)) return next();

  // Subtract one second to ensure that the token is always created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// This method is instance method, that means it's available on all user documents
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword); //--> return boolean
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const cangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < cangedTimestamp;
  }
  return false; // False means NOT changed
};

userSchema.methods.createPasswordResetNumber = function () {
  const ResetNumber = (Math.random() * 100000).toString().split('.')[0];

  this.passwordResetNumber = crypto
    .createHash('sha256')
    .update(ResetNumber)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return ResetNumber;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
