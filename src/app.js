'use strict';
var cheerio = require('cheerio');
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
  loginurl: 'http://3t.no/wp-admin/admin-ajax.php',
  frontpageUrl: 'http://3t.no'
};
var sec;

var login = function(settings, callback) {
  // First load homepage.
  r({
    url: config.frontpageUrl,
    followAllRedirects: true,
    jar: true
  }, function(frontErr, frontRes, frontBody) {
    if (frontErr) {
      callback(frontErr);
      return;
    }
    // Load the html as a DOM tree.
    var $ = cheerio.load(frontBody);
    // Get javascript variables from the page in a hacky way.
    $('script').each(function(i, n) {
      var t = $(n).text();
      if (t.indexOf('brp_ajax_object') > 0) {
        // Cut away what we don't need.
        sec = JSON.parse(t.substring(t.indexOf('var') + 22, t.indexOf(';')));
      }
    });
    // Now try to log in.
    r({
      url: config.loginurl,
      method: 'POST',
      jar: true,
      form: {
        action: 'login',
        security: sec.security,
        username: settings.username,
        password: settings.password,
        remember: false
      }
    }, function(loginErr, loginRes) {
      callback(loginErr, {
        res: loginRes,
        sec: sec
      });
    });
  });
};

var book = function(delta, settings, callback) {

  // Get day of week.
  var m = moment().day(settings.dayOfWeek);
  if (m.unix() < moment().unix()) {
    m.add(7, 'days');
  }
  var day = m.format('YYYY-MM-DD');
  var time = settings.times[delta];
  // First get all available squashis.
  r({
    url: config.loginurl,
    method: 'POST',
    jar: true,
    form: {
      action: 'load_squash',
      security: sec.security
    }
  }, function(squashErr, squashRes, squashBody) {
    if (squashErr) {
      callback(squashErr);
      return;
    }
    var jsonData;
    try {
      jsonData = JSON.parse(squashBody);
    }
    catch (jsonErr) {
      callback(jsonErr);
      return;
    }
    try {
      // First take a note of the gym name.
      var gym = jsonData.data.gyms[settings.businessUnit];
      // Then see if this gym has anything available.
      if (!jsonData.data.data[day][time][gym]) {
        callback(new Error('Packed at this time dear sir/madam'));
        return;
      }
      // See if we can find the favorite court.
      var order;
      for (var prop in jsonData.data.data[day][time][gym]) {
        var n = jsonData.data.data[day][time][gym][prop];
        if (n.court_id === settings.preferredCourt) {
          order = n;
        }
      }
      if (!order) {
        // If we can't have our favourite, take the first one.
        order = jsonData.data.data[day][time][gym][Object.keys(jsonData.data.data[day][time][gym])[0]];
      }
      if (!order) {
        // If we now have no order, then something is horribly wrong.
        callback(new Error('Should have order ready, have no order ready'));
        return;
      }
      // Post a request about this.
      r({
        jar: true,
        url: config.loginurl,
        method: 'POST',
        form: {
          action: 'book_service',
          security: sec.security,
          product_id: order.product_id,
          gym_id: order.gym_id,
          resource_id: order.court_id,
          resource_requirement_id: order.resource_requirement_id,
          date: day,
          time: time,
          return_url: 'http://3t.no/timeplan/#modal'
        }
      }, function(bookErr, bookRes, bookBody) {
        if (bookErr) {
          callback(bookErr);
          return;
        }
        var bookJson;
        try {
          bookJson = JSON.parse(bookBody);
        }
        catch (bookJsonErr) {
          callback(bookJsonErr);
          return;
        }
        if (bookJson.data.error) {
          callback(new Error(bookJson.data.error));
          return;
        }
        callback(null, bookJson);
      });
    }
    catch (parseErr) {
      callback(parseErr);
    }
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
  bookstatus.getStatus({
    request: r,
    security: sec.security
  }, function(err, res) {
    callback(err, res);
  });
};
exports.unbook = function(id, callback) {
  unbook({id: id, request: r}, callback);
};
exports.app = app;
