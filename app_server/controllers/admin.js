var mongoose = require('mongoose');
var Admin = mongoose.model('Admin');
var request = require('request');

var apiOptions = {
  server: 'http://localhost:3000'
};

// if (process.env.NODE_ENV === 'production') {
//   apiOptions.server = 'https://infinite-springs-12949.herokuapp.com';
// }

var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

// Requires login middleware
module.exports.requiresLogin = function (req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

module.exports.registerAdmin = function(req, res, next) {
	
  // confirm that admin typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var adminData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    Admin.create(adminData, function (error, admin) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = admin._id;
        return res.redirect('/');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    Admin.authenticate(req.body.logemail, req.body.logpassword, function (error, admin) {
      if (error || !admin) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = admin._id;
        return res.redirect('/');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
};

module.exports.loginPage = function(req, res) {
  res.render('login', {});
}

module.exports.registerPage = function(req, res) {
  res.render('register', {});
}

module.exports.loginAdmin = function(req, res, next) {
	if (req.body.logemail && req.body.logpassword) {
	    Admin.authenticate(req.body.logemail, req.body.logpassword, function (error, admin) {
	      if (error || !admin) {
	        var err = new Error('Wrong email or password.');
	        err.status = 401;
	        return next(err);
	      } else {
	        req.session.userId = admin._id;
	        return res.redirect('/');
	      }
	    });
	  } else {
	    var err = new Error('All fields required.');
	    err.status = 400;
	    return next(err);
	  }
};

module.exports.getProfile = function (req, res, next) {
  Admin.findById(req.session.userId)
      .exec(function (error, admin) {
      if (error) {
        return next(error);
      } else {
          if (req.session) {
            console.log('session exists' + ' ' + req.session.userId)
          }
          res.render('profile', {name: admin.username, isAdmin: true});
        }
    });
};

module.exports.logout = function(req, res, next) {
  if (req.session) {
    console.log('session being destroyed');
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
        }
    });
  }
};

