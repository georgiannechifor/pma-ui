const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  firstName : {
    type     : String,
    required : [true, 'Please add your first name']
  },
  lastName : {
    type     : String,
    required : [true, 'Please add your last name']
  },
  email : {
    type     : String,
    unique   : true,
    required : [true, 'Please add your email address']
  },
  password : {
    type     : String,
    required : [true, 'Please enter a password for your account']
  },
  team     : String,
  jobTitle : {
    type    : String,
    enum    : ['User', 'Admin', 'SuperAdmin'],
    default : 'User'
  },
  image : {
    data        : Buffer,
    contentType : String
  }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.validatePassword = async function(data) {
  return await bcrypt.compare(data, this.password)
};

UserSchema.methods.getJwtToken = function () {
  return jwt.sign({
    id : this._id
  }, process.env.JWT_SECRET, {
    expiresIn : process.env.JWT_EXPIRES_TIME
  });
}

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);