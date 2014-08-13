var colors = require('colors');
var util = require('util');
var request = require('request');
var r = request.defaults({jar: true});
var async = require('async');
var moment = require('moment');

var bookstatus = require('./modules/status');
var unbook = require('./modules/unbook');

var app = {
  log: {
    log: console.log,
    error: console.error
  }
};
app.l = app.log;

var config = {
  loginurl: 'http://3t.no/scripts/brpHandlerV2.groovy',
  bookingurl: 'http://3t.no/scripts/brpHandlerV2.groovy'
};

var login = function(settings, callback) {
  r({
    url: config.loginurl,
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
    callback(err, res);
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
    url: config.bookingurl,
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

var start = function(settings, shouldBook, callback) {
  var serie = [
    function(callback) {
      login(settings, callback);
    }
  ];
  if (shouldBook) {
    serie.push(function(callback) {
      book(0, settings, callback);
    });
    serie.push(function(callback) {
      book(1, settings, callback);
    });
  }

  async.series(serie, function(err, results) {
    if (err || (results[0] && results[0].error) || (results[1] && results[1].error)) {
      app.l.error('Trouble booking stuff.'.red);
      var msg = [];
      if (err) {
        msg.push(err);
      }
      if (results[0] && results[0].error) {
        msg.push(results[0].error);
      }
      if (results[1] && results[1].error) {
        msg.push(results[1].error);
      }
      app.l.error('Error message given: \n'.red, msg);
    }
    if (callback) {
      callback(err, results);
    }
  });
};

var init = function(settings, shouldBook, callback) {
  if (!settings || !settings.username) {
    app.l.error('Problems reading config. Exiting.'.red);
    app.l.error(util.format('Please copy %s to %s and edit the settings for you.', 'default.config.yml'.yellow, 'config.yml'.yellow));
    return false;
  }
  else {
    start(settings, shouldBook, callback);
    return true;
  }
};
exports.init = init;
exports.start = start;
exports.override = function(urlsettings) {
  config = urlsettings;
};
exports.status = function(callback) {
  bookstatus.getStatus(r, function(err, res) {
    callback(err, res);
  });
};
exports.unbook = function(id, callback) {
  unbook({id: id, request: r}, callback);
};
exports.app = app;
