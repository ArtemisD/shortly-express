var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  initialize: function() {
    this.on('creating', function(model, attributes, options) {
      model.set('username', model.attributes.username);
      model.set('password', model.attributes.password);
    });
  },
  //hash pw function
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

});

module.exports = User;
