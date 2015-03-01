module.exports = unbook;

function unbook(opts, callback) {
  if (!opts || !opts.id) {
    callback(new Error('No id to unbook'));
    return;
  }
  if (!opts.security) {
    callback(new Error('Need security token'));
    return;
  }
  var request = opts.request;
  if (!request) {
    request = require('request');
  }
  var url = opts.url;
  if (!opts.url) {
    url = 'http://3t.no/wp-admin/admin-ajax.php';
  }
  request({
    uri: url,
    method: 'POST',
    jar: true,
    form: {
      action: 'cancel_service',
      security: opts.security,
      order_id: opts.id
    }
  }, callback);

}
