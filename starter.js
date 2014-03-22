var config = require('yaml-config');
// Try to init config.
var settings = config.readConfig('./config.yml');

require('./src/app').init(settings);
