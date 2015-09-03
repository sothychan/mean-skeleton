var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var db = require('./config/mongo')(mongoose);
var session = require('express-session');
var bcrypt = require('bcrypt');

var paginate = require('express-paginate');

// sessions and authentication support
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'app secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());


// allow CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.set('passport', passport);

app.use(paginate.middleware(6, 6));

app.set('paginate', paginate);

/** Routes! */
var Router = express.Router();
app.use(Router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var dbConn = mongoose.connection;
dbConn.on('error', console.error.bind(console, 'connection error:'));
dbConn.once('open', function () {
  console.log('Connected');
  // automatically walk the routes/ directory and configure all of the routes.
  require('./router')(app, mongoose, Router);

  var User = mongoose.model('user');

  passport.use(new LocalStrategy(function (username, password, done) {
    User.findOne({email: username.toLowerCase()}).then(function (err, userDoc) {
      if (err) { throw err; }

      if (!userDoc) {
        return done(null, false, {err: 'User not found'});
      } else {
        bcrypt.compare(password, userDoc.get('userSalt'), function (err, res) {
          if (res) {
            return done(null, userDoc);
          } else {
            return done(null, false, {err: 'User not found'});
          }
        });
      }

    });
  }));

  passport.use(new BearerStrategy(function (token, done) {
    User.findOne({userSalt: token}).then(function (err, userDoc) {
      if (err) { throw err; }

      if (userDoc) {
        return done(null, model);
      } else {
        return done(null, false);
      }
    });
  }));

});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

passport.serializeUser(function (user, done) {
  done(null, user.get('userSalt'));
});

passport.deserializeUser(function (id, done) {
  User.findOne({userSalt: id}).then(function (userDoc) {
    done(null, userDoc);
  });
});


module.exports = app;



