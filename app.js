require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

console.log(process.env.HEROKU_URL);
console.log(process.env.MONGODB_URI);

// Db connection
require('./app_api/models/db');

// Routes
var index = require('./app_server/routes/index');
var admin = require('./app_server/routes/admin');
var blog = require('./app_server/routes/blog');
var blogApi = require('./app_api/routes/blog');

var app = express();

app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, './app_server/views'));
app.set('view engine', 'jade');

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/', admin);
app.use('/', blog);
app.use('/api', blogApi);


var fs = require('fs'),
    AWS = require('aws-sdk'),
    s3 = new AWS.S3('admin-blog-assets', {
        accessKeyId: 'AKIAICIVYGTKIT2Z35DQ',
        secretAccessKey: '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'});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
