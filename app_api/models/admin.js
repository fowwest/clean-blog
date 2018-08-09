var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  passwordConf: {
    type: String,
    required: true,
  },
});

//authenticate input against database
AdminSchema.statics.authenticate = function (email, password, callback) {
  Admin.findOne({ email: email })
    .exec(function (err, admin) {
      if (err) {
        return callback(err)
      } else if (!admin) {
        var err = new Error('Admin not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, admin.password, function (err, result) {
        if (result === true) {
          return callback(null, admin);
        } else {
          return callback();
        }
      })
    });
}

//hashing a password before saving it to the database
AdminSchema.pre('save', function (next) {
  var admin = this;
  bcrypt.hash(admin.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    admin.password = hash;
    next();
  })
});

var Admin = module.exports = mongoose.model('Admin', AdminSchema);
