'use strict';
// Private property.
var statusurl = 'http://3t.no/wp-admin/admin-ajax.php';

module.exports = {
  // For tests.
  overrideUrl: function(url) {
    statusurl = url;
  },
  // The work horse.
  getStatus: function(opts, callback) {
    var request = opts.request;
    // Send request using a injected request, as this will contain the
    // auth cookie.
    request({
      url: statusurl,
      followAllRedirects: true,
      method: 'POST',
      jar: true,
      form: {
        action: 'load_service_bookings',
        security: opts.security
      }
    }, function(err, res, body) {
      if (err) {
        callback(err);
        return;
      }
      var jsonData;
      try {
        jsonData = JSON.parse(body);
      }
      catch (jsonErr) {
        callback(jsonErr);
        return;
      }
      callback(null, jsonData.data);
    });
  }
};
