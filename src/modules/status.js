// Module imports.
var cheerio = require('cheerio');

// Private property.
var statusurl = 'http://3t.no/www/Min_Side/Bookinger/';

module.exports = {
  // For tests.
  overrideUrl: function(url) {
    statusurl = url;
  },
  // The work horse.
  getStatus: function(request, callback) {
    // Send request using a injected request, as this will contain the
    // auth cookie.
    request({
      url: statusurl,
      followAllRedirects: true,
      method: 'GET',
      jar: true
    }, function(err, res, body) {
      if (err) {
        callback(err);
        return;
      }
      // Do some parsing.
      var $ = cheerio.load(body);
      if ($('.my_booked_activitites table tr').length > 0) {
        // Oh yeah, we got it.
        var result = [];
        $('.my_booked_activitites table tr').each(function(i, n) {
          // Find date and booking type.
          var row = [];
          $(this).find('td').each(function(j, m) {
            if (j < 3) {
              row.push($(this).text());
            }
            if (j === 3) {
              // Try to find cancel booking id.
              var b = $(this).find('button');
              var id = b.attr('data-cancelid');
              row.push(id);
            }
          });
          if (row.length) {
            result.push(row);
          }
        });
        callback(null, result);
      }
      else {
        callback(err, []);
      }
    });
  }
};
