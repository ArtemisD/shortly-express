var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));



app.get('/', util.isUserLoggedIn,
  function(req, res) {
    res.render('index');
  });

app.get('/create', util.isUserLoggedIn,
  function(req, res) {
    res.render('index');
  });

app.get('/links', util.isUserLoggedIn,
  function(req, res) {
    Links.reset().fetch().then(function(links) {
      res.status(200).send(links.models);
    });
  });

app.post('/links', util.isUserLoggedIn,
  function(req, res) {
    var uri = req.body.url;

    if (!util.isValidUrl(uri)) {
      console.log('Not a valid url: ', uri);
      return res.sendStatus(404);
    }

    new Link({
      url: uri
    }).fetch().then(function(found) {
      if (found) {
        console.log('FOUND: ', found);
        res.status(200).send(found.attributes);
      } else {
        util.getUrlTitle(uri, function(err, title) {
          if (err) {
            console.log('Error reading URL heading: ', err);
            return res.sendStatus(404);
          }

          Links.create({
            url: uri,
            title: title,
            baseUrl: req.headers.origin
          })
            .then(function(newLink) {
              res.status(200).send(newLink);
            });
        });
      }
    });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

//login
app.get('/login',
  function(req, res) {
    res.render('login');
  });

// app.post('/login',
//   function(req, res) {
//     new User({
//         username: req.body.username
//       }).fetch()
//       .then(function(model) {
//         if (!model) {
//           res.redirect('/login');
//         } else {
//           //bcrypt method?
//           model.comparePasswords(req.body.password, function(success) {
//             if (success) {
//               //login to session?
//
//             } else {
//               res.redirect('/login');
//             }
//           });
//         }
//       });
//   });

app.post('/login', util.isValidUser
  // function(req, res){
  //   req.session.user = {
  //     username: req.body.username,
  //     password: req.body.password
  //   };
  //   var results;
  //   new User({username: req.body.username}).fetch().then(function(found) {
  //     if (found) {
  //       console.log('FOUND: ', found, '\n', 'USERNAME: ', req.body.username);
  //       res.redirect('/');
  //     } else {
  //       res.redirect('/login');
  //     }
  //   });
  //  // res.render('index');npm test
  //
  // }
);

app.get('/signup',
  function(req, res) {
    res.render('signup');
  });

app.post('/signup',
  function(req, res) {
    new User({
      username: req.body.username,
      password: req.body.password
    }).fetch().then(function(found) {
      var hash = bcrypt.hashSync(req.body.password);

      Users.create({
        username: req.body.username,
        password: hash
      });
      res.redirect('/');
    });
  }
);





/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({
    code: req.params[0]
  }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;

// CODE EXAMPLES BELOW --------------------------

//

// app.use(session({
//   cookieName: 'session',
//   secret: 'random_string_goes_here',
//   duration: 30 * 60 * 1000,
//   activeDuration: 5 * 60 * 1000,
// }));

//  // --------------

// app.use(function(req, res, next) {
//   if (req.session && req.session.user) {
//     User.findOne({ email: req.session.user.email }, function(err, user) {
//       if (user) {
//         req.user = user;
//         delete req.user.password; // delete the password from the session
//         req.session.user = user;  //refresh the session value
//         res.locals.user = user;
//       }
//       // finishing processing the middleware and run the route
//       next();
//     });
//   } else {
//     next();
//   }
// });

// //---------

// function requireLogin (req, res, next) {
//   if (!req.user) {
//     res.redirect('/login');
//   } else {
//     next();
//   }
// };

// //-------

// app.get('/dashboard', requireLogin, function(req, res) {
//   res.render('dashboard.jade');
// });

// //---------
