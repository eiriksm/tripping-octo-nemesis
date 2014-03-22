var config = require('yaml-config');
// Try to init config.
var settings = config.readConfig('./config.yml');
var octo = require('./src/app');

octo.init(settings, false, function(err, res) {
  // Then try to get status.
  octo.status(function(err, res) {
    console.log(err, res);
  });
});
