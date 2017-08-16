var request = require('request');
var User = require('../app/models/user');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

/************************************************************/
// Add additional utility functions below
/************************************************************/

exports.isUserLoggedIn = function(req, res, next) {
  if (!req.session.user) {
    // console.log('NO SESSION, REDIRECTING!!!!!!!!!');
    // console.log('SESSION: ', req.session);
    res.redirect('/login');
  } else {
    // console.log('VALID LOGIN: ', req.session);
    next();
  }
  };

  exports.isValidUser = function(req, res, next) {
   // console.log('THE REQUEST:', req);
   // if (req.body.username) {
   //    req.session.user = req.body.username;
   //    res.redirect('/');
   //    // next();
   //  }
   //  else {
   //    res.redirect('/login');
   //  }

   var user = new User({username: req.body.username}).fetch().then(function(found) {
      if (found) {
        // pass found.attributes.password into bcrypt
        bcrypt.compare(req.body.password, found.attributes.password, function(error, success) {
          if (error) {
            console.log(found.attributes);
              console.log('🙁🙁😡 WRONG PASSWORD');
              console.log('FOUND ATTRIBUTE PASSWORD: ', found.attributes.password);
              console.log('REQ BODY PASSWORD: ', req.body.password);
              res.redirect('/login');
          } else {
            console.log(found.attributes);
            req.session.user = req.body.username;
            console.log('😇 SUCCESS: CORRECT PASSWORD');
            res.redirect('/');
          }
        });

      } else {
        res.redirect('/login');
      }
    });
  };


  //
  // hashPassword: function (model, attributes, options) {
  //   var hash = bcrypt.hashSync(model.get('password'));
  //   model.set('password', hash);
  // },
  //
  // comparePasswords: function(passwordAttempt, callback) {
  //   bcrypt.compare(passwordAttempt, this.get('password'), function(error, success) {
  //     callback(success);
  //   });
  // }
