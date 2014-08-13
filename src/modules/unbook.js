module.exports = unbook;

function unbook(opts, callback) {
  if (!opts || !opts.id) {
    callback(new Error('No id to unbook'));
    return;
  }
  var request = opts.request;
  if (!request) {
    request = require('request');
  }
  var url = opts.url;
  if (!opts.url) {
    url = 'http://3t.no/scripts/brpHandlerV2.groovy?action=delete_squash_or_cageball_booking&json=true&order_id=';
  }
  // Append order id.
  url = url + opts.id;
  request({
    uri: url,
    followAllRedirects: true,
    method: 'GET',
    jar: true
  }, callback);

}
