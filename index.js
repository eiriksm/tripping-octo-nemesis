var config = require('yaml-config');
var colors = require('colors');
var util = require('util');
var request = require('request');
var r = request.defaults({jar: true});
var async = require('async');
var moment = require('moment');

// Try to init config.
var settings = config.readConfig('./config.yml');
var loginurl = 'http://3t.no/scripts/brpHandlerV2.groovy';
var bookingurl = 'http://3t.no/scripts/brpHandlerV2.groovy';

var login = function(settings, callback) {
  r({
    url: loginurl,
    followAllRedirects: true,
    method: 'POST',
    jar: true,
    form: {
      action: 'signon',
      redirect: 'http://3t.no/www/Min_Side/',
      redirect_error: 'http://3t.no/www/Min_Side/',
      username: settings.username,
      password: settings.password
    }
  }, function(err, res, body) {
    callback(err, 'cool');
  });
};

var book = function(delta, settings, callback) {
  // Get day of week.
  var m = moment().day(settings.dayOfWeek);
  if (m.unix() < moment().unix()) {
    m.add('days', 7);
  }
  var day = m.format('YYYY-MM-DD');
  r({
    url: bookingurl,
    followAllRedirects: true,
    method: 'POST',
    jar: true,
    form: {
      action: 'book_squash',
      businessunitid: 1,
      start_date: day,
      start_time: settings.times[delta],
      resource_requirement_id: 348,
      resource_id: 6,
      service: 352,
      json: true
    }
  }, function(err, res, body) {
    callback(err, JSON.parse(body));
  });
};

var start = function(settings) {
  // First log in.
  async.series([
    function(callback) {
      login(settings, callback);
    },
    function(callback) {
      book(0, settings, callback);
    },
    function(callback) {
      book(1, settings, callback);
    }
  ], function(err, results) {
    if (err || results[0].error || results[1].error) {
      console.error('Trouble booking stuff.'.red);
    }
  });
};

var init = function(settings) {
  if (!settings || !settings.username) {
    console.error('Problems reading config. Exiting.'.red);
    console.error(util.format('Please copy %s to %s and edit the settings for you.', 'default.config.yml'.yellow, 'config.yml'.yellow));
    return false;
  }
  else {
    start(settings);
    return true;
  }
};
init(settings);
exports.init = init;
exports.start = start;
